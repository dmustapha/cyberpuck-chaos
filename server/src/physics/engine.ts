import Matter from 'matter-js';
import { PHYSICS_CONFIG } from './config';

export interface GameState {
  puck: { x: number; y: number; vx: number; vy: number };
  paddle1: { x: number; y: number };
  paddle2: { x: number; y: number };
  score: { player1: number; player2: number };
  timestamp: number;
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private puck: Matter.Body;
  private paddle1: Matter.Body;
  private paddle2: Matter.Body;
  private walls: Matter.Body[];
  private score: { player1: number; player2: number };
  private tickInterval: NodeJS.Timeout | null = null;
  private onGoalCallback: ((scorer: 1 | 2) => void) | null = null;
  private paddle1Target: { x: number; y: number } | null = null;
  private paddle2Target: { x: number; y: number } | null = null;
  private goalScored: boolean = false;
  private paddle1PrevPos: { x: number; y: number } | null = null;
  private paddle2PrevPos: { x: number; y: number } | null = null;
  private lastTickTime: number = Date.now();
  private isPaused: boolean = false;
  private goalResetTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Create Matter.js engine with zero gravity (air hockey table)
    this.engine = Matter.Engine.create({
      gravity: PHYSICS_CONFIG.engine.gravity,
    });
    this.world = this.engine.world;

    // Initialize score
    this.score = { player1: 0, player2: 0 };

    // Create physics bodies
    this.puck = this.createPuck();
    this.paddle1 = this.createPaddle(0, PHYSICS_CONFIG.table.height / 4); // Bottom half (player 1)
    this.paddle2 = this.createPaddle(0, -PHYSICS_CONFIG.table.height / 4); // Top half (player 2)
    this.walls = this.createWalls();

    // Add all bodies to the world
    Matter.Composite.add(this.world, [
      this.puck,
      this.paddle1,
      this.paddle2,
      ...this.walls,
    ]);

