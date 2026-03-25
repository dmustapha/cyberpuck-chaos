'use client';

/**
 * ComboCounter - Animated combo multiplier display
 */

import React, { useEffect, useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface ComboCounterProps {
  combo: number;
  animate?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    value: 'text-2xl',
    label: 'text-xs',
    container: 'w-12 h-12',
  },
  md: {
    value: 'text-4xl',
    label: 'text-sm',
    container: 'w-16 h-16',
  },
  lg: {
    value: 'text-5xl',
    label: 'text-base',
    container: 'w-20 h-20',
  },
};

export function ComboCounter({
  combo,
  animate = true,
  showLabel = true,
  size = 'md',
  className = '',
}: ComboCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const sizes = sizeConfig[size];

  // Get color based on combo count
  const getComboColor = () => {
    if (combo >= 10) return '#ff00ff'; // Magenta for legendary
    if (combo >= 7) return cyberTheme.colors.rank.DIAMOND;
    if (combo >= 5) return cyberTheme.colors.rank.GOLD;
    if (combo >= 3) return cyberTheme.colors.primary;
    return cyberTheme.colors.secondary;
  };

  const color = getComboColor();

  // Trigger animation on combo change
  useEffect(() => {
    if (animate && combo > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [combo, animate]);

  if (combo < 2) return null;

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${sizes.container} ${className}`}
      style={{
        transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          border: `2px solid ${color}`,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
          animation: animate ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      />

      {/* Inner content */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ color }}
      >
        <span
          className={`${sizes.value} font-black`}
          style={{
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          }}
        >
          {combo}x
        </span>
        {showLabel && (
          <span
            className={`${sizes.label} font-bold uppercase tracking-wider -mt-1`}
            style={{
              fontFamily: cyberTheme.fonts.heading,
              opacity: 0.8,
            }}
          >
            COMBO
          </span>
        )}
      </div>
    </div>
  );
}

export default ComboCounter;
