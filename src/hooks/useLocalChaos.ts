// File: src/hooks/useLocalChaos.ts
// Client-side chaos agent for AI mode.
// Fixed interval from game start, ramps based on score thresholds.
// LLM decides WHAT modifier + WHO to target. Always deploys, never skips.
// Tracks recent modifiers to avoid repeats.
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { ActiveModifier, ModifierType, ModifierVariation, ModifierTarget } from '../types/game';

// Base interval and score-based ramp
const BASE_INTERVAL = 17000; // 10s active + 7s gap (~10s felt with LLM)
const MEDIUM_INTERVAL = 14000; // 10s active + 4s gap (~7s felt with LLM)
const FAST_INTERVAL = 11000; // 10s active + 1s gap (~4s felt with LLM)
const FIRST_OBSERVE_DELAY = 5000; // 5s before first modifier
const MODIFIER_DURATION = 10000; // 10s per modifier

const SERVER_URL = process.env.NEXT_PUBLIC_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '') || 'http://localhost:3001';

// Score thresholds per maxScore setting
// [mediumThreshold, fastThreshold] — when highest score reaches these, interval ramps
function getThresholds(maxScore: number): [number, number] {
  switch (maxScore) {
    case 5: return [3, 4];
    case 7: return [4, 5];
    case 10: return [6, 8];
    default: return [Math.ceil(maxScore * 0.57), Math.ceil(maxScore * 0.71)];
  }
}

function getInterval(highScore: number, maxScore: number): number {
  const [medium, fast] = getThresholds(maxScore);
  if (highScore >= fast) return FAST_INTERVAL;
  if (highScore >= medium) return MEDIUM_INTERVAL;
  return BASE_INTERVAL;
}

// Local fallback pool — used when server is unreachable
// Balanced: 2 each of puck_speed, paddle_size, puck_size + 1 invisible_puck = 7 entries
const MODIFIER_POOL: Array<{
  type: ModifierType;
  variation: ModifierVariation;
  target: ModifierTarget;
  reason: string;
}> = [
  { type: 'puck_speed', variation: 'boost', target: 'puck', reason: 'TURBO MODE! Puck is blazing fast!' },
  { type: 'paddle_size', variation: 'shrink', target: 'player2', reason: 'AI paddle shrunk! Time to attack!' },
  { type: 'puck_size', variation: 'grow', target: 'puck', reason: 'Giant puck incoming!' },
  { type: 'invisible_puck', variation: 'hidden', target: 'puck', reason: 'Ghost puck! Where did it go?!' },
  { type: 'puck_size', variation: 'shrink', target: 'puck', reason: 'Tiny puck! Precision mode!' },
  { type: 'paddle_size', variation: 'grow', target: 'player1', reason: 'Your paddle powered up!' },
];

interface UseLocalChaosOptions {
  enabled: boolean;
}

export function useLocalChaos({ enabled }: UseLocalChaosOptions) {
  const [activeModifier, setActiveModifier] = useState<ActiveModifier | null>(null);

  const stateRef = useRef({
    timer: null as ReturnType<typeof setTimeout> | null,
    expireTimer: null as ReturnType<typeof setTimeout> | null,
    modifierActive: false,
    matchStart: 0,
    enabled,
    hasStarted: false,
    mounted: true,
    poolIndex: Math.floor(Math.random() * MODIFIER_POOL.length),
    recentTypes: [] as string[], // last 3 modifier types for anti-repeat
  });

  stateRef.current.enabled = enabled;

  useEffect(() => {
    const s = stateRef.current;
    s.mounted = true;

    const getMatchTime = () => Math.floor((Date.now() - s.matchStart) / 1000);

    const reschedule = () => {
      if (!s.mounted) return;
      const { scores, maxScore } = useGameStore.getState();
      const highScore = Math.max(scores.player1, scores.player2);
      const interval = getInterval(highScore, maxScore);
      s.timer = setTimeout(() => observe(), interval);
    };

    const trackRecent = (type: string) => {
      s.recentTypes.push(type);
      if (s.recentTypes.length > 3) s.recentTypes.shift();
    };

    const deployModifier = (mod: {
      type: ModifierType;
      variation: ModifierVariation;
      target: ModifierTarget;
      reason: string;
    }) => {
      if (!s.mounted) return;

      // Clear any existing expire timer to prevent it killing this new modifier
      if (s.expireTimer) { clearTimeout(s.expireTimer); s.expireTimer = null; }

      trackRecent(mod.type);

      const now = Date.now();
      const modifier: ActiveModifier = {
        id: `chaos-${now}`,
        type: mod.type,
        variation: mod.variation,
        target: mod.target,
        intensity: 1,
        duration: MODIFIER_DURATION,
        reason: mod.reason,
        startTime: now,
        expiresAt: now + MODIFIER_DURATION,
      };

      s.modifierActive = true;
      setActiveModifier(modifier);

      s.expireTimer = setTimeout(() => {
        if (!s.mounted) return;
        setActiveModifier(null);
        s.modifierActive = false;
      }, MODIFIER_DURATION);
    };

    const deployFromPool = () => {
      // Pick from pool, skipping recent types
      let attempts = 0;
      let mod = MODIFIER_POOL[s.poolIndex % MODIFIER_POOL.length];
      while (s.recentTypes.includes(mod.type) && attempts < MODIFIER_POOL.length) {
        s.poolIndex++;
        mod = MODIFIER_POOL[s.poolIndex % MODIFIER_POOL.length];
        attempts++;
      }
      s.poolIndex++;
      deployModifier(mod);
    };

    const observe = () => {
      if (!s.mounted) return;

      if (!s.enabled || s.modifierActive) {
        reschedule();
        return;
      }

      const { scores, maxScore } = useGameStore.getState();
      const matchTimeSec = getMatchTime();
      const highScore = Math.max(scores.player1, scores.player2);
      const phase = highScore >= maxScore - 2 ? 'late' : highScore >= Math.ceil(maxScore * 0.4) ? 'mid' : 'early';

      const input = {
        score: [scores.player1, scores.player2],
        matchPhase: phase,
        recentModifiers: [...s.recentTypes],
        matchTimeSeconds: matchTimeSec,
        maxScore,
      };

      fetch(`${SERVER_URL}/api/chaos/observe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!s.mounted) return;
          if (data.action === 'deploy_modifier' && data.modifier) {
            deployModifier({
              type: data.modifier.type,
              variation: data.modifier.variation,
              target: data.modifier.target,
              reason: data.modifier.reason || 'Chaos agent strikes!',
            });
          } else {
            // LLM returned skip despite prompt — force from pool
            deployFromPool();
          }
        })
        .catch(() => {
          if (!s.mounted) return;
          deployFromPool();
        })
        .finally(() => {
          reschedule();
        });
    };

    if (enabled && !s.hasStarted) {
      s.hasStarted = true;
      s.matchStart = Date.now();
      s.modifierActive = false;
      s.recentTypes = [];
      s.poolIndex = Math.floor(Math.random() * MODIFIER_POOL.length);
      s.timer = setTimeout(() => observe(), FIRST_OBSERVE_DELAY);
    }

    return () => {
      s.mounted = false;
      if (s.timer) { clearTimeout(s.timer); s.timer = null; }
      if (s.expireTimer) { clearTimeout(s.expireTimer); s.expireTimer = null; }
      setActiveModifier(null);
      s.hasStarted = false;
      s.matchStart = 0;
      s.modifierActive = false;
    };
  }, [enabled]);

  return activeModifier;
}
