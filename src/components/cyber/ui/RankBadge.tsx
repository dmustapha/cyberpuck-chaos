'use client';

/**
 * RankBadge - Display rank tier and division with styled badge
 */

import React from 'react';
import type { RankTier, Division, PlayerRank } from '@/types/player';
import { cyberTheme, getRankColor } from '@/lib/cyber/theme';
import { formatRank } from '@/lib/cyber/elo';

interface RankBadgeProps {
  rank: PlayerRank;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDivision?: boolean;
  showElo?: boolean;
  glow?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'text-sm',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    icon: 'text-base',
  },
  lg: {
    padding: 'px-4 py-1.5',
    text: 'text-base',
    icon: 'text-lg',
  },
  xl: {
    padding: 'px-5 py-2',
    text: 'text-lg',
    icon: 'text-2xl',
  },
};

const tierIcons: Record<RankTier, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
  DIAMOND: '💠',
  MASTER: '👑',
};

export function RankBadge({
  rank,
  size = 'md',
  showDivision = true,
  showElo = false,
  glow = true,
  className = '',
}: RankBadgeProps) {
  const rankColor = getRankColor(rank.tier);
  const sizes = sizeConfig[size];
  const displayRank = showDivision ? formatRank(rank) : rank.tier;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md font-bold ${sizes.padding} ${sizes.text} ${className}`}
      style={{
        backgroundColor: `${rankColor}20`,
        border: `1px solid ${rankColor}60`,
        color: rankColor,
        boxShadow: glow ? `0 0 15px ${rankColor}40` : 'none',
        fontFamily: cyberTheme.fonts.heading,
      }}
    >
      <span className={sizes.icon}>{tierIcons[rank.tier]}</span>
      <span>{displayRank}</span>
      {showElo && (
        <span
          className="opacity-70 ml-1"
          style={{ fontSize: '0.85em' }}
        >
          ({rank.elo})
        </span>
      )}
    </div>
  );
}

export default RankBadge;
