// Game mode: AI or multiplayer
export type GameMode = 'ai' | 'multiplayer';

// AI difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Game state machine states
export type GameStatus = 'menu' | 'countdown' | 'playing' | 'goal' | 'paused' | 'gameover';

// Player identifier
export type Player = 'player1' | 'player2';

// 2D position
export interface Position {
  x: number;
  y: number;
}

// 2D velocity
export interface Velocity {
  x: number;
  y: number;
}

// Score tracking
export interface Scores {
  player1: number;
  player2: number;
}

// Complete game state
export interface GameState {
  status: GameStatus;
  mode: GameMode;
  difficulty: Difficulty;
  scores: Scores;
  maxScore: number;
  lastScorer: Player | null;
  winner: Player | null;
}

// AI configuration per difficulty
export interface AIConfig {
  reactionDelay: number;      // ms between target updates
  speedMultiplier: number;    // movement speed factor
  predictionAccuracy: number; // 0-1, higher = more accurate prediction
  aggressiveness: number;     // 0-1, higher = pushes further forward
}

// Physics configuration
export interface PhysicsConfig {
  engine: {
    gravity: { x: number; y: number };
  };
  table: {
    width: number;
    height: number;
    wallThickness: number;
    goalWidth: number;
  };
  puck: {
    radius: number;
    mass: number;
    restitution: number;
    friction: number;
    frictionAir: number;
    maxSpeed: number;
  };
  paddle: {
    radius: number;
    mass: number;
    restitution: number;
    friction: number;
    velocityTransfer: number;
    maxVelocity: number;
  };
  wall: {
    restitution: number;
    friction: number;
  };
  game: {
    maxScore: number;
    countdownSeconds: number;
    goalPauseMs: number;
  };
}
