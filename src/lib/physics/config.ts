import { PhysicsConfig, AIConfig, Difficulty } from '@/types/game';

export const PHYSICS_CONFIG: PhysicsConfig = {
  engine: {
    gravity: { x: 0, y: 0 },
  },

  table: {
    width: 500,
    height: 750,
    wallThickness: 20,
    goalWidth: 188,  // Proportional to new width (37.5%)
  },

  puck: {
    radius: 16,
    mass: 0.1,
    restitution: 0.92,  // Less bouncy — 8% energy loss per bounce (was 2%)
    friction: 0,
    frictionAir: 0.002,  // Meaningful deceleration so ball doesn't fly endlessly
    maxSpeed: 18,         // Controllable on mobile (was 25)
  },

  paddle: {
    radius: 42,
    mass: 1,
    restitution: 0.8,
    friction: 0.1,
    velocityTransfer: 0.8,  // 80% of paddle velocity transfers to puck
    maxVelocity: 30,        // Higher cap for responsive hits
  },

  wall: {
    restitution: 0.9,
    friction: 0,
  },

  game: {
    maxScore: 7,
    countdownSeconds: 3,
    goalPauseMs: 3500,
  },
};

export const AI_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: {
    reactionDelay: 600,      // Very slow reactions — updates ~1.7x/sec
    speedMultiplier: 0.25,   // Sluggish movement
    predictionAccuracy: 0.30, // 70px prediction error spread
    aggressiveness: 0.2,     // Hugs own goal line
  },
  medium: {
    reactionDelay: 180,      // Moderate reactions
    speedMultiplier: 0.7,    // Decent speed
    predictionAccuracy: 0.75, // Some prediction error (25 pixel spread)
    aggressiveness: 0.6,     // Balanced positioning
  },
  hard: {
    reactionDelay: 35,       // Very fast reactions
    speedMultiplier: 1.15,   // Faster than base speed
    predictionAccuracy: 0.98, // Near-perfect prediction (2 pixel spread)
    aggressiveness: 0.9,     // Pushes forward aggressively
  },
};
