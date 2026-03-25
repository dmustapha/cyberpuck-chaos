'use client';

/**
 * YourRankCard - Highlighted current player rank card
 */

import React from 'react';
import { cyberTheme, getRankColor } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { HUDPanel } from '../ui/HUDPanel';
import { RankBadge } from '../ui/RankBadge';
import { formatRank } from '@/lib/cyber/elo';
import { formatPercent } from '@/lib/cyber/utils';

interface YourRankCardProps {
  currentRank?: number;
  className?: string;
}

export function YourRankCard({ currentRank, className = '' }: YourRankCardProps) {
  const profile = usePlayerStore((state) => state.profile);
  const getWinRate = usePlayerStore((state) => state.getWinRate);

  if (!profile) return null;

  const rankColor = getRankColor(profile.rank.tier);
  const winRate = getWinRate();

  return (
    <HUDPanel className={className} variant="glow" padding="lg">
      <div
        className="text-xs uppercase tracking-wider mb-3"
        style={{ color: cyberTheme.colors.text.muted }}
      >
        Your Ranking
      </div>

      <div className="flex items-center gap-4">
        {/* Rank number */}
        <div
          className="text-4xl font-black"
          style={{
            color: cyberTheme.colors.primary,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          #{currentRank || '?'}
        </div>

        {/* Divider */}
        <div
          className="w-px h-12"
          style={{ backgroundColor: cyberTheme.colors.border.default }}
        />

        {/* Player info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="font-bold"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {profile.username}
            </span>
            <RankBadge rank={profile.rank} size="sm" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span
              style={{
                color: rankColor,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {profile.rank.elo} ELO
            </span>
            <span style={{ color: cyberTheme.colors.text.muted }}>•</span>
            <span style={{ color: cyberTheme.colors.text.secondary }}>
              {profile.stats.wins}W / {profile.stats.losses}L
            </span>
            <span style={{ color: cyberTheme.colors.text.muted }}>•</span>
            <span
              style={{
                color:
                  winRate >= 50
                    ? cyberTheme.colors.success
                    : cyberTheme.colors.error,
              }}
            >
              {formatPercent(winRate)}
            </span>
          </div>
        </div>
      </div>
    </HUDPanel>
  );
}

export default YourRankCard;
