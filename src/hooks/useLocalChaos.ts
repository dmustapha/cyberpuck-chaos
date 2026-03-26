// File: src/hooks/useLocalChaos.ts
// Client-side chaos agent for AI mode.
// Tries the server's /api/chaos/observe endpoint for LLM decisions,
// falls back to a local modifier pool to guarantee chaos always fires.
'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import type { ActiveModifier, ModifierType, ModifierVariation, ModifierTarget } from '../types/game';

// Timing constants
const FIRST_OBSERVE_DELAY = 5000;
const OBSERVE_INTERVAL = 12000;
const MODIFIER_DURATION = 8000;
const SERVER_URL = process.env.NEXT_PUBLIC_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '') || 'http://localhost:3001';

// Local modifier pool — cycles through these when LLM returns skip
const MODIFIER_POOL: Array<{
  type: ModifierType;
  variation: ModifierVariation;
  target: ModifierTarget;
  reason: string;
}> = [
  { type: 'paddle_size', variation: 'shrink', target: 'player2', reason: 'AI paddle shrunk! Time to attack!' },
  { type: 'puck_speed', variation: 'boost', target: 'puck', reason: 'TURBO MODE! Puck is blazing fast!' },
  { type: 'puck_size', variation: 'grow', target: 'puck', reason: 'Giant puck incoming! Harder to miss!' },
  { type: 'paddle_size', variation: 'grow', target: 'player1', reason: 'Your paddle just grew! Big advantage!' },
  { type: 'puck_speed', variation: 'slow', target: 'puck', reason: 'Slow motion! Every move counts!' },
  { type: 'invisible_puck', variation: 'hidden', target: 'puck', reason: 'Ghost puck! Can you track it?' },
  { type: 'puck_size', variation: 'shrink', target: 'puck', reason: 'Tiny puck! Precision mode activated!' },
  { type: 'paddle_size', variation: 'shrink', target: 'player1', reason: 'Your paddle shrunk! Defend carefully!' },
  { type: 'paddle_size', variation: 'grow', target: 'player2', reason: 'AI paddle grew! Watch out!' },
];

interface UseLocalChaosOptions {
  enabled: boolean;
}

export function useLocalChaos({ enabled }: UseLocalChaosOptions) {
  const [activeModifier, setActiveModifier] = useState<ActiveModifier | null>(null);

  // All mutable state in a single ref object to avoid stale closures
  const stateRef = useRef({
    timer: null as ReturnType<typeof setTimeout> | null,
    expireTimer: null as ReturnType<typeof setTimeout> | null,
    modifierActive: false,
    matchStart: 0,
    enabled,
    hasStarted: false,
    mounted: true,
    poolIndex: Math.floor(Math.random() * MODIFIER_POOL.length),
    skipCount: 0,
  });

  // Keep enabled in sync
  stateRef.current.enabled = enabled;

  useEffect(() => {
    const s = stateRef.current;
    s.mounted = true;

    const reschedule = () => {
      if (!s.mounted) return;
      s.timer = setTimeout(() => observe(), OBSERVE_INTERVAL);
    };

    const deployModifier = (mod: {
      type: ModifierType;
      variation: ModifierVariation;
      target: ModifierTarget;
      reason: string;
    }) => {
      if (!s.mounted) return;

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
      const mod = MODIFIER_POOL[s.poolIndex % MODIFIER_POOL.length];
      s.poolIndex++;
      deployModifier(mod);
    };

    const observe = () => {
      if (!s.mounted) return;

      if (!s.enabled || s.modifierActive) {
        reschedule();
        return;
      }

      const scores = useGameStore.getState().scores;
      const matchTimeSeconds = Math.floor((Date.now() - s.matchStart) / 1000);

      const input = {
        score: [scores.player1, scores.player2],
        streaks: [0, 0],
        paddleActivity: [0.7, 0.3],
        puckAvgSpeed: 7,
        matchPhase: matchTimeSeconds < 15 ? 'early' : matchTimeSeconds < 60 ? 'mid' : 'late',
        recentModifiers: [],
        matchTimeSeconds: Math.max(matchTimeSeconds, 16),
        matchDurationLimit: 180,
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
            s.skipCount = 0;
            deployModifier({
              type: data.modifier.type,
              variation: data.modifier.variation,
              target: data.modifier.target,
              reason: data.modifier.reason || 'Chaos agent strikes!',
            });
          } else {
            s.skipCount++;
            if (s.skipCount >= 2) {
              s.skipCount = 0;
              deployFromPool();
            }
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

    // Start chain when enabled becomes true for the first time
    if (enabled && !s.hasStarted) {
      s.hasStarted = true;
      s.matchStart = Date.now();
      s.modifierActive = false;
      s.skipCount = 0;
      s.timer = setTimeout(() => observe(), FIRST_OBSERVE_DELAY);
    }

    return () => {
      s.mounted = false;
      if (s.timer) { clearTimeout(s.timer); s.timer = null; }
      if (s.expireTimer) { clearTimeout(s.expireTimer); s.expireTimer = null; }
      s.hasStarted = false;
      s.matchStart = 0;
      s.modifierActive = false;
    };
  }, [enabled]);

  return activeModifier;
}
