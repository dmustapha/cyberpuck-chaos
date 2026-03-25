'use client';

/**
 * StatusBadge - Theme-aware status badges
 */

import React from 'react';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';

type BadgeStatus = 'live' | 'ranked' | 'casual' | 'online' | 'offline' | 'away' | 'custom';

interface StatusBadgeProps {
  status: BadgeStatus;
  customText?: string;
  customColor?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function StatusBadge({
  status,
  customText,
  customColor,
  size = 'md',
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  const theme = useThemedStyles();

  // Theme-aware status colors (no purple)
  const statusConfig: Record<BadgeStatus, { color: string; text: string }> = {
    live: { color: theme.colors.error, text: 'LIVE' },
    ranked: { color: theme.colors.primary, text: 'RANKED' },
    casual: { color: theme.colors.info, text: 'CASUAL' },
    online: { color: theme.colors.success, text: 'ONLINE' },
    offline: { color: theme.colors.text.muted, text: 'OFFLINE' },
    away: { color: theme.colors.warning, text: 'AWAY' },
    custom: { color: theme.colors.primary, text: '' },
  };

  const config = statusConfig[status];
  const color = customColor || config.color;
  const text = customText || config.text;

  const shouldPulse = pulse || status === 'live';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded font-bold uppercase tracking-wider ${sizeConfig[size]} ${className}`}
      style={{
        backgroundColor: `${color}20`,
        border: `1px solid ${color}50`,
        color,
        fontFamily: theme.fonts.heading,
      }}
    >
      {/* Pulse dot */}
      {shouldPulse && (
        <span className="relative flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            style={{ backgroundColor: color }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </span>
      )}
      <span>{text}</span>
    </div>
  );
}

export default StatusBadge;
