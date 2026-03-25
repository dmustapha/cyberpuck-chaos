import type { WebSocket } from 'ws';

// Player in a room
export interface Player {
  id: string;
  ws: WebSocket;
  playerNumber: 1 | 2;
  ready: boolean;
  lastPing: number;
}

// Game room with server-side score tracking
export interface Room {
  id: string;
  player1: Player | null;
  player2: Player | null;
  status: 'waiting' | 'ready' | 'playing' | 'ended';
  createdAt: number;
  scores: {
    player1: number;
    player2: number;
  };
  scoreToWin: number;
}

// Client -> Server messages
export type ClientMessage =
  | { type: 'create-room'; roomId?: string; scoreToWin?: number }
  | { type: 'join-room'; roomId: string }
  | { type: 'leave-room' }
  | { type: 'ready' }
  | { type: 'paddle-move'; x: number; y: number }
  | { type: 'puck-state'; x: number; y: number; vx: number; vy: number; seq: number }
  | { type: 'goal-scored'; scorer: 'player1' | 'player2' }
  | { type: 'ping' };

// Server -> Client messages
export type ServerMessage =
  | { type: 'connected'; playerId: string }
  | { type: 'room-created'; roomId: string }
  | { type: 'room-joined'; roomId: string; playerNumber: 1 | 2 }
  | { type: 'opponent-joined'; opponentId: string }
  | { type: 'opponent-left' }
  | { type: 'opponent-ready' }
  | { type: 'game-start'; yourNumber: 1 | 2 }
  | { type: 'opponent-paddle'; x: number; y: number }
  | { type: 'puck-update'; x: number; y: number; vx: number; vy: number; seq: number }
  | { type: 'goal-confirmed'; scorer: 'player1' | 'player2'; scores: { player1: number; player2: number } }
  | { type: 'game-over'; winner: 'player1' | 'player2'; scores: { player1: number; player2: number } }
  | { type: 'error'; message: string; code?: string }
  | { type: 'pong'; timestamp: number };

// Rate limiting config
export interface RateLimitConfig {
  maxMessagesPerSecond: number;
  maxRoomsPerPlayer: number;
}

export const RATE_LIMIT: RateLimitConfig = {
  maxMessagesPerSecond: 60, // Allow 60 messages/sec (paddle updates are frequent)
  maxRoomsPerPlayer: 1,
};

export const GAME_CONFIG = {
  defaultScoreToWin: 7,
  maxScoreToWin: 15,
  roomCodeLength: 6,
  maxRoomAgeMs: 3600000, // 1 hour
  pingIntervalMs: 30000, // 30 seconds
  pingTimeoutMs: 60000, // 1 minute without pong = disconnect
};
