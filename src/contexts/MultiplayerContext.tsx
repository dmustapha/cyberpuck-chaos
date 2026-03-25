'use client';

/**
 * MultiplayerContext - Shared WebSocket connection for multiplayer games
 *
 * This context maintains a single WebSocket connection that persists across
 * screen transitions (waiting -> ready -> playing), preventing connection
 * drops when components unmount/remount.
 *
 */

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import type { ActiveModifier, ModifierType, ModifierVariation, ModifierTarget } from '../types/game';

// Server message types
interface ServerGameState {
  puck: { x: number; y: number; vx: number; vy: number };
  paddle1: { x: number; y: number };
  paddle2: { x: number; y: number };
  score: { player1: number; player2: number };
}

type GameStatus = 'waiting' | 'countdown' | 'playing' | 'paused' | 'resuming' | 'ended';

type PauseReason = 'player_pause' | 'opponent_pause' | 'connection_lost' | 'opponent_disconnected';

interface PauseState {
  isPaused: boolean;
  reason: PauseReason | null;
  pausedBy: 1 | 2 | null;
  canResume: boolean;
  gracePeriodMs?: number;
  resumeCountdown: number | null;
}

interface OpponentQuitState {
  hasQuit: boolean;
  winner: 1 | 2 | null;
  finalScore: { player1: number; player2: number } | null;
}

interface RematchState {
  // true when we have requested a rematch and are waiting for response
  waitingForResponse: boolean;
  // true when opponent has requested a rematch and we need to respond
  opponentRequested: boolean;
  // true when rematch was accepted and game is restarting
  accepted: boolean;
  // true when rematch was declined
  declined: boolean;
}

interface OpponentExitedState {
  hasExited: boolean;
}

type ServerMessage =
  | { type: 'room-joined'; gameId: string; playerNumber: 1 | 2 }
  | { type: 'opponent-joined'; opponentId: string }
  | { type: 'opponent-disconnected' }
  | { type: 'countdown'; seconds: number }
  | { type: 'state-update'; puck: ServerGameState['puck']; paddle1: ServerGameState['paddle1']; paddle2: ServerGameState['paddle2']; score: ServerGameState['score']; timestamp: number }
  | { type: 'goal'; scorer: 1 | 2; newScore: { player1: number; player2: number } }
  | { type: 'game-over'; winner: 1 | 2; finalScore: { player1: number; player2: number } }
  | { type: 'error'; code: string; message: string }
  | { type: 'pong' }
  | { type: 'game-paused'; reason: PauseReason; pausedBy: 1 | 2 | null; canResume: boolean; gracePeriodMs?: number }
  | { type: 'resume-countdown'; seconds: number }
  | { type: 'game-resumed' }
  | { type: 'opponent-quit'; winner: 1 | 2; finalScore: { player1: number; player2: number } }
  | { type: 'rematch-requested' }
  | { type: 'rematch-accepted' }
  | { type: 'rematch-declined' }
  | { type: 'opponent-exited' }
  | { type: 'MODIFIER_APPLIED'; modifier: { id: string; type: ModifierType; variation: ModifierVariation; target: ModifierTarget; duration: number; reason: string; startTime: number } }
  | { type: 'MODIFIER_EXPIRED'; modifierId: string };

interface MultiplayerContextValue {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Game state
  gameState: ServerGameState | null;
  playerNumber: 1 | 2 | null;
  opponentJoined: boolean;
  countdown: number | null;
  gameStatus: GameStatus;
  winner: 1 | 2 | null;

  // Pause state
  pauseState: PauseState;
  opponentQuit: OpponentQuitState;

  // Modifier state
  activeModifier: ActiveModifier | null;

  // Rematch state
  rematchState: RematchState;
  opponentExited: OpponentExitedState;

