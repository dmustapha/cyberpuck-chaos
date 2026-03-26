import Matter from 'matter-js';
import { PHYSICS_CONFIG } from './config';
import { createPuck, createPaddle, createWalls, createGoals } from './bodies';
import { Player, ActiveModifier } from '@/types/game';
import {
  ModifierState,
  createModifierState,
  applyModifier,
  revertModifier,
  getEffectiveRadii,
} from './modifiers';

const { Engine, World, Body, Events } = Matter;

export interface GameBodies {
  puck: Matter.Body;
  paddle1: Matter.Body;
  paddle2: Matter.Body;
  walls: Matter.Body[];
  goals: Matter.Body[];
}

export interface GameEngine {
  engine: Matter.Engine;
  bodies: GameBodies;
  movePaddle: (player: Player, x: number, y: number) => void;
  resetPuck: (options?: ResetPuckOptions) => void;
  cleanup: () => void;
  applyGameModifier: (modifier: ActiveModifier) => void;
  revertGameModifier: () => void;
  getEffectiveRadii: () => { puck: number; paddle1: number; paddle2: number };
  isPuckFrozen: () => boolean;
}

export interface EngineCallbacks {
  onGoal: (scorer: Player) => void;
  onPaddleHit: () => void;
  onWallHit: () => void;
}

export interface ResetPuckOptions {
  serveToward?: Player;  // Which player gets the puck
  isGameStart?: boolean; // true = center with velocity, false = loser's end stationary
}

// Paddle velocity tracking state
interface PaddleState {
  lastPosition: { x: number; y: number };
  velocity: { x: number; y: number };         // Smoothed for display
  instantVelocity: { x: number; y: number };  // Raw for collision
  lastMoveTime: number;
}

/**
 * Create and configure the game physics engine
 */
