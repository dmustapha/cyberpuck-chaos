'use client';

/**
 * EloDisplay - ELO number display with change indicator
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface EloDisplayProps {
  elo: number;
  change?: number;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    value: 'text-lg',
    change: 'text-xs',
  },
  md: {
    value: 'text-2xl',
    change: 'text-sm',
  },
  lg: {
    value: 'text-4xl',
    change: 'text-base',
  },
};

export function EloDisplay({
  elo,
  change,
  size = 'md',
  showChange = true,
  animate = true,
  className = '',
}: EloDisplayProps) {
  const sizes = sizeConfig[size];
  const hasChange = change !== undefined && change !== 0;
  const isPositive = change && change > 0;

  const changeColor = isPositive
    ? cyberTheme.colors.success
    : cyberTheme.colors.error;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main ELO value */}
      <span
        className={`${sizes.value} font-bold tabular-nums`}
        style={{
          color: cyberTheme.colors.text.primary,
          fontFamily: cyberTheme.fonts.heading,
          textShadow: `0 0 10px ${cyberTheme.colors.primary}40`,
        }}
      >
        {elo.toLocaleString()}
      </span>

      {/* Change indicator */}
      {showChange && hasChange && (
        <span
          className={`${sizes.change} font-bold flex items-center gap-0.5 ${
            animate ? 'animate-fade-in' : ''
          }`}
          style={{ color: changeColor }}
        >
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>{isPositive ? '+' : ''}{change}</span>
        </span>
      )}
    </div>
  );
}

export default EloDisplay;
