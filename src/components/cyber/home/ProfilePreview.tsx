'use client';

/**
 * ProfilePreview - Quick stats card for home page
 */

import React from 'react';
import Link from 'next/link';
import { cyberTheme } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { HUDPanel } from '../ui/HUDPanel';
import { RankBadge } from '../ui/RankBadge';
import { ProgressBar } from '../ui/ProgressBar';
import { StatDisplay } from '../ui/StatDisplay';
import { CyberButton } from '../ui/CyberButton';
import { getLevelProgress, formatLevel } from '@/lib/cyber/xp';
import { formatPercent } from '@/lib/cyber/utils';

interface ProfilePreviewProps {
  className?: string;
}

export function ProfilePreview({ className = '' }: ProfilePreviewProps) {
  const profile = usePlayerStore((state) => state.profile);
  const getWinRate = usePlayerStore((state) => state.getWinRate);

  if (!profile) {
    return (
      <HUDPanel className={className} padding="lg">
        <div className="text-center py-8">
          <h3
            className="text-xl font-bold mb-4"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Welcome, Challenger!
          </h3>
          <p
            className="mb-6"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Start playing to track your progress and climb the ranks.
          </p>
          <Link href="/game">
            <CyberButton variant="primary" glow>
              START PLAYING
            </CyberButton>
          </Link>
        </div>
      </HUDPanel>
    );
  }

  const levelProgress = getLevelProgress(profile.level);
  const winRate = getWinRate();

  return (
    <HUDPanel className={className} padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-bold uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.text.primary,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          Your Profile
        </h3>
        <Link href="/profile">
          <CyberButton variant="ghost" size="sm">
            View Full
          </CyberButton>
        </Link>
      </div>

      {/* Profile info */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar placeholder */}
        <div
          className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${cyberTheme.colors.primary}20`,
            border: `2px solid ${cyberTheme.colors.primary}40`,
          }}
        >
          👤
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-lg font-bold"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {profile.username}
            </span>
            <RankBadge rank={profile.rank} size="sm" showDivision={false} />
          </div>
          <div
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            {formatLevel(profile.level.current)} • {profile.rank.elo} ELO
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Level Progress
          </span>
          <span
            className="text-sm font-bold"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {profile.level.xp} / {profile.level.xpToNextLevel} XP
          </span>
        </div>
        <ProgressBar value={levelProgress} height="sm" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatDisplay
          label="Matches"
          value={profile.stats.totalMatches}
          size="sm"
        />
        <StatDisplay
          label="Wins"
          value={profile.stats.wins}
          size="sm"
          color={cyberTheme.colors.success}
        />
        <StatDisplay
          label="Win Rate"
          value={formatPercent(winRate)}
          size="sm"
          color={winRate >= 50 ? cyberTheme.colors.success : cyberTheme.colors.error}
        />
      </div>
    </HUDPanel>
  );
}

export default ProfilePreview;
