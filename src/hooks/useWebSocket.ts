'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  ClientMessage,
  ServerMessage,
  MultiplayerState,
  ConnectionStatus,
  LobbyState,
  NetworkPuckState,
  NetworkPaddleState,
} from '@/types/websocket';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
const RECONNECT_BASE_DELAY = 1000; // Start with 1s delay
const RECONNECT_MAX_DELAY = 10000; // Cap at 10s
const PING_INTERVAL = 15000; // Ping every 15s to keep Render awake (free tier sleeps after 15min)
const MAX_RECONNECT_ATTEMPTS = 10; // More attempts for free tier servers
const CONNECTION_TIMEOUT = 10000; // 10s timeout for initial connection

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onPuckUpdate?: (state: NetworkPuckState) => void;
  onOpponentPaddle?: (state: NetworkPaddleState) => void;
  onGameStart?: (playerNumber: 1 | 2) => void;
  onGoalConfirmed?: (scorer: 'player1' | 'player2', scores: { player1: number; player2: number }) => void;
  onGameOver?: (winner: 'player1' | 'player2', scores: { player1: number; player2: number }) => void;
  onOpponentLeft?: () => void;
}

const initialState: MultiplayerState = {
  connectionStatus: 'disconnected',
  playerId: null,
  roomId: null,
  playerNumber: null,
  isHost: false,
  opponentConnected: false,
  opponentReady: false,
  lobbyState: 'idle',
  error: null,
  latency: 0,
};

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = false,
    onPuckUpdate,
    onOpponentPaddle,
    onGameStart,
    onGoalConfirmed,
    onGameOver,
    onOpponentLeft,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastPingSentRef = useRef<number>(0);
  const isUnmountedRef = useRef(false);

  const [state, setState] = useState<MultiplayerState>(initialState);

  // Stable callback refs to avoid stale closures
  const callbacksRef = useRef({
    onPuckUpdate,
    onOpponentPaddle,
    onGameStart,
    onGoalConfirmed,
    onGameOver,
    onOpponentLeft,
  });

  // Update callback refs when they change
  useEffect(() => {
    callbacksRef.current = {
      onPuckUpdate,
      onOpponentPaddle,
      onGameStart,
      onGoalConfirmed,
      onGameOver,
      onOpponentLeft,
    };
  }, [onPuckUpdate, onOpponentPaddle, onGameStart, onGoalConfirmed, onGameOver, onOpponentLeft]);

  // Clear all timeouts/intervals
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // Send message to server
  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'connected':
        setState(s => ({
          ...s,
          playerId: message.playerId,
          connectionStatus: 'connected',
          lobbyState: 'idle',
          error: null,
        }));
        reconnectAttemptsRef.current = 0;
        break;

      case 'room-created':
        setState(s => ({
          ...s,
          roomId: message.roomId,
          lobbyState: 'waiting',
        }));
        break;

      case 'room-joined':
        setState(s => ({
          ...s,
          roomId: message.roomId,
          playerNumber: message.playerNumber,
          isHost: message.playerNumber === 1,
          lobbyState: s.lobbyState === 'waiting' ? 'waiting' : 'opponent-joined',
        }));
        break;

      case 'opponent-joined':
        setState(s => ({
          ...s,
          opponentConnected: true,
          lobbyState: 'opponent-joined',
        }));
        break;

      case 'opponent-left':
        setState(s => ({
          ...s,
          opponentConnected: false,
          opponentReady: false,
          lobbyState: s.lobbyState === 'playing' ? 'ended' : 'waiting',
        }));
        callbacksRef.current.onOpponentLeft?.();
        break;

      case 'opponent-ready':
        setState(s => ({ ...s, opponentReady: true }));
        break;

      case 'game-start':
        setState(s => ({
          ...s,
          playerNumber: message.yourNumber,
          isHost: message.yourNumber === 1,
          lobbyState: 'playing',
        }));
        callbacksRef.current.onGameStart?.(message.yourNumber);
        break;

      case 'opponent-paddle':
        callbacksRef.current.onOpponentPaddle?.({
          x: message.x,
          y: message.y,
          timestamp: Date.now(),
        });
        break;

      case 'puck-update':
        callbacksRef.current.onPuckUpdate?.({
          x: message.x,
          y: message.y,
          vx: message.vx,
          vy: message.vy,
          seq: message.seq,
          timestamp: Date.now(),
        });
        break;

      case 'goal-confirmed':
        callbacksRef.current.onGoalConfirmed?.(message.scorer, message.scores);
        break;

      case 'game-over':
        setState(s => ({ ...s, lobbyState: 'ended' }));
        callbacksRef.current.onGameOver?.(message.winner, message.scores);
        break;

      case 'error':
        setState(s => ({ ...s, error: message.message }));
        // Reset lobby state on certain errors
        if (message.code === 'JOIN_FAILED' || message.code === 'CREATE_FAILED') {
          setState(s => ({ ...s, lobbyState: 'idle' }));
        }
        break;

      case 'pong':
        const latency = Date.now() - lastPingSentRef.current;
        setState(s => ({ ...s, latency }));
        break;
    }
  }, []);

  // Wake up the server (for Render free tier)
  const wakeUpServer = useCallback(async () => {
    try {
      // Hit the health endpoint to wake up the server
      const healthUrl = WS_URL.replace('wss://', 'https://').replace('ws://', 'http://') + '/health';
      console.log('[WebSocket] Waking up server...', healthUrl);
      const response = await fetch(healthUrl, { method: 'GET' });
      if (response.ok) {
        console.log('[WebSocket] Server is awake');
        return true;
      }
    } catch (e) {
      console.log('[WebSocket] Server wake-up request sent (may take 30-60s on free tier)');
    }
    return false;
  }, []);

  // Connect to server
  const connect = useCallback(async () => {
    if (isUnmountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    clearTimers();

    setState(s => ({ ...s, connectionStatus: 'connecting' }));

    // Try to wake up server first (for Render free tier)
    await wakeUpServer();

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    // Connection timeout
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        console.log('[WebSocket] Connection timeout, retrying...');
        ws.close();
      }
    }, CONNECTION_TIMEOUT);

    ws.onopen = () => {
      clearTimeout(connectionTimeout);
      if (isUnmountedRef.current) {
        ws.close();
        return;
      }
      console.log('[WebSocket] Connected to', WS_URL);

      // Start ping interval to keep server awake
      pingIntervalRef.current = setInterval(() => {
        lastPingSentRef.current = Date.now();
        send({ type: 'ping' });
      }, PING_INTERVAL);
    };

    ws.onclose = () => {
      if (isUnmountedRef.current) return;

      clearTimers();
      setState(s => ({
        ...s,
        connectionStatus: 'disconnected',
      }));

      // Attempt reconnection with exponential backoff and jitter
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        setState(s => ({ ...s, connectionStatus: 'reconnecting' }));

        // Exponential backoff: 1s, 2s, 4s, 8s, 10s (capped)
        const baseDelay = Math.min(
          RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1),
          RECONNECT_MAX_DELAY
        );
        // Add 0-30% jitter to prevent thundering herd
        const jitter = Math.random() * 0.3 * baseDelay;
        const delay = baseDelay + jitter;

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`[WebSocket] Reconnecting (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          connect();
        }, delay);
      } else {
        setState(s => ({
          ...s,
          error: 'Connection lost. Please refresh the page.',
        }));
      }
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };

    ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e);
      }
    };
  }, [clearTimers, send, handleMessage, wakeUpServer]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(initialState);
    reconnectAttemptsRef.current = 0;
  }, [clearTimers]);

  // Room actions
  const createRoom = useCallback((roomId?: string, scoreToWin?: number) => {
    setState(s => ({ ...s, lobbyState: 'creating', error: null }));
    send({ type: 'create-room', roomId, scoreToWin });
  }, [send]);

  const joinRoom = useCallback((roomId: string) => {
    setState(s => ({ ...s, lobbyState: 'joining', error: null }));
    send({ type: 'join-room', roomId: roomId.toUpperCase().trim() });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: 'leave-room' });
    setState(s => ({
      ...s,
      roomId: null,
      playerNumber: null,
      isHost: false,
      opponentConnected: false,
      opponentReady: false,
      lobbyState: 'idle',
      error: null,
    }));
  }, [send]);

  const setReady = useCallback(() => {
    send({ type: 'ready' });
    setState(s => ({ ...s, lobbyState: 'ready' }));
  }, [send]);

  // Game actions
  const sendPaddle = useCallback((x: number, y: number) => {
    send({ type: 'paddle-move', x, y });
  }, [send]);

  const sendPuck = useCallback((x: number, y: number, vx: number, vy: number, seq: number) => {
    send({ type: 'puck-state', x, y, vx, vy, seq });
  }, [send]);

  const sendGoal = useCallback((scorer: 'player1' | 'player2') => {
    send({ type: 'goal-scored', scorer });
  }, [send]);

  // Reset error
  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    isUnmountedRef.current = false;

    if (autoConnect) {
      connect();
    }

    return () => {
      isUnmountedRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [autoConnect, connect, clearTimers]);

  return {
    // State
    ...state,

    // Connection
    connect,
    disconnect,
    isConnected: state.connectionStatus === 'connected',

    // Room actions
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,

    // Game actions
    sendPaddle,
    sendPuck,
    sendGoal,

    // Utils
    clearError,
  };
}
