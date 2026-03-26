// File: src/components/game/ModifierHUD.tsx
'use client';

import { useEffect, useState } from 'react';
import type { ActiveModifier, ModifierType } from '../../types/game';

const MODIFIER_ICONS: Record<ModifierType, string> = {
  puck_speed: '⚡',
  paddle_size: '🏓',
  goal_width: '🥅',
  puck_size: '⚪',
  invisible_puck: '👻',
};

const MODIFIER_LABELS: Record<string, string> = {
  puck_speed_boost: 'PUCK SPEED BOOST',
  puck_speed_slow: 'PUCK SLOWDOWN',
  paddle_size_shrink: 'PADDLE SHRINK',
  paddle_size_grow: 'PADDLE GROW',
  goal_width_widen: 'GOAL WIDEN',
  goal_width_narrow: 'GOAL NARROW',
  puck_size_grow: 'PUCK GROW',
  puck_size_shrink: 'PUCK SHRINK',
  invisible_puck_hidden: 'INVISIBLE PUCK',
};

interface ModifierHUDProps {
  modifier: ActiveModifier | null;
}

export function ModifierHUD({ modifier }: ModifierHUDProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!modifier) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const update = () => {
      const remaining = Math.max(0, modifier.expiresAt - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setVisible(false);
      }
    };

    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [modifier]);

  if (!modifier || !visible) return null;

  const label =
    MODIFIER_LABELS[`${modifier.type}_${modifier.variation}`] ?? 'CHAOS';
  const icon = MODIFIER_ICONS[modifier.type] ?? '🔮';
  const progress = timeLeft / modifier.duration;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{
        animation: 'slideInUp 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-cyan-500/30"
        style={{
          background: 'rgba(10, 10, 30, 0.85)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
        }}
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex flex-col">
          <span
            className="text-xs font-bold tracking-widest"
            style={{
              fontFamily: "'Orbitron', monospace",
              color: '#00f0ff',
            }}
          >
            {label}
          </span>
          <span className="text-[10px] text-gray-400 max-w-[200px] truncate">
            {modifier.reason}
          </span>
        </div>
        <div className="w-16 h-1.5 rounded-full bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress * 100}%`,
              background:
                progress > 0.3
                  ? 'linear-gradient(90deg, #00f0ff, #0080ff)'
                  : 'linear-gradient(90deg, #ff3366, #ff0080)',
            }}
          />
        </div>
        <span
          className="text-sm font-mono tabular-nums"
          style={{ color: progress > 0.3 ? '#00f0ff' : '#ff3366' }}
        >
          {(timeLeft / 1000).toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
