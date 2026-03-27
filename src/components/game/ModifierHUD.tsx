// File: src/components/game/ModifierHUD.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActiveModifier, ModifierType } from '../../types/game';

/* ── Label map ─────────────────────────────────────────── */
const MODIFIER_LABELS: Record<string, string> = {
  puck_speed_boost: 'SPEED BOOST',
  puck_speed_slow: 'SLOW MOTION',
  paddle_size_shrink: 'PADDLE SHRINK',
  paddle_size_grow: 'PADDLE GROW',
  goal_width_widen: 'WIDE GOALS',
  goal_width_narrow: 'NARROW GOALS',
  puck_size_grow: 'BIG PUCK',
  puck_size_shrink: 'TINY PUCK',
  invisible_puck_hidden: 'GHOST PUCK',
};

/* ── Accent color per modifier type ─────────────────────── */
const MODIFIER_COLORS: Record<ModifierType, { glow: string; bar: string }> = {
  puck_speed: { glow: '#00f0ff', bar: '#00f0ff' },
  paddle_size: { glow: '#a78bfa', bar: '#a78bfa' },
  goal_width: { glow: '#fbbf24', bar: '#fbbf24' },
  puck_size: { glow: '#34d399', bar: '#34d399' },
  invisible_puck: { glow: '#f472b6', bar: '#f472b6' },
};

/* ── SVG icons per modifier type ────────────────────────── */
function ModifierIcon({ type }: { type: ModifierType }) {
  const color = MODIFIER_COLORS[type]?.glow ?? '#00f0ff';
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'puck_speed':
      return (
        <svg {...props}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8" />
        </svg>
      );
    case 'paddle_size':
      return (
        <svg {...props}>
          <path d="M21 12H3M16 7l5 5-5 5M8 7L3 12l5 5" />
        </svg>
      );
    case 'goal_width':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18" />
        </svg>
      );
    case 'puck_size':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'invisible_puck':
      return (
        <svg {...props}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

/* ── Component ──────────────────────────────────────────── */
interface ModifierHUDProps {
  modifier: ActiveModifier | null;
}

export function ModifierHUD({ modifier }: ModifierHUDProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!modifier) {
      setVisible(false);
      prevIdRef.current = null;
      return;
    }

    // New modifier arrived
    if (modifier.id !== prevIdRef.current) {
      prevIdRef.current = modifier.id;
      setVisible(true);
    }

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

  const label =
    modifier
      ? (MODIFIER_LABELS[`${modifier.type}_${modifier.variation}`] ?? 'CHAOS')
      : 'CHAOS';
  const colors = modifier
    ? (MODIFIER_COLORS[modifier.type] ?? { glow: '#00f0ff', bar: '#00f0ff' })
    : { glow: '#00f0ff', bar: '#00f0ff' };
  const progress = modifier ? timeLeft / modifier.duration : 0;
  const isLow = progress <= 0.25;

  return (
    <AnimatePresence>
      {modifier && visible && (
        <motion.div
          key={modifier.id}
          className="fixed top-20 left-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: -30, x: '-50%', scale: 0.8, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.9, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className="flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-lg"
            style={{
              background: 'rgba(10, 15, 20, 0.9)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${colors.glow}40`,
              boxShadow: `0 0 24px ${colors.glow}25, inset 0 0 12px ${colors.glow}08`,
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
            >
              <ModifierIcon type={modifier.type} />
            </motion.div>

            {/* Label */}
            <span
              className="text-xs font-bold tracking-[0.2em] uppercase"
              style={{
                fontFamily: "var(--font-orbitron), 'Orbitron', monospace",
                color: colors.glow,
                textShadow: `0 0 8px ${colors.glow}60`,
              }}
            >
              {label}
            </span>

            {/* Separator */}
            <div
              className="w-px h-4 mx-1"
              style={{ backgroundColor: `${colors.glow}30` }}
            />

            {/* Timer bar */}
            <div className="w-14 h-1.5 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isLow
                    ? 'linear-gradient(90deg, #ff3366, #ff0055)'
                    : `linear-gradient(90deg, ${colors.bar}, ${colors.bar}aa)`,
                  boxShadow: `0 0 6px ${isLow ? '#ff3366' : colors.bar}`,
                }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>

            {/* Time remaining */}
            <span
              className="text-xs font-mono tabular-nums w-8 text-right"
              style={{
                color: isLow ? '#ff3366' : `${colors.glow}cc`,
                textShadow: isLow ? '0 0 6px #ff336660' : 'none',
              }}
            >
              {(timeLeft / 1000).toFixed(1)}
            </span>
          </div>

          {/* Flash effect on entry */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${colors.glow}30, transparent 70%)`,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
