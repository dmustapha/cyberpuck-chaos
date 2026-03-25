// File: server/src/chaos/executor.ts
// Copied from ARCHITECTURE.md Section 6 (lines 916-1133)
import Matter from 'matter-js';
import {
  PHYSICS_CONFIG,
  MODIFIER_DEFS,
  type ActiveModifier,
  type ModifierType,
  type ModifierVariation,
  type ModifierTarget,
} from '../types/shared';

const { Body } = Matter;

export interface PhysicsBodies {
  puck: Matter.Body;
  paddles: [Matter.Body, Matter.Body];
}

export class ModifierExecutor {
  private activeModifier: ActiveModifier | null = null;
  private transitionProgress = 0;
  private reversing = false;

  // Track true radii to prevent floating-point drift from multiplicative scaling
  // TRAP: Body.scale is multiplicative — always compute factor = target / current
  private trueRadii: { puck: number; paddle1: number; paddle2: number } = {
    puck: PHYSICS_CONFIG.puckRadius,
    paddle1: PHYSICS_CONFIG.paddleRadius,
    paddle2: PHYSICS_CONFIG.paddleRadius,
  };

  private static readonly TRANSITION_FRAMES = 30; // 500ms at 60fps

  get current(): ActiveModifier | null {
    return this.activeModifier;
  }

  applyModifier(
    bodies: PhysicsBodies,
    type: ModifierType,
    variation: ModifierVariation,
    target: ModifierTarget,
    reason: string,
  ): ActiveModifier {
    const now = Date.now();
    const defKey = type === 'invisible_puck'
      ? 'invisible_puck'
      : `${type}_${variation}`;
    const def = MODIFIER_DEFS[defKey] ?? MODIFIER_DEFS[
      Object.keys(MODIFIER_DEFS).find(
        (k) =>
          MODIFIER_DEFS[k].type === type &&
          MODIFIER_DEFS[k].variation === variation,
      ) ?? ''
    ];

    const intensity = def?.intensity ?? 1;
    const duration = def?.duration ?? 5000;

    const modifier: ActiveModifier = {
      id: crypto.randomUUID(),
      type,
      variation,
      target,
      intensity,
      duration,
      reason,
      startTime: now,
      expiresAt: now + duration,
    };

    this.activeModifier = modifier;
    this.transitionProgress = 0;
    this.reversing = false;

    // Apply immediate physics changes
    this.applyPhysics(bodies, modifier, intensity);

    return modifier;
  }

  private applyPhysics(
    bodies: PhysicsBodies,
    modifier: ActiveModifier,
    intensity: number,
  ): void {
    switch (modifier.type) {
      case 'puck_speed': {
        const puck = bodies.puck;
        Body.setVelocity(puck, {
          x: puck.velocity.x * intensity,
          y: puck.velocity.y * intensity,
        });
        break;
      }

      case 'paddle_size': {
        const idx = modifier.target === 'player1' ? 0 : 1;
        const paddle = bodies.paddles[idx];
        const currentRadius =
          modifier.target === 'player1'
            ? this.trueRadii.paddle1
            : this.trueRadii.paddle2;
        const targetRadius = PHYSICS_CONFIG.paddleRadius * intensity;
        const factor = targetRadius / currentRadius;
        Body.scale(paddle, factor, factor);
        if (modifier.target === 'player1') {
          this.trueRadii.paddle1 = targetRadius;
        } else {
          this.trueRadii.paddle2 = targetRadius;
        }
        break;
      }

      case 'puck_size': {
        const puck = bodies.puck;
        const targetRadius = PHYSICS_CONFIG.puckRadius * intensity;
        const factor = targetRadius / this.trueRadii.puck;
        Body.scale(puck, factor, factor);
        this.trueRadii.puck = targetRadius;
        break;
      }

      case 'goal_width':
      case 'invisible_puck':
        // goal_width: client repositions visual goal markers, server tracks state
        // invisible_puck: pure client-side visual — server physics unchanged
        break;
    }
  }

  tick(bodies: PhysicsBodies): { expired: boolean; modifierId?: string } {
    if (!this.activeModifier) return { expired: false };

    const now = Date.now();

    // Check expiry — begin reversal
    if (now >= this.activeModifier.expiresAt && !this.reversing) {
      this.reversing = true;
      this.transitionProgress = 1;
    }

    // Handle reversal transition
    if (this.reversing) {
      this.transitionProgress = Math.max(
        0,
        this.transitionProgress - 1 / ModifierExecutor.TRANSITION_FRAMES,
      );

      if (this.transitionProgress <= 0) {
        this.restore(bodies);
        const modifierId = this.activeModifier.id;
        this.activeModifier = null;
        this.reversing = false;
        return { expired: true, modifierId };
      }
    }

    // Enforce velocity cap — prevents spikes from scale collisions near walls
    const pv = bodies.puck.velocity;
    const speed = Math.sqrt(pv.x * pv.x + pv.y * pv.y);
    const maxSpeed = PHYSICS_CONFIG.puckMaxSpeed * 1.5;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      Body.setVelocity(bodies.puck, { x: pv.x * scale, y: pv.y * scale });
    }

    return { expired: false };
  }

  private restore(bodies: PhysicsBodies): void {
    if (!this.activeModifier) return;
    const mod = this.activeModifier;

    switch (mod.type) {
      case 'paddle_size': {
        const idx = mod.target === 'player1' ? 0 : 1;
        const paddle = bodies.paddles[idx];
        const currentRadius =
          mod.target === 'player1'
            ? this.trueRadii.paddle1
            : this.trueRadii.paddle2;
        const factor = PHYSICS_CONFIG.paddleRadius / currentRadius;
        Body.scale(paddle, factor, factor);
        if (mod.target === 'player1') {
          this.trueRadii.paddle1 = PHYSICS_CONFIG.paddleRadius;
        } else {
          this.trueRadii.paddle2 = PHYSICS_CONFIG.paddleRadius;
        }
        break;
      }

      case 'puck_size': {
        const puck = bodies.puck;
        const factor = PHYSICS_CONFIG.puckRadius / this.trueRadii.puck;
        Body.scale(puck, factor, factor);
        this.trueRadii.puck = PHYSICS_CONFIG.puckRadius;
        break;
      }

      // puck_speed: no restore — velocity changes naturally during gameplay
      // goal_width: client restores visual markers
      // invisible_puck: client restores rendering
    }
  }

  reset(): void {
    this.activeModifier = null;
    this.transitionProgress = 0;
    this.reversing = false;
    this.trueRadii = {
      puck: PHYSICS_CONFIG.puckRadius as number,
      paddle1: PHYSICS_CONFIG.paddleRadius as number,
      paddle2: PHYSICS_CONFIG.paddleRadius as number,
    };
  }
}