export function createGameEngine(callbacks: EngineCallbacks): GameEngine {
  // Reset state for new game
  cornerStuckFrames = 0;
  activeMaxSpeed = null;
  puckFrozenUntil = 0;
  frozenPuckRef = null;
  frozenServeToward = undefined;
  let modifierState: ModifierState = createModifierState();

  // Create engine with no gravity (top-down view)
  const engine = Engine.create({
    gravity: PHYSICS_CONFIG.engine.gravity,
  });

  // Create all bodies
  const puck = createPuck();
  const paddle1 = createPaddle('player1');
  const paddle2 = createPaddle('player2');
  const walls = createWalls();
  const goals = createGoals();

  // Add all bodies to world
  World.add(engine.world, [puck, paddle1, paddle2, ...walls, ...goals]);

  // Paddle velocity tracking
  const { table, paddle: paddleConfig } = PHYSICS_CONFIG;
  const paddleStates: Record<Player, PaddleState> = {
    player1: {
      lastPosition: { x: table.width / 2, y: table.height * 0.85 },
      velocity: { x: 0, y: 0 },
      instantVelocity: { x: 0, y: 0 },
      lastMoveTime: performance.now(),
    },
    player2: {
      lastPosition: { x: table.width / 2, y: table.height * 0.15 },
      velocity: { x: 0, y: 0 },
      instantVelocity: { x: 0, y: 0 },
      lastMoveTime: performance.now(),
    },
  };

  // Set up collision detection
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];

      // Goal detection
      if (labels.includes('puck')) {
        if (labels.includes('goal1')) {
          // Puck entered Player 1's goal -> Player 2 scores
          // Hide puck off-screen during goal pause
          Body.setVelocity(puck, { x: 0, y: 0 });
          Body.setPosition(puck, { x: table.width / 2, y: -9999 });
          callbacks.onGoal('player2');
        } else if (labels.includes('goal2')) {
          // Puck entered Player 2's goal -> Player 1 scores
          // Hide puck off-screen during goal pause
          Body.setVelocity(puck, { x: 0, y: 0 });
          Body.setPosition(puck, { x: table.width / 2, y: -9999 });
          callbacks.onGoal('player1');
        }
        // Paddle hit - apply velocity transfer
        else if (labels.includes('player1') || labels.includes('player2')) {
          const paddleLabel = labels.find(
            (l) => l === 'player1' || l === 'player2'
          ) as Player;
          // Use instantaneous velocity for responsive hit detection
          const paddleVel = paddleStates[paddleLabel].instantVelocity;

          // Apply paddle velocity to puck - proportional to paddle speed
          const transfer = paddleConfig.velocityTransfer;
          const maxVel = paddleConfig.maxVelocity;
          const { puck: puckConfig } = PHYSICS_CONFIG;

          // Clamp paddle velocity contribution
          const velX =
            Math.max(-maxVel, Math.min(maxVel, paddleVel.x)) * transfer;
          const velY =
            Math.max(-maxVel, Math.min(maxVel, paddleVel.y)) * transfer;

          // Add paddle velocity to puck's current velocity
          let newVelX = puck.velocity.x + velX;
          let newVelY = puck.velocity.y + velY;

          // Clamp total velocity to maxSpeed
          const newSpeed = Math.sqrt(newVelX ** 2 + newVelY ** 2);
          if (newSpeed > puckConfig.maxSpeed) {
            const scale = puckConfig.maxSpeed / newSpeed;
            newVelX *= scale;
            newVelY *= scale;
          }

          Body.setVelocity(puck, { x: newVelX, y: newVelY });

          callbacks.onPaddleHit();
        }
        // Wall hit
        else if (labels.some((l) => l.startsWith('wall'))) {
          callbacks.onWallHit();
        }
      }
    }
  });

  const bodies: GameBodies = {
    puck,
    paddle1,
    paddle2,
    walls,
    goals,
  };

  /**
   * Move a paddle to a position (constrained to player's half)
   * Also tracks velocity for momentum transfer
   */
  function movePaddle(player: Player, x: number, y: number): void {
    const paddle = player === 'player1' ? paddle1 : paddle2;
    const state = paddleStates[player];
    const now = performance.now();

    // Use smaller edge margin to allow paddle to reach visual edges
    // The physics walls will prevent actual escape
    const edgeMargin = paddleConfig.radius * 0.3;

    // Constrain X to table bounds (allow closer to edges)
    const clampedX = Math.max(
      edgeMargin,
      Math.min(table.width - edgeMargin, x)
    );

    // Constrain Y to player's half (allow closer to edges)
    let clampedY: number;
    if (player === 'player1') {
      // Player 1: bottom half
      clampedY = Math.max(
        table.height / 2 + edgeMargin,
        Math.min(table.height - edgeMargin, y)
      );
    } else {
      // Player 2: top half
      clampedY = Math.max(
        edgeMargin,
        Math.min(table.height / 2 - edgeMargin, y)
      );
    }

    // Calculate instantaneous velocity from position delta (pixels per second)
    const dt = Math.max(now - state.lastMoveTime, 1) / 1000; // Convert to seconds
    const newVelX = (clampedX - state.lastPosition.x) / dt;
    const newVelY = (clampedY - state.lastPosition.y) / dt;

    // Store instantaneous velocity for collision detection (raw, unsmoothed)
    state.instantVelocity = { x: newVelX, y: newVelY };

    // Light smoothing only for display purposes (0.7 = mostly new value)
    const smoothing = 0.7;
    state.velocity = {
      x: state.velocity.x * (1 - smoothing) + newVelX * smoothing,
      y: state.velocity.y * (1 - smoothing) + newVelY * smoothing,
    };

    state.lastPosition = { x: clampedX, y: clampedY };
    state.lastMoveTime = now;

    Body.setPosition(paddle, { x: clampedX, y: clampedY });
  }

  /**
   * Reset puck position and velocity
   * @param options.isGameStart - true: center with velocity, false: loser's end stationary
   * @param options.serveToward - which player receives the puck after a goal
   */
  function resetPuck(options?: ResetPuckOptions): void {
    const { serveToward, isGameStart = true } = options || {};

    // Both game start and after-goal use the same freeze pattern:
    // Center puck, reset paddles, freeze 1s, then auto-serve
    Body.setPosition(puck, {
      x: table.width / 2,
      y: table.height / 2,
    });
    Body.setVelocity(puck, { x: 0, y: 0 });
    Body.setStatic(puck, true);

    // Reset paddle positions to home
    Body.setPosition(paddle1, { x: table.width / 2, y: table.height * 0.8 });
    Body.setPosition(paddle2, { x: table.width / 2, y: table.height * 0.2 });

    // Freeze puck for 1 second — updatePhysics will unfreeze and serve
    const freezeMs = isGameStart ? 1500 : 1000;
    puckFrozenUntil = Date.now() + freezeMs;
    frozenPuckRef = puck;
    // Game start: random direction. After goal: toward loser.
    frozenServeToward = isGameStart
      ? (Math.random() > 0.5 ? 'player1' : 'player2')
      : serveToward;

    Body.setAngularVelocity(puck, 0);
  }

  /**
   * Apply a chaos modifier to the game physics
   */
  function applyGameModifier(modifier: ActiveModifier): void {
    modifierState = applyModifier(modifierState, bodies, modifier);
    activeMaxSpeed = modifierState.activeMaxSpeed;
  }

  /**
   * Revert any active modifier back to defaults
   */
  function revertGameModifier(): void {
    modifierState = revertModifier(modifierState, bodies);
    activeMaxSpeed = null;
  }

  /**
   * Get current effective radii (affected by modifiers)
   */
  function getGameEffectiveRadii() {
    return getEffectiveRadii(modifierState);
  }

  /**
   * Clean up engine resources
   */
  function cleanup(): void {
    revertGameModifier();
    Events.off(engine, 'collisionStart');
    World.clear(engine.world, false);
    Engine.clear(engine);
  }

  return {
    engine,
    bodies,
    movePaddle,
    resetPuck,
    cleanup,
    applyGameModifier,
    revertGameModifier,
    getEffectiveRadii: getGameEffectiveRadii,
    isPuckFrozen: () => puckFrozenUntil > 0 && Date.now() < puckFrozenUntil,
  };
}

