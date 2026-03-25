'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// =============================================================================
// Types
// =============================================================================

interface ServerGameState {
  puck: { x: number; y: number; vx: number; vy: number };
  paddle1: { x: number; y: number };
  paddle2: { x: number; y: number };
  score: { player1: number; player2: number };
}

type GameStatus = 'waiting' | 'countdown' | 'playing' | 'ended';

interface UseMultiplayerGameResult {
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

  // Actions
  sendPaddleMove: (x: number, y: number) => void;
  disconnect: () => void;
}

// Server message types (must match server's message-types.ts)
type ServerMessage =
  | { type: 'room-joined'; gameId: string; playerNumber: 1 | 2 }
  | { type: 'opponent-joined'; opponentId: string }
  | { type: 'opponent-disconnected' }
  | { type: 'countdown'; seconds: number }
  | { type: 'state-update'; puck: ServerGameState['puck']; paddle1: ServerGameState['paddle1']; paddle2: ServerGameState['paddle2']; score: ServerGameState['score']; timestamp: number }
  | { type: 'goal'; scorer: 1 | 2; newScore: { player1: number; player2: number } }
  | { type: 'game-over'; winner: 1 | 2; finalScore: { player1: number; player2: number } }
  | { type: 'error'; code: string; message: string }
  | { type: 'pong' };

// =============================================================================
// WebSocket URL
// =============================================================================

