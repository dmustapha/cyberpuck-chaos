/**
 * WebSocket Message Types for Server-Authoritative Multiplayer Air Hockey
 *
 * This file defines all message types for client-server communication.
 * The server is authoritative - it owns all game state and physics.
 */

// =============================================================================
// Common Types
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface PuckState extends Position, Velocity {}

export interface PaddleState extends Position {}

export interface Score {
  player1: number;
  player2: number;
}

export type PlayerNumber = 1 | 2;

// =============================================================================
// Client → Server Messages
// =============================================================================

export interface JoinRoomMessage {
  type: 'join-room';
  gameId: string;
  playerId: string;
}

export interface PaddleMoveMessage {
  type: 'paddle-move';
  x: number;
  y: number;
  timestamp: number;
}

export interface PlayerReadyMessage {
  type: 'player-ready';
  gameId: string;
}

export interface PingMessage {
  type: 'ping';
}

export interface PauseRequestMessage {
  type: 'pause-request';
}

export interface ResumeRequestMessage {
  type: 'resume-request';
}

export interface QuitGameMessage {
  type: 'quit-game';
}

export interface RematchRequestMessage {
  type: 'rematch-request';
}

export interface RematchResponseMessage {
  type: 'rematch-response';
  accepted: boolean;
}

export interface PlayerExitMessage {
  type: 'player-exit';
}

export type ClientMessage =
  | JoinRoomMessage
  | PaddleMoveMessage
  | PlayerReadyMessage
  | PingMessage
  | PauseRequestMessage
  | ResumeRequestMessage
  | QuitGameMessage
  | RematchRequestMessage
  | RematchResponseMessage
  | PlayerExitMessage;

// =============================================================================
// Server → Client Messages
// =============================================================================

export interface RoomJoinedMessage {
  type: 'room-joined';
  gameId: string;
  playerNumber: PlayerNumber;
}

export interface OpponentJoinedMessage {
  type: 'opponent-joined';
  opponentId: string;
}

export interface CountdownMessage {
  type: 'countdown';
  seconds: number;
}

export interface StateUpdateMessage {
  type: 'state-update';
  puck: PuckState;
  paddle1: PaddleState;
  paddle2: PaddleState;
  score: Score;
  timestamp: number;
}

export interface GoalMessage {
  type: 'goal';
  scorer: PlayerNumber;
  newScore: Score;
}

export interface GameOverMessage {
  type: 'game-over';
  winner: PlayerNumber;
  finalScore: Score;
}

export interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
}

export interface OpponentDisconnectedMessage {
  type: 'opponent-disconnected';
}

export interface PongMessage {
  type: 'pong';
}

export type PauseReason = 'player_pause' | 'opponent_pause' | 'connection_lost' | 'opponent_disconnected';

export interface GamePausedMessage {
  type: 'game-paused';
  reason: PauseReason;
  pausedBy: PlayerNumber | null;
  canResume: boolean;
  gracePeriodMs?: number;
}

export interface ResumeCountdownMessage {
  type: 'resume-countdown';
  seconds: number;
}

export interface GameResumedMessage {
  type: 'game-resumed';
}

export interface OpponentQuitMessage {
  type: 'opponent-quit';
  winner: PlayerNumber;
  finalScore: Score;
}

export interface RematchRequestedMessage {
  type: 'rematch-requested';
}

export interface RematchAcceptedMessage {
  type: 'rematch-accepted';
}

export interface RematchDeclinedMessage {
  type: 'rematch-declined';
}

export interface OpponentExitedMessage {
  type: 'opponent-exited';
}

export type ServerMessage =
  | RoomJoinedMessage
  | OpponentJoinedMessage
  | OpponentDisconnectedMessage
  | CountdownMessage
  | StateUpdateMessage
  | GoalMessage
  | GameOverMessage
  | ErrorMessage
  | PongMessage
  | GamePausedMessage
  | ResumeCountdownMessage
  | GameResumedMessage
  | OpponentQuitMessage
  | RematchRequestedMessage
  | RematchAcceptedMessage
  | RematchDeclinedMessage
  | OpponentExitedMessage;

// =============================================================================
// Type Guards - Client Messages
// =============================================================================

export function isJoinRoomMessage(msg: unknown): msg is JoinRoomMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as JoinRoomMessage).type === 'join-room' &&
    typeof (msg as JoinRoomMessage).gameId === 'string' &&
    typeof (msg as JoinRoomMessage).playerId === 'string'
  );
}

export function isPaddleMoveMessage(msg: unknown): msg is PaddleMoveMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as PaddleMoveMessage).type === 'paddle-move' &&
    typeof (msg as PaddleMoveMessage).x === 'number' &&
    typeof (msg as PaddleMoveMessage).y === 'number' &&
    typeof (msg as PaddleMoveMessage).timestamp === 'number'
  );
}

export function isPlayerReadyMessage(msg: unknown): msg is PlayerReadyMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as PlayerReadyMessage).type === 'player-ready' &&
    typeof (msg as PlayerReadyMessage).gameId === 'string'
  );
}

export function isPingMessage(msg: unknown): msg is PingMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as PingMessage).type === 'ping'
  );
}

export function isPauseRequestMessage(msg: unknown): msg is PauseRequestMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as PauseRequestMessage).type === 'pause-request'
  );
}

export function isResumeRequestMessage(msg: unknown): msg is ResumeRequestMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ResumeRequestMessage).type === 'resume-request'
  );
}