// Active modifier max speed — null means use config default
let activeMaxSpeed: number | null = null;

// Puck freeze state — 0 means not frozen, >0 means frozen until that timestamp
let puckFrozenUntil = 0;
// The puck body ref for freeze/unfreeze in updatePhysics
let frozenPuckRef: Matter.Body | null = null;
// Direction to serve after freeze ends
let frozenServeToward: Player | undefined = undefined;

// Corner stuck detection — if puck lingers in a corner at low speed, nudge it out
let cornerStuckFrames = 0;
const CORNER_THRESHOLD = 60;  // px from walls to count as "corner zone"
const STUCK_SPEED = 3;        // below this speed = potentially stuck
const STUCK_FRAMES = 30;      // ~0.5s at 60fps before nudge
const NUDGE_SPEED = 4;        // gentle push toward center

/**
 * Update physics simulation (call every frame)
 *
 * IMPORTANT: Velocity and position clamping happens AFTER Engine.update()
 * to catch any velocity spikes from collision callbacks.
 */
export function updatePhysics(engine: Matter.Engine, delta: number): void {
  const { puck: puckConfig, table } = PHYSICS_CONFIG;

  // Handle puck freeze — skip physics while frozen, auto-serve when expired
  if (puckFrozenUntil > 0) {
    if (Date.now() >= puckFrozenUntil) {
      // Unfreeze and serve
      puckFrozenUntil = 0;
      if (frozenPuckRef) {
        Body.setStatic(frozenPuckRef, false);
        const vx = (Math.random() - 0.5) * 3;
        const vy = frozenServeToward === 'player1' ? 4 : -4;
        Body.setVelocity(frozenPuckRef, { x: vx, y: vy });
        frozenPuckRef = null;
        frozenServeToward = undefined;
      }
    } else {
      // Still frozen — skip physics update entirely
      return;
    }
  }

  // Step physics simulation FIRST
  Engine.update(engine, delta);

  // THEN clamp velocity and position (catches collision-induced spikes)
  const puckBody = engine.world.bodies.find((b) => b.label === 'puck');
  if (puckBody) {
    // 1. Clamp puck speed to max (respects modifier override)
    const effectiveMaxSpeed = activeMaxSpeed ?? puckConfig.maxSpeed;
    const speed = Math.sqrt(
      puckBody.velocity.x ** 2 + puckBody.velocity.y ** 2
    );
    if (speed > effectiveMaxSpeed) {
      const scale = effectiveMaxSpeed / speed;
      Body.setVelocity(puckBody, {
        x: puckBody.velocity.x * scale,
        y: puckBody.velocity.y * scale,
      });
    }

    // 2. Clamp puck position to arena bounds (prevents tunneling escape)
    const margin = puckConfig.radius + 5; // Small buffer inside walls
    const minX = margin;
    const maxX = table.width - margin;
    const minY = margin;
    const maxY = table.height - margin;

    const pos = puckBody.position;
    const clampedX = Math.max(minX, Math.min(maxX, pos.x));
    const clampedY = Math.max(minY, Math.min(maxY, pos.y));

    // If puck escaped bounds, push it back and reverse velocity component
    if (pos.x !== clampedX || pos.y !== clampedY) {
      Body.setPosition(puckBody, { x: clampedX, y: clampedY });

      // Reverse velocity if hitting boundary (acts as wall bounce)
      const vel = puckBody.velocity;
      Body.setVelocity(puckBody, {
        x: pos.x !== clampedX ? -vel.x * 0.8 : vel.x,
        y: pos.y !== clampedY ? -vel.y * 0.8 : vel.y,
      });
    }

    // 3. Corner stuck detection — nudge puck toward center if trapped
    // Use fresh position and velocity after all clamps above
    const curPos = puckBody.position;
    const curSpeed = Math.sqrt(puckBody.velocity.x ** 2 + puckBody.velocity.y ** 2);
    const nearSideWall = curPos.x < CORNER_THRESHOLD || curPos.x > table.width - CORNER_THRESHOLD;
    const nearEndWall = curPos.y < CORNER_THRESHOLD || curPos.y > table.height - CORNER_THRESHOLD;

    if (nearSideWall && nearEndWall && curSpeed < STUCK_SPEED) {
      cornerStuckFrames++;
      if (cornerStuckFrames >= STUCK_FRAMES) {
        const centerX = table.width / 2;
        const centerY = table.height / 2;
        const dx = centerX - curPos.x;
        const dy = centerY - curPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        Body.setVelocity(puckBody, {
          x: (dx / dist) * NUDGE_SPEED,
          y: (dy / dist) * NUDGE_SPEED,
        });
        cornerStuckFrames = 0;
      }
    } else {
      cornerStuckFrames = 0;
    }
  }
}
