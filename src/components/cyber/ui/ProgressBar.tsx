'use client';

/**
 * ProgressBar - Animated progress bar with glow effect
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'none';
  color?: string;
  backgroundColor?: string;
  height?: 'xs' | 'sm' | 'md' | 'lg';
  animate?: boolean;
  glow?: boolean;
  segments?: number;
  className?: string;
}

const heightStyles = {
  xs: 'h-1',
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  labelPosition = 'outside',
  color = cyberTheme.colors.primary,
  backgroundColor = cyberTheme.colors.bg.tertiary,
  height = 'md',
  animate = true,
  glow = true,
  segments,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {/* Outside label */}
      {showLabel && labelPosition === 'outside' && (
        <div
          className="flex justify-between text-xs mb-1"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          <span>{Math.round(percentage)}%</span>
          <span>
            {value}/{max}
          </span>
        </div>
      )}

      {/* Progress container */}
      <div
        className={`relative w-full ${heightStyles[height]} rounded-full overflow-hidden`}
        style={{ backgroundColor }}
      >
        {/* Segments */}
        {segments && (
          <div className="absolute inset-0 flex">
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r"
                style={{
                  borderColor: cyberTheme.colors.bg.primary,
                  borderWidth: i < segments - 1 ? '2px' : '0',
                }}
              />
            ))}
          </div>
        )}

        {/* Progress fill */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${
            animate ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: glow ? `0 0 10px ${color}, 0 0 5px ${color}` : 'none',
          }}
        >
          {/* Shimmer effect */}
          {animate && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)`,
                animation: 'shimmer 2s infinite',
              }}
            />
          )}

          {/* Inside label */}
          {showLabel && labelPosition === 'inside' && percentage > 15 && (
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
              style={{
                color: cyberTheme.colors.text.primary,
                textShadow: '0 0 2px rgba(0,0,0,0.5)',
              }}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