  // WebSocket Actions
  connect: (gameId: string, playerId: string) => void;
  disconnect: () => void;
  sendPaddleMove: (x: number, y: number) => void;
  sendPauseRequest: () => void;
  sendResumeRequest: () => void;
  sendQuitGame: () => void;
  sendRematchRequest: () => void;
  sendRematchResponse: (accepted: boolean) => void;
  sendPlayerExit: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

const WS_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:3001/ws`)
  : 'ws://localhost:3001/ws';

const THROTTLE_MS = 16; // 60fps

export function MultiplayerProvider({ children }: { children: React.ReactNode }) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Game state
  const [gameState, setGameState] = useState<ServerGameState | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  // Pause state
  const [pauseState, setPauseState] = useState<PauseState>({
    isPaused: false,
    reason: null,
    pausedBy: null,
    canResume: false,
    gracePeriodMs: undefined,
    resumeCountdown: null,
  });

  // Opponent quit state
  const [opponentQuit, setOpponentQuit] = useState<OpponentQuitState>({
    hasQuit: false,
    winner: null,
    finalScore: null,
  });

  // Rematch state
  const [rematchState, setRematchState] = useState<RematchState>({
    waitingForResponse: false,
    opponentRequested: false,
    accepted: false,
    declined: false,
  });

  // Opponent exited state
  const [opponentExited, setOpponentExited] = useState<OpponentExitedState>({
    hasExited: false,
  });

  // Modifier state
  const [activeModifier, setActiveModifier] = useState<ActiveModifier | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const currentGameIdRef = useRef<string | null>(null);
  const currentPlayerIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPongRef = useRef<number>(Date.now());
  const lastPaddleSendRef = useRef(0);
  const pendingMoveRef = useRef<{ x: number; y: number } | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameStatusRef = useRef<GameStatus>('waiting');

  // Keep gameStatusRef in sync
  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  // Heartbeat functions
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatIntervalRef.current = setInterval(() => {
      if (Date.now() - lastPongRef.current > 30000) {
        console.warn('[MultiplayerContext] No pong received in 30s, reconnecting...');
        if (wsRef.current) {
          wsRef.current.close(4001, 'Heartbeat timeout');
        }
        return;
      }
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000);
  }, [stopHeartbeat]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    stopHeartbeat();
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [stopHeartbeat]);

  // Reset game state
  const resetGameState = useCallback(() => {
    setGameState(null);
    setPlayerNumber(null);
    setOpponentJoined(false);
    setCountdown(null);
    setGameStatus('waiting');
    gameStatusRef.current = 'waiting';
    setWinner(null);
    setPauseState({
      isPaused: false,
      reason: null,
      pausedBy: null,
      canResume: false,
      gracePeriodMs: undefined,
      resumeCountdown: null,
    });
    setOpponentQuit({
      hasQuit: false,
      winner: null,
      finalScore: null,
    });
    setRematchState({
      waitingForResponse: false,
      opponentRequested: false,
      accepted: false,
      declined: false,
    });
    setOpponentExited({
      hasExited: false,
    });
  }, []);

  // Send message helper
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Throttled paddle move
  const sendPaddleMove = useCallback((x: number, y: number) => {
    const now = Date.now();
    const timeSinceLastSend = now - lastPaddleSendRef.current;

    if (timeSinceLastSend >= THROTTLE_MS) {
      lastPaddleSendRef.current = now;
      sendMessage({ type: 'paddle-move', x, y, timestamp: now });
      pendingMoveRef.current = null;
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
    } else {
      pendingMoveRef.current = { x, y };
      if (!throttleTimeoutRef.current) {
        const remainingTime = THROTTLE_MS - timeSinceLastSend;
        throttleTimeoutRef.current = setTimeout(() => {
          if (pendingMoveRef.current) {
            const ts = Date.now();
            lastPaddleSendRef.current = ts;
            sendMessage({ type: 'paddle-move', ...pendingMoveRef.current, timestamp: ts });
            pendingMoveRef.current = null;
          }
          throttleTimeoutRef.current = null;
        }, remainingTime);
      }
    }
  }, [sendMessage]);

  // Send pause request
  const sendPauseRequest = useCallback(() => {
    console.log('[MultiplayerContext] Sending pause request');
    sendMessage({ type: 'pause-request' });
  }, [sendMessage]);

  // Send resume request
  const sendResumeRequest = useCallback(() => {
    console.log('[MultiplayerContext] Sending resume request');
    sendMessage({ type: 'resume-request' });
  }, [sendMessage]);

  // Send quit game request
  const sendQuitGame = useCallback(() => {
    console.log('[MultiplayerContext] Sending quit game request');
    sendMessage({ type: 'quit-game' });
  }, [sendMessage]);

  // Send rematch request
  const sendRematchRequest = useCallback(() => {
    console.log('[MultiplayerContext] Sending rematch request');
    setRematchState(prev => ({ ...prev, waitingForResponse: true }));
    sendMessage({ type: 'rematch-request' });
  }, [sendMessage]);

  // Send rematch response
  const sendRematchResponse = useCallback((accepted: boolean) => {
    console.log('[MultiplayerContext] Sending rematch response:', accepted);
    sendMessage({ type: 'rematch-response', accepted });
    // Clear the opponent requested flag since we responded
    setRematchState(prev => ({ ...prev, opponentRequested: false }));
  }, [sendMessage]);

  // Send player exit
  const sendPlayerExit = useCallback(() => {
    console.log('[MultiplayerContext] Sending player exit');
    sendMessage({ type: 'player-exit' });
  }, [sendMessage]);

  // Connect to game
  const connect = useCallback((gameId: string, playerId: string) => {
    // If already connected to this game, don't reconnect
    if (wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        currentGameIdRef.current === gameId &&
        currentPlayerIdRef.current === playerId) {
      console.log('[MultiplayerContext] Already connected to this game');
      return;
    }

    // If connecting to a different game, cleanup first
    if (currentGameIdRef.current !== gameId || currentPlayerIdRef.current !== playerId) {
      cleanup();
      resetGameState();
    }

    currentGameIdRef.current = gameId;
    currentPlayerIdRef.current = playerId;

    const doConnect = () => {
      setIsConnecting(true);
      setConnectionError(null);

      console.log('[MultiplayerContext] Connecting to', WS_URL);
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[MultiplayerContext] Connected, joining room');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttemptRef.current = 0;

        // Reset lastPong when connecting - critical fix to prevent immediate heartbeat timeout
        lastPongRef.current = Date.now();

        ws.send(JSON.stringify({
          type: 'join-room',
          gameId,
          playerId,
        }));

        startHeartbeat();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ServerMessage;

          switch (message.type) {
            case 'room-joined':
              console.log('[MultiplayerContext] Joined room as player', message.playerNumber);
              setPlayerNumber(message.playerNumber);
              setGameStatus('waiting');
              gameStatusRef.current = 'waiting';
              break;

            case 'opponent-joined':
              console.log('[MultiplayerContext] Opponent joined');
              setOpponentJoined(true);
              break;

            case 'opponent-disconnected':
              console.log('[MultiplayerContext] Opponent disconnected');
              setOpponentJoined(false);
              setGameStatus('waiting');
              gameStatusRef.current = 'waiting';
              setCountdown(null);
              break;

            case 'countdown':
              console.log('[MultiplayerContext] Countdown:', message.seconds);
              setGameStatus('countdown');
              gameStatusRef.current = 'countdown';
              setCountdown(message.seconds);
              // Reset rematch state when a new game/rematch starts
              setRematchState({
                waitingForResponse: false,
                opponentRequested: false,
                accepted: false,
                declined: false,
              });
              break;

            case 'state-update':
              setGameState({
                puck: message.puck,
                paddle1: message.paddle1,
                paddle2: message.paddle2,
                score: message.score,
              });
              if (gameStatusRef.current === 'countdown' || gameStatusRef.current === 'waiting') {
                console.log('[MultiplayerContext] First state-update received, transitioning to playing');
                setGameStatus('playing');
                gameStatusRef.current = 'playing';
                setCountdown(null);
              }
              break;

            case 'goal':
              setGameState((prev) => prev ? { ...prev, score: message.newScore } : null);
              break;

            case 'game-over':
              setWinner(message.winner);
              setGameStatus('ended');
              gameStatusRef.current = 'ended';
              setGameState((prev) => prev ? { ...prev, score: message.finalScore } : null);
              break;

            case 'error':
              console.error('[MultiplayerContext] Error:', message.message);
              setConnectionError(message.message);
              break;

            case 'pong':
              lastPongRef.current = Date.now();
              break;

            case 'game-paused':
              console.log('[MultiplayerContext] Game paused:', message.reason);
              setGameStatus('paused');
              gameStatusRef.current = 'paused';
              setPauseState({
                isPaused: true,
                reason: message.reason,
                pausedBy: message.pausedBy,
                canResume: message.canResume,
                gracePeriodMs: message.gracePeriodMs,
                resumeCountdown: null,
              });
              break;

            case 'resume-countdown':
              console.log('[MultiplayerContext] Resume countdown:', message.seconds);
              setGameStatus('resuming');
              gameStatusRef.current = 'resuming';
              setPauseState((prev) => ({
                ...prev,
                resumeCountdown: message.seconds,
              }));
              break;

            case 'game-resumed':
              console.log('[MultiplayerContext] Game resumed');
              setGameStatus('playing');
              gameStatusRef.current = 'playing';
              setPauseState({
                isPaused: false,
                reason: null,
                pausedBy: null,
                canResume: false,
                gracePeriodMs: undefined,
                resumeCountdown: null,
              });
              break;

            case 'opponent-quit':
              console.log('[MultiplayerContext] Opponent quit, winner:', message.winner);
              setOpponentQuit({
                hasQuit: true,
                winner: message.winner,
                finalScore: message.finalScore,
              });
              setWinner(message.winner);
              setGameStatus('ended');
              gameStatusRef.current = 'ended';
              setGameState((prev) => prev ? { ...prev, score: message.finalScore } : null);
              break;

            case 'rematch-requested':
              console.log('[MultiplayerContext] Opponent requested rematch');
              setRematchState(prev => ({ ...prev, opponentRequested: true }));
              break;

            case 'rematch-accepted':
              console.log('[MultiplayerContext] Rematch accepted, restarting game');
              // Reset game state but keep connection
              setRematchState({
                waitingForResponse: false,
                opponentRequested: false,
                accepted: true,
                declined: false,
              });
              // Reset other game states for new match
              setWinner(null);
              setOpponentQuit({ hasQuit: false, winner: null, finalScore: null });
              setOpponentExited({ hasExited: false });
              // Server will send countdown messages next
              break;

            case 'rematch-declined':
              console.log('[MultiplayerContext] Rematch declined');
              setRematchState(prev => ({
                ...prev,
                waitingForResponse: false,
                opponentRequested: false,
                declined: true,
              }));
              break;

            case 'opponent-exited':
              console.log('[MultiplayerContext] Opponent exited');
              setOpponentExited({ hasExited: true });
              // Clear any rematch state
              setRematchState({
                waitingForResponse: false,
                opponentRequested: false,
                accepted: false,
                declined: false,
              });
              break;

            case 'MODIFIER_APPLIED': {
              const mod = message.modifier;
              setActiveModifier({
                id: mod.id,
                type: mod.type,
                variation: mod.variation,
                target: mod.target,
                intensity: 1,
                duration: mod.duration,
                reason: mod.reason,
                startTime: mod.startTime,
                expiresAt: mod.startTime + mod.duration,
              });
              break;
            }

            case 'MODIFIER_EXPIRED':
              setActiveModifier(null);
              break;
          }
        } catch (err) {
          console.error('[MultiplayerContext] Failed to parse message:', err);
        }
      };

      ws.onerror = () => {
        setConnectionError('Connection error');
      };

      ws.onclose = (event) => {
        console.log('[MultiplayerContext] WebSocket closed', event.code);
        setIsConnected(false);
        wsRef.current = null;
        stopHeartbeat();

        // Don't reconnect if game ended or intentional close
        if (gameStatusRef.current === 'ended' || event.code >= 4000) {
          return;
        }

        // Reconnect with backoff
        if (reconnectAttemptRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
          reconnectAttemptRef.current++;
          setIsConnecting(true);
          reconnectTimeoutRef.current = setTimeout(doConnect, delay);
        } else {
          setConnectionError('Failed to connect after multiple attempts');
          setIsConnecting(false);
        }
      };
    };

    doConnect();
  }, [cleanup, resetGameState, startHeartbeat, stopHeartbeat]);

  // Disconnect
  const disconnect = useCallback(() => {
    console.log('[MultiplayerContext] Disconnecting');
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
    currentGameIdRef.current = null;
    currentPlayerIdRef.current = null;
    resetGameState();
  }, [cleanup, resetGameState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const value: MultiplayerContextValue = {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    // Game state
    gameState,
    playerNumber,
    opponentJoined,
    countdown,
    gameStatus,
    winner,
    // Pause state
    pauseState,
    opponentQuit,
    // Modifier state
    activeModifier,
    // Rematch state
    rematchState,
    opponentExited,
    // WebSocket Actions
    connect,
    disconnect,
    sendPaddleMove,
    sendPauseRequest,
    sendResumeRequest,
    sendQuitGame,
    sendRematchRequest,
    sendRematchResponse,
    sendPlayerExit,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayerContext() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayerContext must be used within a MultiplayerProvider');
  }
  return context;
}

export type { ServerGameState, GameStatus, PauseState, PauseReason, OpponentQuitState, RematchState, OpponentExitedState };
