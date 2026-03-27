'use client';

/**
 * TierIcon - SVG rank tier icons replacing emoji medals/crowns
 */

import React from 'react';
import type { RankTier } from '@/types/player';
import { getRankColor } from '@/lib/cyber/theme';

interface TierIconProps {
  tier: RankTier;
  size?: number;
  className?: string;
}

export function TierIcon({ tier, size = 20, className = '' }: TierIconProps) {
  const color = getRankColor(tier);
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (tier) {
    case 'BRONZE':
    case 'SILVER':
    case 'GOLD':
      // Medal icon — circle with ribbon
      return (
        <svg {...props}>
          <circle cx="12" cy="9" r="6" fill={`${color}20`} />
          <path d="M12 15l-3 6 3-2 3 2-3-6" />
          <path d="M9 6l3 3 3-3" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'PLATINUM':
      // Gem icon
      return (
        <svg {...props}>
          <path d="M6 3h12l3 6-9 12L3 9z" fill={`${color}15`} />
          <path d="M6 3h12l3 6-9 12L3 9z" />
          <path d="M3 9h18" />
          <path d="M12 21L9 9l3-6 3 6z" />
        </svg>
      );
    case 'DIAMOND':
      // Diamond icon — multi-faceted
      return (
        <svg {...props}>
          <path d="M6 3h12l3 6-9 12L3 9z" fill={`${color}15`} />
          <path d="M6 3h12l3 6-9 12L3 9z" />
          <path d="M3 9h18" />
          <path d="M12 21L8 9l4-6 4 6z" />
          <path d="M6 3l2 6M18 3l-2 6" />
        </svg>
      );
    case 'MASTER':
      // Crown icon
      return (
        <svg {...props}>
          <path d="M2 20h20" />
          <path d="M4 20V10l4 4 4-8 4 8 4-4v10" fill={`${color}20`} />
          <path d="M4 20V10l4 4 4-8 4 8 4-4v10" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

export default TierIcon;
