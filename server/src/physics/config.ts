export const PHYSICS_CONFIG = {
  engine: {
    gravity: { x: 0, y: 0 }
  },
  table: {
    width: 500,
    height: 750,
    wallThickness: 20,
    goalWidth: 188  // Proportional to new width (37.5%)
  },
  puck: {
    radius: 12,
    mass: 0.1,
    restitution: 0.98,      // Matched to AI mode - high bounce for energetic gameplay
    friction: 0,
    frictionAir: 0.0005,    // Matched to AI mode - near-zero for consistent speed
    maxSpeed: 25,           // Matched to AI mode - same top speed
    minSpeed: 2             // Keep minimum speed to prevent tediously slow gameplay
  },
  paddle: {
    radius: 30,             // Matched to AI mode - same paddle size
    mass: 1,
    restitution: 0.8,
    friction: 0.1,
    velocityTransfer: 0.8,  // Matched to AI mode - 80% velocity transfer
    maxVelocity: 30         // Matched to AI mode - responsive paddle movement
  },
  wall: {
    restitution: 0.9,
    friction: 0
  },
  game: {
    maxScore: 7,
    countdownSeconds: 3,
    goalPauseMs: 3500,
    tickRate: 60,        // Physics updates per second
    broadcastRate: 30    // State broadcasts per second
  }
} as const;

export type PhysicsConfig = typeof PHYSICS_CONFIG;
