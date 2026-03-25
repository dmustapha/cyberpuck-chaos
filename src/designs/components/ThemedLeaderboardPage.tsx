'use client';

/**
 * ThemedLeaderboardPage - Leaderboard page with design system theming
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesignStyles } from '../useDesignStyles';
import { useDesign } from '../DesignContext';
import { usePlayerStore } from '@/stores/playerStore';
import type { RankTier } from '@/types/player';

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

export function ThemedLeaderboardPage() {
  const styles = useDesignStyles();
  const { config } = useDesign();
  const [tierFilter, setTierFilter] = useState('all');
  const profile = usePlayerStore((state) => state.profile);

  const filteredEntries = mockLeaderboard.filter(
    (entry) => tierFilter === 'all' || entry.tier === tierFilter
  );

  const getRankColor = (tier: RankTier) => {
    return styles.colors.rank[tier] || styles.colors.primary;
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="text-3xl md:text-4xl font-black uppercase tracking-wider mb-2"
            style={{
              color: styles.colors.text.primary,
              fontFamily: styles.fonts.heading,
              textShadow: styles.effects.glowIntensity > 15
                ? styles.shadows.glowText(styles.colors.primary)
                : 'none',
            }}
          >
            Global Rankings
          </h1>
          <p style={{ color: styles.colors.text.secondary }}>
            Compete and climb the leaderboard
          </p>
        </motion.div>

        {/* Your rank card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl"
            style={{
              background: styles.colors.bg.card,
              border: `1px solid ${styles.colors.primary}40`,
              boxShadow: styles.shadows.glow(styles.colors.primary),
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${getRankColor(profile.rank.tier)}20`,
                    border: `2px solid ${getRankColor(profile.rank.tier)}`,
                  }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: getRankColor(profile.rank.tier) }}
                  >
                    {profile.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div
                    className="font-bold text-lg"
                    style={{ color: styles.colors.text.primary }}
                  >
                    {profile.username}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: getRankColor(profile.rank.tier) }}
                  >
                    {profile.rank.tier} {profile.rank.division}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: styles.colors.primary,
                    fontFamily: styles.fonts.score,
                  }}
                >
                  #{42}
                </div>
                <div
                  className="text-sm"
                  style={{ color: styles.colors.text.muted }}
                >
                  Your Rank
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-xl flex items-center justify-between"
          style={{
            background: styles.colors.bg.card,
            border: `1px solid ${styles.colors.border.subtle}`,
          }}
        >
          <span
            className="text-sm font-bold uppercase"
            style={{ color: styles.colors.text.secondary }}
          >
            Filter by Tier
          </span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              background: styles.colors.bg.primary,
              border: `1px solid ${styles.colors.border.default}`,
              color: styles.colors.text.primary,
            }}
          >
            {tierFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Leaderboard table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: styles.colors.bg.card,
            border: `1px solid ${styles.colors.border.subtle}`,
          }}
        >
          {/* Table header */}
          <div
            className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-bold uppercase tracking-wider"
            style={{
              background: `${styles.colors.primary}10`,
              color: styles.colors.text.secondary,
              borderBottom: `1px solid ${styles.colors.border.subtle}`,
            }}
          >
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-2 text-right">ELO</div>
            <div className="col-span-3 text-right">Win Rate</div>
          </div>

          {/* Table rows */}
          {filteredEntries.map((entry, index) => {
            const isCurrentPlayer = profile?.username === entry.username;
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors"
                style={{
                  background: isCurrentPlayer
                    ? `${styles.colors.primary}15`
                    : 'transparent',
                  borderBottom:
                    index < filteredEntries.length - 1
                      ? `1px solid ${styles.colors.border.subtle}`
                      : 'none',
                }}
              >
                <div
                  className="col-span-1 font-bold"
                  style={{
                    color:
                      entry.rank <= 3
                        ? styles.colors.warning
                        : styles.colors.text.primary,
                    fontFamily: styles.fonts.score,
                  }}
                >
                  {getMedalEmoji(entry.rank)}
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      background: `${getRankColor(entry.tier)}20`,
                      color: getRankColor(entry.tier),
                    }}
                  >
                    {entry.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: styles.colors.text.primary }}
                  >
                    {entry.username}
                  </span>
                </div>
                <div className="col-span-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{
                      background: `${getRankColor(entry.tier)}20`,
                      color: getRankColor(entry.tier),
                    }}
                  >
                    {entry.tier} {entry.division}
                  </span>
                </div>
                <div
                  className="col-span-2 text-right font-bold"
                  style={{
                    color: styles.colors.primary,
                    fontFamily: styles.fonts.score,
                  }}
                >
                  {entry.elo.toLocaleString()}
                </div>
                <div
                  className="col-span-3 text-right font-medium"
                  style={{
                    color:
                      entry.winRate >= 60
                        ? styles.colors.success
                        : entry.winRate >= 50
                        ? styles.colors.warning
                        : styles.colors.error,
                  }}
                >
                  {entry.winRate.toFixed(1)}%
                  <span
                    className="text-xs ml-2"
                    style={{ color: styles.colors.text.muted }}
                  >
                    ({entry.wins}W-{entry.losses}L)
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Note */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: styles.colors.text.muted }}
        >
          Note: This is a local simulation. Rankings update after each ranked match.
        </p>
      </div>
    </div>
  );
}

export default ThemedLeaderboardPage;
