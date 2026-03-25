'use client';

/**
 * RankCard - Large rank display with ELO progress
 */

import React from 'react';
import { cyberTheme, getRankColor } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { HUDPanel } from '../ui/HUDPanel';
import { ProgressBar } from '../ui/ProgressBar';
import { getProgressToNextDivision, getEloToNextDivision, formatRank } from '@/lib/cyber/elo';
import type { RankTier } from '@/types/player';

interface RankCardProps {
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

export function RankCard({ className = '' }: RankCardProps) {
  const profile = usePlayerStore((state) => state.profile);

  if (!profile) return null;

  const rankColor = getRankColor(profile.rank.tier);
  const progress = getProgressToNextDivision(profile.rank.elo);
  const eloToNext = getEloToNextDivision(profile.rank.elo);

  return (
    <HUDPanel className={className} padding="lg" variant="glow">
      {/* Rank header */}
      <div
        className="text-xs uppercase tracking-wider mb-4"
        style={{ color: cyberTheme.colors.text.muted }}
      >
        Current Rank
      </div>

      {/* Rank display */}
      <div className="flex items-center gap-4 mb-6">
        {/* Large icon */}
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center text-5xl"
          style={{
            backgroundColor: `${rankColor}20`,
            border: `3px solid ${rankColor}`,
            boxShadow: `0 0 30px ${rankColor}40`,
          }}
        >
          {tierIcons[profile.rank.tier]}
        </div>

        {/* Rank text */}
        <div>
          <div
            className="text-3xl font-black uppercase"
            style={{
              color: rankColor,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: `0 0 20px ${rankColor}`,
            }}
          >
            {formatRank(profile.rank)}
          </div>
          <div
            className="text-4xl font-black"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {profile.rank.elo}
            <span
              className="text-lg ml-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              ELO
            </span>
          </div>
        </div>
      </div>

      {/* Progress to next */}
      {profile.rank.tier !== 'MASTER' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span
              className="text-sm"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Progress to next
            </span>
            <span
              className="text-sm"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {eloToNext} ELO needed
            </span>
          </div>
          <ProgressBar
            value={progress}
            height="md"
            color={rankColor}
            glow
          />
        </div>
      )}

      {/* Master rank message */}
      {profile.rank.tier === 'MASTER' && (
        <div
          className="text-center p-4 rounded-lg"
          style={{
            backgroundColor: `${rankColor}10`,
            border: `1px solid ${rankColor}30`,
          }}
        >
          <span
            className="font-bold uppercase"
            style={{ color: rankColor }}
          >
            Master Tier Achieved!
          </span>
        </div>
      )}
    </HUDPanel>
  );
}

export default RankCard;
