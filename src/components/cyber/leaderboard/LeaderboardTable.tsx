'use client';

/**
 * LeaderboardTable - Full rankings table component
 */

import React from 'react';
import { cyberTheme, getRankColor } from '@/lib/cyber/theme';
import { HUDPanel } from '../ui/HUDPanel';
import type { RankTier } from '@/types/player';

interface LeaderboardEntry {
  rank: number;
  username: string;
  tier: RankTier;
  division: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
  isCurrentPlayer?: boolean;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const tierIcons: Record<RankTier, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
  DIAMOND: '💠',
  MASTER: '👑',
};

export function LeaderboardTable({ entries, className = '' }: LeaderboardTableProps) {
  return (
    <HUDPanel className={className} padding="lg">
      {/* Table header */}
      <div
        className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 p-3 rounded-lg mb-2"
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
        }}
      >
        <span
          className="text-xs font-bold uppercase"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Rank
        </span>
        <span
          className="text-xs font-bold uppercase"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Player
        </span>
        <span
          className="text-xs font-bold uppercase text-right"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          ELO
        </span>
        <span
          className="text-xs font-bold uppercase text-right"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          W/L
        </span>
        <span
          className="text-xs font-bold uppercase text-right"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Win %
        </span>
      </div>

      {/* Table rows */}
      <div className="space-y-1">
        {entries.map((entry) => {
          const rankColor = getRankColor(entry.tier);

          return (
            <div
              key={entry.rank}
              className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 p-3 rounded-lg items-center"
              style={{
                backgroundColor: entry.isCurrentPlayer
                  ? `${cyberTheme.colors.primary}15`
                  : 'transparent',
                border: entry.isCurrentPlayer
                  ? `1px solid ${cyberTheme.colors.primary}40`
                  : '1px solid transparent',
              }}
            >
              {/* Rank number */}
              <span
                className="font-bold"
                style={{
                  color:
                    entry.rank <= 3
                      ? rankColor
                      : cyberTheme.colors.text.secondary,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                #{entry.rank}
              </span>

              {/* Player info */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">{tierIcons[entry.tier]}</span>
                <span
                  className="font-bold truncate"
                  style={{
                    color: entry.isCurrentPlayer
                      ? cyberTheme.colors.primary
                      : cyberTheme.colors.text.primary,
                    fontFamily: cyberTheme.fonts.heading,
                  }}
                >
                  {entry.username}
                  {entry.isCurrentPlayer && (
                    <span
                      className="text-xs ml-2"
                      style={{ color: cyberTheme.colors.primary }}
                    >
                      (You)
                    </span>
                  )}
                </span>
                <span
                  className="text-xs"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  {entry.tier} {entry.division}
                </span>
              </div>

              {/* ELO */}
              <span
                className="text-right font-bold"
                style={{
                  color: rankColor,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {entry.elo}
              </span>

              {/* W/L */}
              <span
                className="text-right"
                style={{ color: cyberTheme.colors.text.secondary }}
              >
                <span style={{ color: cyberTheme.colors.success }}>
                  {entry.wins}
                </span>
                {' / '}
                <span style={{ color: cyberTheme.colors.error }}>
                  {entry.losses}
                </span>
              </span>

              {/* Win rate */}
              <span
                className="text-right font-bold"
                style={{
                  color:
                    entry.winRate >= 50
                      ? cyberTheme.colors.success
                      : cyberTheme.colors.error,
                }}
              >
                {entry.winRate.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </HUDPanel>
  );
}

export default LeaderboardTable;
