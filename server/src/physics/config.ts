// File: server/src/physics/config.ts
// Server physics config — synced to match client (src/lib/physics/config.ts)
// Both must use identical values so coordinate transforms align

export const PHYSICS = {
  puck: {
    radius: 16,
    restitution: 0.92,
    frictionAir: 0.004,
    maxSpeed: 14,
    density: 0.001,
  },
  paddle: {
    radius: 42,
    restitution: 0.8,
    friction: 0.1,
    density: 0.01,
  },
  table: {
    width: 500,
    height: 750,
    goalWidth: 188,
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
// shared.ts re-exports a flat shape for the chaos subsystem, derived from PHYSICS above.
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
