'use client';

/**
 * StatsGrid - Stats cards grid display
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { HUDPanel } from '../ui/HUDPanel';
import { StatDisplay } from '../ui/StatDisplay';
import { formatDuration, formatPercent } from '@/lib/cyber/utils';

interface StatsGridProps {
  className?: string;
}

export function StatsGrid({ className = '' }: StatsGridProps) {
  const profile = usePlayerStore((state) => state.profile);
  const getWinRate = usePlayerStore((state) => state.getWinRate);
  const getGoalDifferential = usePlayerStore((state) => state.getGoalDifferential);

  if (!profile) return null;

  const winRate = getWinRate();
  const goalDiff = getGoalDifferential();

  const stats = [
    {
      label: 'Matches',
      value: profile.stats.totalMatches,
    },
    {
      label: 'Wins',
      value: profile.stats.wins,
      color: cyberTheme.colors.success,
    },
    {
      label: 'Losses',
      value: profile.stats.losses,
      color: cyberTheme.colors.error,
    },
    {
      label: 'Win Rate',
      value: formatPercent(winRate),
      color: winRate >= 50 ? cyberTheme.colors.success : cyberTheme.colors.error,
    },
    {
      label: 'Goals Scored',
      value: profile.stats.totalGoalsScored,
    },
    {
      label: 'Goals Conceded',
      value: profile.stats.totalGoalsConceded,
    },
    {
      label: 'Goal Diff',
      value: goalDiff >= 0 ? `+${goalDiff}` : goalDiff.toString(),
      color: goalDiff >= 0 ? cyberTheme.colors.success : cyberTheme.colors.error,
    },
    {
      label: 'Play Time',
      value: formatDuration(profile.stats.totalPlayTime),
    },
    {
      label: 'Best Streak',
      value: profile.stats.maxWinStreak,
      color: cyberTheme.colors.warning,
    },
    {
      label: 'Current Streak',
      value: profile.stats.winStreak,
    },
    {
      label: 'Perfect Games',
      value: profile.stats.perfectGames,
      color: cyberTheme.colors.rank.GOLD,
    },
    {
      label: 'Comebacks',
      value: profile.stats.comebackWins,
      color: cyberTheme.colors.primary,
    },
  ];

  return (
    <HUDPanel className={className} padding="lg">
      {/* Header */}
      <h3
        className="text-lg font-bold uppercase tracking-wider mb-4"
        style={{
          color: cyberTheme.colors.text.primary,
          fontFamily: cyberTheme.fonts.heading,
        }}
      >
        Statistics
      </h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-3 rounded-lg"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
            }}
          >
            <StatDisplay
              label={stat.label}
              value={stat.value}
              size="sm"
              color={stat.color}
            />
          </div>
        ))}
      </div>
    </HUDPanel>
  );
}

export default StatsGrid;
