'use client';

/**
 * StatDisplay - Label + large value display for stats
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface StatDisplayProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    label: 'text-xs',
    value: 'text-xl',
    sub: 'text-xs',
  },
  md: {
    label: 'text-sm',
    value: 'text-2xl',
    sub: 'text-sm',
  },
  lg: {
    label: 'text-base',
    value: 'text-4xl',
    sub: 'text-base',
  },
};

export function StatDisplay({
  label,
  value,
  subValue,
  icon,
  trend,
  trendValue,
  size = 'md',
  color,
  className = '',
}: StatDisplayProps) {
  const sizes = sizeConfig[size];
  const valueColor = color || cyberTheme.colors.text.primary;

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return cyberTheme.colors.success;
      case 'down':
        return cyberTheme.colors.error;
      default:
        return cyberTheme.colors.text.muted;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '●';
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label row */}
      <div
        className={`flex items-center gap-1.5 ${sizes.label} uppercase tracking-wider mb-1`}
        style={{ color: cyberTheme.colors.text.secondary }}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        <span>{label}</span>
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-2">
        <span
          className={`${sizes.value} font-bold`}
          style={{
            color: valueColor,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 10px ${valueColor}40`,
          }}
        >
          {value}
        </span>

        {subValue && (
          <span
            className={sizes.sub}
            style={{ color: cyberTheme.colors.text.muted }}
          >
            {subValue}
          </span>
        )}
      </div>

      {/* Trend indicator */}
      {trend && trendValue && (
        <div
          className={`flex items-center gap-1 mt-1 ${sizes.sub}`}
          style={{ color: getTrendColor() }}
        >
          <span className="text-xs">{getTrendIcon()}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

export default StatDisplay;
