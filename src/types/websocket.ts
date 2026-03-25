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

// Connection states
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// Lobby states
export type LobbyState =
  | 'idle'           // Not in any room
  | 'creating'       // Creating a room
  | 'joining'        // Joining a room
  | 'waiting'        // Waiting for opponent
  | 'opponent-joined' // Opponent joined, waiting for ready
  | 'ready'          // Both players ready, game starting
  | 'playing'        // Game in progress
  | 'ended';         // Game ended

// Multiplayer state for the hook
export interface MultiplayerState {
  // Connection
  connectionStatus: ConnectionStatus;
  playerId: string | null;

  // Room
  roomId: string | null;
  playerNumber: 1 | 2 | null;
  isHost: boolean;

  // Opponent
  opponentConnected: boolean;
  opponentReady: boolean;

  // Lobby
  lobbyState: LobbyState;

  // Errors
  error: string | null;

  // Latency
  latency: number;
}

// Puck state from network
export interface NetworkPuckState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  seq: number;
  timestamp: number;
}

// Paddle state from network
export interface NetworkPaddleState {
  x: number;
  y: number;
  timestamp: number;
}