const WS_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:3001/ws`)
  : 'ws://localhost:3001/ws';
const THROTTLE_MS = 16; // 60fps

// Debug: Log the WebSocket URL being used
if (typeof window !== 'undefined') {
  console.log('[WebSocket] URL:', WS_URL, '| env:', process.env.NEXT_PUBLIC_WS_URL);
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useMultiplayerGame(
  gameId: string,
  playerId: string
): UseMultiplayerGameResult {
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

  // Refs to avoid re-renders and stale closures
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const gameStatusRef = useRef<GameStatus>('waiting');
  const lastPaddleSendRef = useRef(0);

  // Heartbeat refs
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPongRef = useRef<number>(Date.now());

  // Trailing throttle refs
  const pendingMoveRef = useRef<{ x: number; y: number } | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connection timeout ref
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    stopHeartbeat(); // Clear any existing

    heartbeatIntervalRef.current = setInterval(() => {
      // Check if we've received a pong recently (within 30s)
      if (Date.now() - lastPongRef.current > 30000) {
        console.warn('[WebSocket] No pong received in 30s, connection may be stale');
        // Force reconnect
        if (wsRef.current) {
          wsRef.current.close(4001, 'Heartbeat timeout');
        }
        return;
      }

      // Send ping
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 15000); // Every 15 seconds
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
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
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

  // Send message helper
  const sendMessage = useCallback((message: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Throttled paddle move with trailing send (60fps = 16ms)
  const sendPaddleMove = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      const timeSinceLastSend = now - lastPaddleSendRef.current;

      if (timeSinceLastSend >= THROTTLE_MS) {
        // Can send immediately
        lastPaddleSendRef.current = now;
        sendMessage({ type: 'paddle-move', x, y, timestamp: now });
        pendingMoveRef.current = null;

        // Clear any pending trailing send
        if (throttleTimeoutRef.current) {
          clearTimeout(throttleTimeoutRef.current);
          throttleTimeoutRef.current = null;
        }
      } else {
        // Store for trailing send
        pendingMoveRef.current = { x, y };

        // Set up trailing send if not already scheduled
        if (!throttleTimeoutRef.current) {
          const remainingTime = THROTTLE_MS - timeSinceLastSend;
          throttleTimeoutRef.current = setTimeout(() => {
            if (pendingMoveRef.current) {
              const ts = Date.now();
              lastPaddleSendRef.current = ts;
              sendMessage({
                type: 'paddle-move',
                ...pendingMoveRef.current,
                timestamp: ts
              });
              pendingMoveRef.current = null;
            }
            throttleTimeoutRef.current = null;
          }, remainingTime);
        }
      }
    },
    [sendMessage]
  );

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup();
    setIsConnected(false);
    setIsConnecting(false);
    setGameStatus('ended');
    gameStatusRef.current = 'ended';
  }, [cleanup]);

  // Connect to WebSocket
  useEffect(() => {
    if (!gameId || !playerId) {
      return;
    }

    let isMounted = true; // Guard for state updates

    const connect = () => {
      if (!isMounted) return;

      setIsConnecting(true);
      setConnectionError(null);

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      // Connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
          setConnectionError('Connection timed out');
          wsRef.current.close();
        }
      }, 10000);

      ws.onopen = () => {
        if (!isMounted) {
          ws.close();
          return;
        }

        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttemptRef.current = 0;

        // Send join-room message
        ws.send(
          JSON.stringify({
            type: 'join-room',
            gameId,
            playerId,
          })
        );

        // Start heartbeat
        startHeartbeat();
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;

        try {
          const message = JSON.parse(event.data) as ServerMessage;

          switch (message.type) {
            case 'room-joined':
              setPlayerNumber(message.playerNumber);
              setGameStatus('waiting');
              gameStatusRef.current = 'waiting';
              break;

            case 'opponent-joined':
              setOpponentJoined(true);
              break;

            case 'opponent-disconnected':
              setOpponentJoined(false);
              setGameStatus('waiting');
              gameStatusRef.current = 'waiting';
              setCountdown(null);
              break;

            case 'countdown':
              setGameStatus('countdown');
              gameStatusRef.current = 'countdown';
              setCountdown(message.seconds);
              break;

            case 'state-update':
              setGameState({
                puck: message.puck,
                paddle1: message.paddle1,
                paddle2: message.paddle2,
                score: message.score,
              });
              // Transition to playing when we receive first state update
              if (
                gameStatusRef.current === 'countdown' ||
                gameStatusRef.current === 'waiting'
              ) {
                setGameStatus('playing');
                gameStatusRef.current = 'playing';
                setCountdown(null);
              }
              break;

            case 'goal':
              // Update score immediately from goal message
              setGameState((prev) =>
                prev
                  ? {
                      ...prev,
                      score: message.newScore,
                    }
                  : null
              );
              break;

            case 'game-over':
              setWinner(message.winner);
              setGameStatus('ended');
              gameStatusRef.current = 'ended';
              setGameState((prev) =>
                prev
                  ? {
                      ...prev,
                      score: message.finalScore,
                    }
                  : null
              );
              break;

            case 'error':
              setConnectionError(message.message);
              break;

            case 'pong':
              lastPongRef.current = Date.now();
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        if (!isMounted) return;
        setConnectionError(
          isConnected
            ? 'Connection lost unexpectedly'
            : 'Failed to establish connection'
        );
      };

      ws.onclose = (event) => {
        if (!isMounted) return;

        setIsConnected(false);
        wsRef.current = null;
        stopHeartbeat();

        // Don't reconnect for intentional closes or server rejections
        if (gameStatusRef.current === 'ended' ||
            event.code === 4000 || // Our timeout code
            (event.code >= 4000 && event.code < 5000)) {
          return;
        }

        // Exponential backoff reconnection with jitter (max 5 attempts)
        if (reconnectAttemptRef.current < 5) {
          const baseDelay = Math.min(
            1000 * Math.pow(2, reconnectAttemptRef.current),
            10000
          );
          const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
          const delay = baseDelay + jitter;
          reconnectAttemptRef.current++;

          setIsConnecting(true);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to connect after multiple attempts');
          setIsConnecting(false);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      cleanup();
      stopHeartbeat();
    };
  }, [gameId, playerId, cleanup, startHeartbeat, stopHeartbeat]);

  return {
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

    // Actions
    sendPaddleMove,
    disconnect,
  };
}

// Re-export types for consumers
export type { ServerGameState, GameStatus, UseMultiplayerGameResult };