    // Set up collision detection for paddle-puck interactions
    this.setupCollisionHandling();
  }

  /**
   * Start the 60fps physics loop
   */
  start(): void {
    if (this.tickInterval) {
      return; // Already running
    }

    // Puck starts stationary at center - players must hit it to move
    Matter.Body.setVelocity(this.puck, { x: 0, y: 0 });
    Matter.Body.setPosition(this.puck, { x: 0, y: 0 });

    this.lastTickTime = Date.now(); // Initialize timing
    const tickMs = 1000 / PHYSICS_CONFIG.game.tickRate;
    this.tickInterval = setInterval(() => this.tick(), tickMs);
  }

  /**
   * Stop the physics loop
   */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Pause the physics engine without destroying state
   * Returns the current game state for storage
   */
  pause(): GameState {
    if (this.isPaused) {
      return this.getState();
    }

    this.isPaused = true;
    this.stop(); // Stop tick interval but preserve all state

    return this.getState();
  }

  /**
   * Resume the physics engine from paused state
   */
  resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.lastTickTime = Date.now(); // Reset timing to prevent huge delta
    this.start(); // Restart tick interval
  }

  /**
   * Check if the engine is currently paused
   */
  isEnginePaused(): boolean {
    return this.isPaused;
  }

  /**
   * Destroy the physics engine and clean up resources
   */
  destroy(): void {
    this.stop();

    // Clear pending goal timeout
    if (this.goalResetTimeout) {
      clearTimeout(this.goalResetTimeout);
      this.goalResetTimeout = null;
    }

    // Remove event listeners
    Matter.Events.off(this.engine, 'collisionStart');

    // Clear the world
    Matter.World.clear(this.world, false);

    // Clear the engine
    Matter.Engine.clear(this.engine);

    // Clear references
    this.paddle1Target = null;
    this.paddle2Target = null;
    this.paddle1PrevPos = null;
    this.paddle2PrevPos = null;
    this.onGoalCallback = null;
  }

  /**
   * Set the target position for a paddle (paddle will move toward this position)
   */
  setPaddleTarget(playerNumber: 1 | 2, x: number, y: number): void {
    const clamped = this.clampPaddlePosition(playerNumber, x, y);
    if (playerNumber === 1) {
      this.paddle1Target = clamped;
    } else {
      this.paddle2Target = clamped;
    }
  }

  /**
   * Get the current game state
   */
  getState(): GameState {
    return {
      puck: {
        x: this.puck.position.x,
        y: this.puck.position.y,
        vx: this.puck.velocity.x,
        vy: this.puck.velocity.y,
      },
      paddle1: {
        x: this.paddle1.position.x,
        y: this.paddle1.position.y,
      },
      paddle2: {
        x: this.paddle2.position.x,
        y: this.paddle2.position.y,
      },
      score: { ...this.score },
      timestamp: Date.now(),
    };
  }

  /**
   * Register a callback for when a goal is scored
   */
  onGoal(callback: (scorer: 1 | 2) => void): void {
    this.onGoalCallback = callback;
  }

  /**
   * Reset the puck position
   * @param serveToward - Which player to serve toward (1 = bottom/player1's side, 2 = top/player2's side)
   *                      If not provided, resets to center (for game start or invalid state recovery)
   */
  resetPuck(serveToward?: 1 | 2): void {
    const halfHeight = PHYSICS_CONFIG.table.height / 2;
    let resetX = 0;
    let resetY = 0;

    if (serveToward) {
      // After goal: place puck on loser's end (25% or 75% of table height from center)
      // serveToward 1 means serve to player 1 (bottom, y > 0)
      // serveToward 2 means serve to player 2 (top, y < 0)
      resetY = serveToward === 1 ? halfHeight * 0.5 : -halfHeight * 0.5;
    } else {
      // Game start or invalid state: center position
      // Check if paddle is near center and offset if needed
      const safeDistance =
        PHYSICS_CONFIG.puck.radius + PHYSICS_CONFIG.paddle.radius + 5;

      const p1Dist = Math.sqrt(
        Math.pow(this.paddle1.position.x - resetX, 2) +
          Math.pow(this.paddle1.position.y - resetY, 2)
      );

      const p2Dist = Math.sqrt(
        Math.pow(this.paddle2.position.x - resetX, 2) +
          Math.pow(this.paddle2.position.y - resetY, 2)
      );

      if (p1Dist < safeDistance || p2Dist < safeDistance) {
        if (p1Dist < p2Dist) {
          resetY = -50;
        } else {
          resetY = 50;
        }
      }
    }

    Matter.Body.setPosition(this.puck, { x: resetX, y: resetY });
    Matter.Body.setVelocity(this.puck, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.puck, 0);
    this.goalScored = false;
  }

  /**
   * Reset the entire game state
   */
  resetGame(): void {
    this.score = { player1: 0, player2: 0 };
    this.resetPuck();

    // Reset paddles to starting positions
    Matter.Body.setPosition(this.paddle1, {
      x: 0,
      y: PHYSICS_CONFIG.table.height / 4,
    });
    Matter.Body.setPosition(this.paddle2, {
      x: 0,
      y: -PHYSICS_CONFIG.table.height / 4,
    });

    // Clear paddle targets
    this.paddle1Target = null;
    this.paddle2Target = null;
  }

  /**
   * Single physics tick
   */
  private tick(): void {
    // STOP physics during goal pause - match AI mode behavior
    if (this.goalScored) {
      return;
    }

    const now = Date.now();
    const actualDeltaMs = now - this.lastTickTime;
    // Don't update lastTickTime here, it's updated in updatePaddlePositions

    // Move paddles toward their targets (this updates lastTickTime)
    this.updatePaddlePositions();

    // Cap puck speed BEFORE physics
    this.capPuckSpeed();

    // Run the physics simulation with actual delta time
    // Cap delta to prevent spiral of death on lag spikes
    const cappedDelta = Math.min(actualDeltaMs, 50); // Max 50ms step
    Matter.Engine.update(this.engine, cappedDelta);

    // Cap puck speed AFTER physics too (collision can exceed max)
    this.capPuckSpeed();

    // Validate puck state and recover if needed (Layer 2 & 3 of defense-in-depth)
    if (this.validateAndRecoverPuckState()) {
      // Puck was reset due to invalid state, skip goal check this frame
      return;
    }

    // NOTE: Removed maintainMinimumSpeed() - puck should stay still until hit (like real air hockey)

    // Check for goals (only if not already processing a goal)
    if (!this.goalScored) {
      const scorer = this.checkGoal();
      if (scorer !== null) {
        this.goalScored = true;
        this.score[scorer === 1 ? 'player1' : 'player2']++;

        // STOP puck and HIDE it off-screen during goal pause
        Matter.Body.setVelocity(this.puck, { x: 0, y: 0 });
        Matter.Body.setPosition(this.puck, { x: 0, y: -9999 }); // Hide off-screen

        if (this.onGoalCallback) {
          this.onGoalCallback(scorer);
        }

        // Reset puck after a delay, serve to the loser
        // If player 1 scored (puck went through top goal), serve to player 2
        // If player 2 scored (puck went through bottom goal), serve to player 1
        const serveToward: 1 | 2 = scorer === 1 ? 2 : 1;

        // Clear any existing timeout
        if (this.goalResetTimeout) {
          clearTimeout(this.goalResetTimeout);
        }

        this.goalResetTimeout = setTimeout(() => {
          this.goalResetTimeout = null;
          this.resetPuck(serveToward);
        }, PHYSICS_CONFIG.game.goalPauseMs);
      }
    }
  }

  /**
   * Check if the puck has entered a goal
   * Returns 1 if player 1 scored (puck in top goal)
   * Returns 2 if player 2 scored (puck in bottom goal)
   * Returns null if no goal
   */
  private checkGoal(): 1 | 2 | null {
    const puckPos = this.puck.position;
    const halfGoalWidth = PHYSICS_CONFIG.table.goalWidth / 2;
    const halfTableHeight = PHYSICS_CONFIG.table.height / 2;
    const puckRadius = PHYSICS_CONFIG.puck.radius;

    // Check if puck is within goal width (horizontally)
    if (Math.abs(puckPos.x) <= halfGoalWidth) {
      // Player 1 scores (puck went through top goal, y < -halfHeight)
      if (puckPos.y < -(halfTableHeight + puckRadius)) {
        return 1;
      }
      // Player 2 scores (puck went through bottom goal, y > halfHeight)
      if (puckPos.y > halfTableHeight + puckRadius) {
        return 2;
      }
    }

    return null;
  }

  /**
   * Create the walls around the table (excluding goal openings)
   */
  private createWalls(): Matter.Body[] {
    const walls: Matter.Body[] = [];
    const { width, height, wallThickness, goalWidth } = PHYSICS_CONFIG.table;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: PHYSICS_CONFIG.wall.restitution,
      friction: PHYSICS_CONFIG.wall.friction,
      label: 'wall',
    };

    // Left wall (full height)
    walls.push(
      Matter.Bodies.rectangle(
        -(halfWidth + wallThickness / 2),
        0,
        wallThickness,
        height + wallThickness * 2,
        wallOptions
      )
    );

    // Right wall (full height)
    walls.push(
      Matter.Bodies.rectangle(
        halfWidth + wallThickness / 2,
        0,
        wallThickness,
        height + wallThickness * 2,
        wallOptions
      )
    );

    // Top wall - left segment (from left edge to goal opening)
    const topBottomSegmentWidth = (width - goalWidth) / 2;
    walls.push(
      Matter.Bodies.rectangle(
        -(halfWidth - topBottomSegmentWidth / 2),
        -(halfHeight + wallThickness / 2),
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    // Top wall - right segment (from goal opening to right edge)
    walls.push(
      Matter.Bodies.rectangle(
        halfWidth - topBottomSegmentWidth / 2,
        -(halfHeight + wallThickness / 2),
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    // Bottom wall - left segment
    walls.push(
      Matter.Bodies.rectangle(
        -(halfWidth - topBottomSegmentWidth / 2),
        halfHeight + wallThickness / 2,
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    // Bottom wall - right segment
    walls.push(
      Matter.Bodies.rectangle(
        halfWidth - topBottomSegmentWidth / 2,
        halfHeight + wallThickness / 2,
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    return walls;
  }

  /**
   * Create the puck body
   */
  private createPuck(): Matter.Body {
    return Matter.Bodies.circle(0, 0, PHYSICS_CONFIG.puck.radius, {
      mass: PHYSICS_CONFIG.puck.mass,
      restitution: PHYSICS_CONFIG.puck.restitution,
      friction: PHYSICS_CONFIG.puck.friction,
      frictionAir: PHYSICS_CONFIG.puck.frictionAir,
      label: 'puck',
    });
  }

  /**
   * Create a paddle body
   */
  private createPaddle(x: number, y: number): Matter.Body {
    return Matter.Bodies.circle(x, y, PHYSICS_CONFIG.paddle.radius, {
      mass: PHYSICS_CONFIG.paddle.mass,
      restitution: PHYSICS_CONFIG.paddle.restitution,
      friction: PHYSICS_CONFIG.paddle.friction,
      isStatic: false, // Dynamic but we control position directly
      label: 'paddle',
      inertia: Infinity, // Prevent rotation
    });
  }

  /**
   * Clamp paddle position to player's half of the table
   */
  private clampPaddlePosition(
    playerNumber: 1 | 2,
    x: number,
    y: number
  ): { x: number; y: number } {
    const halfWidth = PHYSICS_CONFIG.table.width / 2;
    const halfHeight = PHYSICS_CONFIG.table.height / 2;
    const paddleRadius = PHYSICS_CONFIG.paddle.radius;

    // Clamp X to table bounds (accounting for paddle radius)
    const clampedX = Math.max(
      -halfWidth + paddleRadius,
      Math.min(halfWidth - paddleRadius, x)
    );

    let clampedY: number;
    if (playerNumber === 1) {
      // Player 1 is at the bottom (y > 0), constrained to bottom half
      clampedY = Math.max(
        paddleRadius, // Can't cross center line
        Math.min(halfHeight - paddleRadius, y) // Can't go past bottom edge
      );
    } else {
      // Player 2 is at the top (y < 0), constrained to top half
      clampedY = Math.max(
        -(halfHeight - paddleRadius), // Can't go past top edge
        Math.min(-paddleRadius, y) // Can't cross center line
      );
    }

    return { x: clampedX, y: clampedY };
  }

  /**
   * Update paddle positions toward their targets
   */
  private updatePaddlePositions(): void {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000; // seconds
    this.lastTickTime = now;

    if (this.paddle1Target) {
      // Calculate velocity based on position change
      const prevPos = this.paddle1PrevPos || this.paddle1.position;
      const dx = this.paddle1Target.x - prevPos.x;
      const dy = this.paddle1Target.y - prevPos.y;

      // Velocity = distance / time, capped at maxVelocity
      const maxVel = PHYSICS_CONFIG.paddle.maxVelocity;
      const vx = Math.max(-maxVel, Math.min(maxVel, dx / Math.max(dt, 0.001)));
      const vy = Math.max(-maxVel, Math.min(maxVel, dy / Math.max(dt, 0.001)));

      Matter.Body.setPosition(this.paddle1, this.paddle1Target);
      Matter.Body.setVelocity(this.paddle1, { x: vx, y: vy });

      this.paddle1PrevPos = { ...this.paddle1Target };
    }

    if (this.paddle2Target) {
      const prevPos = this.paddle2PrevPos || this.paddle2.position;
      const dx = this.paddle2Target.x - prevPos.x;
      const dy = this.paddle2Target.y - prevPos.y;

      const maxVel = PHYSICS_CONFIG.paddle.maxVelocity;
      const vx = Math.max(-maxVel, Math.min(maxVel, dx / Math.max(dt, 0.001)));
      const vy = Math.max(-maxVel, Math.min(maxVel, dy / Math.max(dt, 0.001)));

      Matter.Body.setPosition(this.paddle2, this.paddle2Target);
      Matter.Body.setVelocity(this.paddle2, { x: vx, y: vy });

      this.paddle2PrevPos = { ...this.paddle2Target };
    }
  }

  /**
   * Cap the puck speed to prevent it from going too fast
   */
  private capPuckSpeed(): void {
    const velocity = this.puck.velocity;

    // Check for NaN/Infinity in velocity (critical safety check)
    if (!Number.isFinite(velocity.x) || !Number.isFinite(velocity.y)) {
      console.warn('[Physics] Invalid puck velocity detected in capPuckSpeed, resetting to zero');
      Matter.Body.setVelocity(this.puck, { x: 0, y: 0 });
      return;
    }

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    // Check for NaN speed (defensive check)
    if (!Number.isFinite(speed)) {
      console.warn('[Physics] Invalid puck speed calculated, resetting velocity');
      Matter.Body.setVelocity(this.puck, { x: 0, y: 0 });
      return;
    }

    if (speed > PHYSICS_CONFIG.puck.maxSpeed && speed > 0) {
      const scale = PHYSICS_CONFIG.puck.maxSpeed / speed;
      Matter.Body.setVelocity(this.puck, {
        x: velocity.x * scale,
        y: velocity.y * scale,
      });
    }
  }

  /**
   * Set up collision handling for paddle-puck interactions
   */
  private setupCollisionHandling(): void {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        // Check if collision involves puck and paddle
        const isPuck = (body: Matter.Body) => body.label === 'puck';
        const isPaddle = (body: Matter.Body) => body.label === 'paddle';

        if ((isPuck(bodyA) && isPaddle(bodyB)) || (isPaddle(bodyA) && isPuck(bodyB))) {
          const puck = isPuck(bodyA) ? bodyA : bodyB;
          const paddle = isPaddle(bodyA) ? bodyA : bodyB;
          this.handlePaddlePuckCollision(puck, paddle);
        }
      }
    });
  }

  /**
   * Handle paddle-puck collision with velocity transfer
   * The faster the paddle is moving, the faster the puck goes
   */
  private handlePaddlePuckCollision(puck: Matter.Body, paddle: Matter.Body): void {
    // Calculate collision normal (from paddle center to puck center)
    const dx = puck.position.x - paddle.position.x;
    const dy = puck.position.y - paddle.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Minimum safe distance to prevent division issues (0.1 pixel)
    const EPSILON = 0.1;

    let normalX: number;
    let normalY: number;

    if (distance < EPSILON) {
      // Objects are nearly overlapping - push puck away from paddle
      // Use paddle's position to determine direction (toward opponent's side)
      normalX = 0;
      normalY = paddle.position.y > 0 ? -1 : 1;
    } else {
      normalX = dx / distance;
      normalY = dy / distance;
    }

    // Validate normals are finite (catch any remaining edge cases)
    if (!Number.isFinite(normalX) || !Number.isFinite(normalY)) {
      console.warn('[Physics] Invalid collision normal, skipping velocity transfer');
      return;
    }

    // Get paddle velocity (how fast the paddle was moving)
    const paddleVelX = paddle.velocity.x;
    const paddleVelY = paddle.velocity.y;

    // Validate paddle velocity
    if (!Number.isFinite(paddleVelX) || !Number.isFinite(paddleVelY)) {
      console.warn('[Physics] Invalid paddle velocity, skipping velocity transfer');
      return;
    }

    const paddleSpeed = Math.sqrt(paddleVelX * paddleVelX + paddleVelY * paddleVelY);

    // Apply velocity transfer: paddle speed contributes to puck velocity
    const transferAmount = paddleSpeed * PHYSICS_CONFIG.paddle.velocityTransfer;

    // Calculate new velocity
    const newVx = puck.velocity.x + normalX * transferAmount;
    const newVy = puck.velocity.y + normalY * transferAmount;

    // Final validation before applying
    if (!Number.isFinite(newVx) || !Number.isFinite(newVy)) {
      console.warn('[Physics] Invalid new velocity calculated, skipping');
      return;
    }

    // Apply the new velocity (capPuckSpeed will clamp it in the next tick)
    Matter.Body.setVelocity(puck, { x: newVx, y: newVy });
  }

  /**
   * Validate puck state and recover if catastrophically invalid
   * This is a BACKUP safety net - Matter.js walls handle normal bouncing
   */
  private validateAndRecoverPuckState(): boolean {
    const pos = this.puck.position;
    const vel = this.puck.velocity;

    // LAYER 1: NaN/Infinity - requires full reset
    const positionInvalid = !Number.isFinite(pos.x) || !Number.isFinite(pos.y);
    const velocityInvalid = !Number.isFinite(vel.x) || !Number.isFinite(vel.y);

    if (positionInvalid || velocityInvalid) {
      console.error('[Physics] CRITICAL: Puck state invalid (NaN/Infinity), resetting');
      this.resetPuck();
      return true;
    }

    // LAYER 2: Catastrophic escape - GENEROUS margin (36px PAST walls)
    // Only trigger if puck is WAY outside bounds (not during normal wall bounces)
    const halfWidth = PHYSICS_CONFIG.table.width / 2;
    const halfHeight = PHYSICS_CONFIG.table.height / 2;
    const escapeMargin = PHYSICS_CONFIG.puck.radius * 3; // 36 pixels past walls

    const escapedX = Math.abs(pos.x) > halfWidth + escapeMargin;  // |x| > 286
    const escapedY = Math.abs(pos.y) > halfHeight + escapeMargin; // |y| > 411

    // Allow goal passage ONLY if we're actively scoring (not already in goal state)
    // After goal is scored, checkGoal() catches it and physics stops
    const inGoalX = Math.abs(pos.x) <= PHYSICS_CONFIG.table.goalWidth / 2;
    const allowGoalPassage = inGoalX && Math.abs(pos.y) > halfHeight && !this.goalScored;

    if ((escapedX || escapedY) && !allowGoalPassage) {
      console.warn('[Physics] Puck escaped bounds, recovering', { pos, vel });

      // Clamp to just inside walls
      const clampMargin = PHYSICS_CONFIG.puck.radius + 1;
      const maxX = halfWidth - clampMargin;
      const maxY = halfHeight - clampMargin;

      // Always clamp both axes when recovering
      let newX = Math.max(-maxX, Math.min(maxX, pos.x));
      let newY = Math.max(-maxY, Math.min(maxY, pos.y));

      // Reverse velocity only for the axis that escaped
      let newVx = escapedX ? -vel.x * 0.7 : vel.x;
      let newVy = escapedY ? -vel.y * 0.7 : vel.y;

      Matter.Body.setPosition(this.puck, { x: newX, y: newY });
      Matter.Body.setVelocity(this.puck, { x: newVx, y: newVy });
    }

    return false;
  }
}
