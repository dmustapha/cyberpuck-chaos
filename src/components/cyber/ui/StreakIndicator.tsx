'use client';

/**
 * StreakIndicator - Visual win/loss streak display
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface StreakIndicatorProps {
  streak: number;
  type: 'win' | 'loss' | 'none';
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    bar: 'w-1 h-3',
    gap: 'gap-0.5',
    text: 'text-xs',
  },
  md: {
    bar: 'w-1.5 h-4',
    gap: 'gap-1',
    text: 'text-sm',
  },
  lg: {
    bar: 'w-2 h-5',
    gap: 'gap-1',
    text: 'text-base',
  },
};

export function StreakIndicator({
  streak,
  type,
  maxDisplay = 10,
  size = 'md',
  showLabel = true,
  className = '',
}: StreakIndicatorProps) {
  const sizes = sizeConfig[size];
  const displayCount = Math.min(streak, maxDisplay);
  const hasMore = streak > maxDisplay;

  const getColor = () => {
    switch (type) {
      case 'win':
        return cyberTheme.colors.success;
      case 'loss':
        return cyberTheme.colors.error;
      default:
        return cyberTheme.colors.text.muted;
    }
  };

  const color = getColor();

  if (type === 'none' || streak === 0) {
    return null;
  }

  return (
    <div className={`flex items-center ${sizes.gap} ${className}`}>
      {/* Streak bars */}
      <div className={`flex items-end ${sizes.gap}`}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <div
            key={i}
            className={`${sizes.bar} rounded-sm`}
            style={{
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}`,
              opacity: 0.5 + (i / displayCount) * 0.5,
            }}
          />
        ))}
        {hasMore && (
          <span
            className={`${sizes.text} font-bold ml-0.5`}
            style={{ color }}
          >
            +
          </span>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={`${sizes.text} font-bold uppercase`}
          style={{
            color,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          {streak} {type === 'win' ? 'W' : 'L'}
        </span>
      )}
    </div>
  );
}

export default StreakIndicator;
