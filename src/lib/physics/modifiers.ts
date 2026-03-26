// File: src/lib/physics/modifiers.ts
// Client-side modifier executor — applies/reverts physics mutations for chaos modifiers.
// Key pattern: Never read body.circleRadius (unreliable after Body.scale). Track radii independently.

import Matter from 'matter-js';
import { PHYSICS_CONFIG } from './config';
import type { ActiveModifier } from '@/types/game';

const { Body } = Matter;

export interface ModifierState {
  trueRadii: { puck: number; paddle1: number; paddle2: number };
  activeMaxSpeed: number | null; // null = use config default
  activeModifier: { type: string; variation: string; target: string } | null;
}

export function createModifierState(): ModifierState {
  return {
    trueRadii: {
      puck: PHYSICS_CONFIG.puck.radius,
      paddle1: PHYSICS_CONFIG.paddle.radius,
      paddle2: PHYSICS_CONFIG.paddle.radius,
    },
    activeMaxSpeed: null,
    activeModifier: null,
  };
}

interface Bodies {
  puck: Matter.Body;
  paddle1: Matter.Body;
  paddle2: Matter.Body;
}

export function applyModifier(
  state: ModifierState,
  bodies: Bodies,
  modifier: ActiveModifier,
): ModifierState {
  // If a modifier is already active, revert first to prevent compound scaling
  const clean = state.activeModifier ? revertModifier(state, bodies) : state;

  const { puck: puckConfig, paddle: paddleConfig } = PHYSICS_CONFIG;
  const newState = {
    ...clean,
    trueRadii: { ...clean.trueRadii },
    activeModifier: { type: modifier.type, variation: modifier.variation, target: modifier.target },
  };

  switch (modifier.type) {
    case 'puck_speed': {
      if (modifier.variation === 'boost') {
        newState.activeMaxSpeed = puckConfig.maxSpeed * 1.5;
        // Scale current velocity up
        const speed = Math.sqrt(bodies.puck.velocity.x ** 2 + bodies.puck.velocity.y ** 2);
        if (speed > 0.5) {
          const scale = Math.min(newState.activeMaxSpeed / speed, 1.5);
          Body.setVelocity(bodies.puck, {
            x: bodies.puck.velocity.x * scale,
            y: bodies.puck.velocity.y * scale,
          });
        }
      } else {
        newState.activeMaxSpeed = puckConfig.maxSpeed * 0.5;
        // Scale current velocity down
        const speed = Math.sqrt(bodies.puck.velocity.x ** 2 + bodies.puck.velocity.y ** 2);
        if (speed > newState.activeMaxSpeed) {
          const scale = newState.activeMaxSpeed / speed;
          Body.setVelocity(bodies.puck, {
            x: bodies.puck.velocity.x * scale,
            y: bodies.puck.velocity.y * scale,
          });
        }
      }
      break;
    }

    case 'paddle_size': {
      const targetKey = modifier.target === 'player1' ? 'paddle1' : 'paddle2';
      const targetBody = modifier.target === 'player1' ? bodies.paddle1 : bodies.paddle2;
      const factor = modifier.variation === 'shrink' ? 0.6 : 1.5;
      const scaleFactor = (paddleConfig.radius * factor) / clean.trueRadii[targetKey];
      Body.scale(targetBody, scaleFactor, scaleFactor);
      newState.trueRadii[targetKey] = paddleConfig.radius * factor;
      (targetBody as any).circleRadius = paddleConfig.radius * factor;
      break;
    }

    case 'puck_size': {
      const factor = modifier.variation === 'grow' ? 2 : 0.5;
      const scaleFactor = (puckConfig.radius * factor) / clean.trueRadii.puck;
      Body.scale(bodies.puck, scaleFactor, scaleFactor);
      newState.trueRadii.puck = puckConfig.radius * factor;
      (bodies.puck as any).circleRadius = puckConfig.radius * factor;
      break;
    }

    case 'invisible_puck':
      // Handled purely in GameCanvas (alpha), no physics change
      break;

    case 'goal_width':
      // Deferred — wall gaps baked at creation
      break;
  }

  return newState;
}

export function revertModifier(
  state: ModifierState,
  bodies: Bodies,
): ModifierState {
  const { puck: puckConfig, paddle: paddleConfig } = PHYSICS_CONFIG;

  // Revert puck size
  if (state.trueRadii.puck !== puckConfig.radius) {
    const scaleFactor = puckConfig.radius / state.trueRadii.puck;
    Body.scale(bodies.puck, scaleFactor, scaleFactor);
    (bodies.puck as any).circleRadius = puckConfig.radius;
  }

  // Revert paddle1 size
  if (state.trueRadii.paddle1 !== paddleConfig.radius) {
    const scaleFactor = paddleConfig.radius / state.trueRadii.paddle1;
    Body.scale(bodies.paddle1, scaleFactor, scaleFactor);
    (bodies.paddle1 as any).circleRadius = paddleConfig.radius;
  }

  // Revert paddle2 size
  if (state.trueRadii.paddle2 !== paddleConfig.radius) {
    const scaleFactor = paddleConfig.radius / state.trueRadii.paddle2;
    Body.scale(bodies.paddle2, scaleFactor, scaleFactor);
    (bodies.paddle2 as any).circleRadius = paddleConfig.radius;
  }

  return createModifierState();
}

export function getEffectiveRadii(state: ModifierState): {
  puck: number;
  paddle1: number;
  paddle2: number;
} {
  return { ...state.trueRadii };
}
