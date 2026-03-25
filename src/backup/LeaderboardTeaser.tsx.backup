'use client';

/**
 * LeaderboardTeaser - Top 5 preview for home page
 */

import React from 'react';
import Link from 'next/link';
import { cyberTheme, getRankColor } from '@/lib/cyber/theme';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import type { RankTier } from '@/types/player';

interface LeaderboardEntry {
  rank: number;
  username: string;
  tier: RankTier;
  elo: number;
}

interface LeaderboardTeaserProps {
  className?: string;
}

// Mock data for demonstration
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'CyberAce', tier: 'MASTER', elo: 2650 },
  { rank: 2, username: 'NeonStrike', tier: 'MASTER', elo: 2520 },
  { rank: 3, username: 'BlazePro', tier: 'DIAMOND', elo: 2380 },
  { rank: 4, username: 'StormRider', tier: 'DIAMOND', elo: 2250 },
  { rank: 5, username: 'FrostByte', tier: 'DIAMOND', elo: 2180 },
];

const tierIcons: Record<RankTier, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
  DIAMOND: '💠',
  MASTER: '👑',
};

export function LeaderboardTeaser({ className = '' }: LeaderboardTeaserProps) {
  return (
    <HUDPanel className={className} padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.text.primary,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          Top Players
        </h3>
        <Link href="/leaderboard">
          <CyberButton variant="ghost" size="sm">
            View All
          </CyberButton>
        </Link>
      </div>

      {/* Leaderboard list */}
      <div className="space-y-2">
        {mockLeaderboard.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center gap-3 p-2 rounded-md"
            style={{
              backgroundColor:
                entry.rank === 1
                  ? `${getRankColor(entry.tier)}15`
                  : 'transparent',
            }}
          >
            {/* Rank */}
            <div
              className="w-8 text-center font-bold"
              style={{
                color:
                  entry.rank <= 3
                    ? getRankColor(entry.tier)
                    : cyberTheme.colors.text.muted,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              #{entry.rank}
            </div>

            {/* Icon */}
            <span className="text-lg">{tierIcons[entry.tier]}</span>

            {/* Username */}
            <span
              className="flex-1 font-medium truncate"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {entry.username}
            </span>

            {/* ELO */}
            <span
              className="text-sm font-bold tabular-nums"
              style={{
                color: getRankColor(entry.tier),
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {entry.elo}
            </span>
          </div>
        ))}
      </div>
    </HUDPanel>
  );
}

export default LeaderboardTeaser;