export function isQuitGameMessage(msg: unknown): msg is QuitGameMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as QuitGameMessage).type === 'quit-game'
  );
}

export function isRematchRequestMessage(msg: unknown): msg is RematchRequestMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as RematchRequestMessage).type === 'rematch-request'
  );
}

export function isRematchResponseMessage(msg: unknown): msg is RematchResponseMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as RematchResponseMessage).type === 'rematch-response' &&
    typeof (msg as RematchResponseMessage).accepted === 'boolean'
  );
}

export function isPlayerExitMessage(msg: unknown): msg is PlayerExitMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as PlayerExitMessage).type === 'player-exit'
  );
}

export function isClientMessage(msg: unknown): msg is ClientMessage {
  return (
    isJoinRoomMessage(msg) ||
    isPaddleMoveMessage(msg) ||
    isPlayerReadyMessage(msg) ||
    isPingMessage(msg) ||
    isPauseRequestMessage(msg) ||
    isResumeRequestMessage(msg) ||
    isQuitGameMessage(msg) ||
    isRematchRequestMessage(msg) ||
    isRematchResponseMessage(msg) ||
    isPlayerExitMessage(msg)
  );
}

// =============================================================================
// Type Guards - Server Messages
// =============================================================================

export function isRoomJoinedMessage(msg: unknown): msg is RoomJoinedMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as RoomJoinedMessage).type === 'room-joined' &&
    typeof (msg as RoomJoinedMessage).gameId === 'string' &&
    ((msg as RoomJoinedMessage).playerNumber === 1 ||
      (msg as RoomJoinedMessage).playerNumber === 2)
  );
}

export function isOpponentJoinedMessage(msg: unknown): msg is OpponentJoinedMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as OpponentJoinedMessage).type === 'opponent-joined' &&
    typeof (msg as OpponentJoinedMessage).opponentId === 'string'
  );
}

export function isCountdownMessage(msg: unknown): msg is CountdownMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as CountdownMessage).type === 'countdown' &&
    typeof (msg as CountdownMessage).seconds === 'number'
  );
}

export function isStateUpdateMessage(msg: unknown): msg is StateUpdateMessage {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as StateUpdateMessage;
  return (
    m.type === 'state-update' &&
    typeof m.puck === 'object' &&
    typeof m.puck.x === 'number' &&
    typeof m.puck.y === 'number' &&
    typeof m.puck.vx === 'number' &&
    typeof m.puck.vy === 'number' &&
    typeof m.paddle1 === 'object' &&
    typeof m.paddle1.x === 'number' &&
    typeof m.paddle1.y === 'number' &&
    typeof m.paddle2 === 'object' &&
    typeof m.paddle2.x === 'number' &&
    typeof m.paddle2.y === 'number' &&
    typeof m.score === 'object' &&
    typeof m.score.player1 === 'number' &&
    typeof m.score.player2 === 'number' &&
    typeof m.timestamp === 'number'
  );
}

export function isGoalMessage(msg: unknown): msg is GoalMessage {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as GoalMessage;
  return (
    m.type === 'goal' &&
    (m.scorer === 1 || m.scorer === 2) &&
    typeof m.newScore === 'object' &&
    typeof m.newScore.player1 === 'number' &&
    typeof m.newScore.player2 === 'number'
  );
}

export function isGameOverMessage(msg: unknown): msg is GameOverMessage {
  if (typeof msg !== 'object' || msg === null) return false;
  const m = msg as GameOverMessage;
  return (
    m.type === 'game-over' &&
    (m.winner === 1 || m.winner === 2) &&
    typeof m.finalScore === 'object' &&
    typeof m.finalScore.player1 === 'number' &&
    typeof m.finalScore.player2 === 'number'
  );
}

export function isErrorMessage(msg: unknown): msg is ErrorMessage {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    (msg as ErrorMessage).type === 'error' &&
    typeof (msg as ErrorMessage).code === 'string' &&
    typeof (msg as ErrorMessage).message === 'string'
  );
}

export function isServerMessage(msg: unknown): msg is ServerMessage {
  return (
    isRoomJoinedMessage(msg) ||
    isOpponentJoinedMessage(msg) ||
    isCountdownMessage(msg) ||
    isStateUpdateMessage(msg) ||
    isGoalMessage(msg) ||
    isGameOverMessage(msg) ||
    isErrorMessage(msg)
  );
}

// =============================================================================
// Message Type Constants
// =============================================================================

export const CLIENT_MESSAGE_TYPES = [
  'join-room',
  'paddle-move',
  'player-ready',
  'ping',
  'pause-request',
  'resume-request',
  'quit-game',
  'rematch-request',
  'rematch-response',
  'player-exit',
] as const;

export const SERVER_MESSAGE_TYPES = [
  'room-joined',
  'opponent-joined',
  'opponent-disconnected',
  'countdown',
  'state-update',
  'goal',
  'game-over',
  'error',
  'pong',
  'game-paused',
  'resume-countdown',
  'game-resumed',
  'opponent-quit',
  'rematch-requested',
  'rematch-accepted',
  'rematch-declined',
  'opponent-exited',
] as const;

export type ClientMessageType = (typeof CLIENT_MESSAGE_TYPES)[number];
export type ServerMessageType = (typeof SERVER_MESSAGE_TYPES)[number];

// =============================================================================
// Error Codes
// =============================================================================

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
  NOT_IN_ROOM: 'NOT_IN_ROOM',
  GAME_NOT_STARTED: 'GAME_NOT_STARTED',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
