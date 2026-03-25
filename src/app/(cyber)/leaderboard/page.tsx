'use client';

/**
 * Cyber Esports Leaderboard Page
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import { LeaderboardTable, YourRankCard } from '@/components/cyber/leaderboard';
import { HUDPanel, Tabs, Select } from '@/components/cyber/ui';
import type { RankTier } from '@/types/player';

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, username: 'CyberAce', tier: 'MASTER' as RankTier, division: 'I', elo: 2650, wins: 234, losses: 45, winRate: 83.9 },
  { rank: 2, username: 'NeonStrike', tier: 'MASTER' as RankTier, division: 'I', elo: 2520, wins: 198, losses: 52, winRate: 79.2 },
  { rank: 3, username: 'BlazePro', tier: 'DIAMOND' as RankTier, division: 'I', elo: 2380, wins: 167, losses: 58, winRate: 74.2 },
  { rank: 4, username: 'StormRider', tier: 'DIAMOND' as RankTier, division: 'II', elo: 2250, wins: 145, losses: 67, winRate: 68.4 },
  { rank: 5, username: 'FrostByte', tier: 'DIAMOND' as RankTier, division: 'III', elo: 2180, wins: 134, losses: 72, winRate: 65.0 },
  { rank: 6, username: 'ThunderX', tier: 'PLATINUM' as RankTier, division: 'I', elo: 1950, wins: 112, losses: 68, winRate: 62.2 },
  { rank: 7, username: 'ShadowBlade', tier: 'PLATINUM' as RankTier, division: 'II', elo: 1820, wins: 98, losses: 72, winRate: 57.6 },
  { rank: 8, username: 'NightHawk', tier: 'PLATINUM' as RankTier, division: 'III', elo: 1720, wins: 89, losses: 78, winRate: 53.3 },
  { rank: 9, username: 'VoidWalker', tier: 'GOLD' as RankTier, division: 'I', elo: 1580, wins: 78, losses: 72, winRate: 52.0 },
  { rank: 10, username: 'StarDust', tier: 'GOLD' as RankTier, division: 'II', elo: 1450, wins: 65, losses: 68, winRate: 48.9 },
];

const tierFilters = [
  { value: 'all', label: 'All Tiers' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DIAMOND', label: 'Diamond' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'GOLD', label: 'Gold' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'BRONZE', label: 'Bronze' },
];

export default function CyberLeaderboardPage() {
  const [tierFilter, setTierFilter] = useState('all');
  const profile = usePlayerStore((state) => state.profile);

  // Filter entries
  const filteredEntries = mockLeaderboard.filter(
    (entry) => tierFilter === 'all' || entry.tier === tierFilter
  );

  // Find current player's rank (mock)
  const currentPlayerRank = profile ? 42 : undefined;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Global Rankings
          </h1>
          <p style={{ color: cyberTheme.colors.text.secondary }}>
            Compete and climb the leaderboard
          </p>
        </div>

        {/* Your rank card */}
        {profile && (
          <YourRankCard currentRank={currentPlayerRank} className="mb-8" />
        )}

        {/* Filters */}
        <HUDPanel className="mb-6" padding="md">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-bold uppercase"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Filter by Tier
            </span>
            <Select
              options={tierFilters}
              value={tierFilter}
              onChange={setTierFilter}
              size="sm"
            />
          </div>
        </HUDPanel>

        {/* Leaderboard table */}
        <LeaderboardTable
          entries={filteredEntries.map((entry) => ({
            ...entry,
            isCurrentPlayer: profile?.username === entry.username,
          }))}
        />

        {/* Note about local data */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Note: This is a local simulation. In a full implementation, this would connect to a global server.
        </p>
      </div>
    </div>
  );
}
