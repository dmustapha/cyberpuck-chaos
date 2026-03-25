'use client';

import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { Difficulty } from '@/types/game';
import { PHYSICS_CONFIG, AI_CONFIGS } from '@/lib/physics/config';

interface UseAIOpponentOptions {
  enabled: boolean;
  difficulty: Difficulty;
  onMove: (x: number, y: number) => void;
  getPuck: () => Matter.Body | null;
}

export function useAIOpponent({
  enabled,
  difficulty,
  onMove,
  getPuck,
}: UseAIOpponentOptions) {
  const lastUpdateRef = useRef(0);
  const targetRef = useRef({
    x: PHYSICS_CONFIG.table.width / 2,
    y: PHYSICS_CONFIG.table.height * 0.15,
  });
  const currentRef = useRef({
    x: PHYSICS_CONFIG.table.width / 2,
    y: PHYSICS_CONFIG.table.height * 0.15,
  });

  useEffect(() => {
    if (!enabled) return;

    const config = AI_CONFIGS[difficulty];
    const { table, paddle } = PHYSICS_CONFIG;

    // Aggressiveness affects how far forward AI pushes (0.1 = near goal, 0.45 = near center)
    const maxForwardY = table.height * (0.1 + config.aggressiveness * 0.35);
    const homeY = table.height * (0.08 + (1 - config.aggressiveness) * 0.12);

    const update = () => {
      const puck = getPuck();
      if (!puck) return;

      const now = performance.now();

      // Update target position at reaction intervals
      if (now - lastUpdateRef.current > config.reactionDelay) {
        lastUpdateRef.current = now;

        // Calculate puck speed to detect if stationary
        const puckSpeed = Math.sqrt(
          puck.velocity.x ** 2 + puck.velocity.y ** 2
        );
        const puckInAIHalf = puck.position.y < table.height / 2;

        let targetX = puck.position.x;
        let targetY = homeY;

        // CASE 1: Puck is stationary/slow AND in AI's half - go hit it!
        if (puckSpeed < 1.5 && puckInAIHalf) {
          // Move toward the puck to hit it
          targetX = puck.position.x;
          // Approach from slightly above the puck to push it down
          // More aggressive AI approaches faster and more directly
          const approachOffset = paddle.radius * (1.2 - config.aggressiveness * 0.5);
          targetY = puck.position.y - approachOffset;
          // Clamp Y to stay in AI's half
          targetY = Math.max(paddle.radius, Math.min(table.height / 2 - paddle.radius, targetY));
        }
        // CASE 2: Puck is moving toward AI (negative Y velocity)
        else if (puck.velocity.y < -0.5) {
          // Defense line depends on aggressiveness
          const defenseY = maxForwardY;
          const timeToReach = Math.abs(
            (puck.position.y - defenseY) / puck.velocity.y
          );
          targetX = puck.position.x + puck.velocity.x * timeToReach;

          // Simulate wall bounces
          let bounceX = targetX;
          let bounceCount = 0;
          while ((bounceX < 0 || bounceX > table.width) && bounceCount < 10) {
            if (bounceX < 0) bounceX = -bounceX;
            if (bounceX > table.width) bounceX = 2 * table.width - bounceX;
            bounceCount++;
          }
          targetX = bounceX;

          // Add prediction error based on difficulty
          const errorRange = (1 - config.predictionAccuracy) * 100;
          targetX += (Math.random() - 0.5) * errorRange;

          // Move forward to intercept
          targetY = defenseY;
        }
        // CASE 3: Puck is moving away (toward player) - return to defensive position
        else if (puck.velocity.y > 0.5) {
          // Return to home position - aggressive AI tracks puck more closely
          const trackingFactor = 0.15 + config.aggressiveness * 0.25;
          targetX = table.width / 2 + (puck.position.x - table.width / 2) * trackingFactor;
          targetY = homeY;
        }
        // CASE 4: Puck is slow but in player's half - stay ready
        else {
          // Slightly track puck position
          const trackingFactor = 0.1 + config.aggressiveness * 0.2;
          targetX = table.width / 2 + (puck.position.x - table.width / 2) * trackingFactor;
          targetY = homeY + table.height * 0.05;
        }

        // Clamp to valid range
        targetRef.current = {
          x: Math.max(
            paddle.radius * 0.3,
            Math.min(table.width - paddle.radius * 0.3, targetX)
          ),
          y: Math.max(
            paddle.radius * 0.3,
            Math.min(table.height / 2 - paddle.radius * 0.3, targetY)
          ),
        };
      }

      // Smoothly move toward target
      const speed = 10 * config.speedMultiplier;
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        const moveX = (dx / dist) * Math.min(speed, dist);
        const moveY = (dy / dist) * Math.min(speed, dist);
        currentRef.current.x += moveX;
        currentRef.current.y += moveY;
      }

      onMove(currentRef.current.x, currentRef.current.y);
    };

    const interval = setInterval(update, 16); // ~60fps

    return () => clearInterval(interval);
  }, [enabled, difficulty, onMove, getPuck]);

  // Reset position when disabled
  useEffect(() => {
    if (!enabled) {
      currentRef.current = {
        x: PHYSICS_CONFIG.table.width / 2,
        y: PHYSICS_CONFIG.table.height * 0.15,
      };
      targetRef.current = { ...currentRef.current };
    }
  }, [enabled]);
}
