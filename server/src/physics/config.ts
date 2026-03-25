// File: server/src/physics/config.ts
// UNIFIED physics config — replaces mismatched AI/multiplayer configs
// These values are the compromise from PRD: AI mode used 16/42, multiplayer used 12/30

export const PHYSICS = {
  puck: {
    radius: 14,
    restitution: 0.95,
    frictionAir: 0.001,
    maxSpeed: 22,
    minSpeed: 2,
    density: 0.001,
  },
  paddle: {
    radius: 36,
    restitution: 0.8,
    friction: 0.05,
    density: 0.01,
  },
  table: {
    width: 400,
    height: 700,
    goalWidth: 120,
    wallThickness: 20,
  },
  timing: {
    physicsFps: 60,
    broadcastFps: 30,
    physicsStep: 1000 / 60,
    broadcastInterval: 1000 / 30,
  },
} as const;

// Backward-compatible export — existing engine.ts and game-server.ts use this shape.
// New chaos agent code should import from shared.ts or use PHYSICS above.
export const PHYSICS_CONFIG = {
  engine: {
    gravity: { x: 0, y: 0 },
  },
  table: {
    width: PHYSICS.table.width,
    height: PHYSICS.table.height,
    wallThickness: PHYSICS.table.wallThickness,
    goalWidth: PHYSICS.table.goalWidth,
  },
  puck: {
    radius: PHYSICS.puck.radius,
    mass: 0.1,
    restitution: PHYSICS.puck.restitution,
    friction: 0,
    frictionAir: PHYSICS.puck.frictionAir,
    maxSpeed: PHYSICS.puck.maxSpeed,
    minSpeed: PHYSICS.puck.minSpeed,
  },
  paddle: {
    radius: PHYSICS.paddle.radius,
    mass: 1,
    restitution: PHYSICS.paddle.restitution,
    friction: PHYSICS.paddle.friction,
    velocityTransfer: 0.8,
    maxVelocity: 30,
  },
  wall: {
    restitution: 0.9,
    friction: 0,
  },
  game: {
    maxScore: 7,
    countdownSeconds: 3,
    goalPauseMs: 3500,
    tickRate: PHYSICS.timing.physicsFps,
    broadcastRate: PHYSICS.timing.broadcastFps,
  },
} as const;

export type PhysicsConfig = typeof PHYSICS_CONFIG;
