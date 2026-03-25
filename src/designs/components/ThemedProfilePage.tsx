'use client';

/**
 * ThemedProfilePage - Profile page with design system theming
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDesignStyles } from '../useDesignStyles';
import { useDesign } from '../DesignContext';
import { usePlayerStore } from '@/stores/playerStore';

interface MatchHistoryEntry {
  id: string;
  opponent: string;
  result: 'win' | 'loss';
  score: string;
  eloChange: number;
  date: string;
}

const mockMatchHistory: MatchHistoryEntry[] = [
  { id: '1', opponent: 'AI (Hard)', result: 'win', score: '7-4', eloChange: 28, date: '2024-01-15' },
  { id: '2', opponent: 'AI (Medium)', result: 'win', score: '7-2', eloChange: 18, date: '2024-01-15' },
  { id: '3', opponent: 'AI (Hard)', result: 'loss', score: '5-7', eloChange: -22, date: '2024-01-14' },
  { id: '4', opponent: 'AI (Easy)', result: 'win', score: '7-0', eloChange: 8, date: '2024-01-14' },
  { id: '5', opponent: 'AI (Medium)', result: 'win', score: '7-5', eloChange: 15, date: '2024-01-13' },
];

export function ThemedProfilePage() {
  const styles = useDesignStyles();
  const { config } = useDesign();
  const profile = usePlayerStore((state) => state.profile);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl max-w-md"
          style={{
            background: styles.colors.bg.card,
            border: `1px solid ${styles.colors.border.default}`,
          }}
        >
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: `${styles.colors.primary}20`,
              border: `2px solid ${styles.colors.primary}40`,
            }}
          >
            <span className="text-4xl">👤</span>
          </div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              color: styles.colors.text.primary,
              fontFamily: styles.fonts.heading,
            }}
          >
            No Profile Found
          </h2>
          <p
            className="mb-6"
            style={{ color: styles.colors.text.secondary }}
          >
            Start playing to create your profile and track your progress!
          </p>
          <Link href={`/designs/${config.id}/play`}>
            <button
              className="px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: styles.colors.primary,
                color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
                boxShadow: styles.shadows.glowStrong(styles.colors.primary),
              }}
            >
              Play Now
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const winRate = profile.stats.totalMatches > 0
    ? Math.round((profile.stats.wins / profile.stats.totalMatches) * 100)
    : 0;

  const goalDiff = profile.stats.totalGoalsScored - profile.stats.totalGoalsConceded;

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getRankColor = (tier: string) => {
    return styles.colors.rank[tier as keyof typeof styles.colors.rank] || styles.colors.primary;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 md:p-8 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${styles.colors.bg.card}, ${styles.colors.primary}10)`,
            border: `1px solid ${styles.colors.primary}40`,
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${styles.colors.primary}40, ${styles.colors.secondary}40)`,
                border: `3px solid ${styles.colors.primary}`,
                boxShadow: styles.shadows.glow(styles.colors.primary),
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{
                  color: styles.colors.primary,
                  fontFamily: styles.fonts.heading,
                }}
              >
                {profile.username.substring(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  color: styles.colors.text.primary,
                  fontFamily: styles.fonts.heading,
                }}
              >
                {profile.username}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    background: `${getRankColor(profile.rank.tier)}20`,
                    color: getRankColor(profile.rank.tier),
                    border: `1px solid ${getRankColor(profile.rank.tier)}40`,
                  }}
                >
                  {profile.rank.tier} {profile.rank.division}
                </span>
                <span
                  className="text-sm"
                  style={{ color: styles.colors.text.muted }}
                >
                  Level {profile.level.current}
                </span>
                <span
                  className="text-sm"
                  style={{ color: styles.colors.text.muted }}
                >
                  {profile.rank.elo} ELO
                </span>
              </div>
            </div>

            {/* Edit button */}
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: 'transparent',
                border: `1px solid ${styles.colors.border.default}`,
                color: styles.colors.text.secondary,
              }}
            >
              Edit Profile
            </button>
          </div>

          {/* XP Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm"
                style={{ color: styles.colors.text.muted }}
              >
                Level {profile.level.current} Progress
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: styles.colors.primary }}
              >
                {profile.level.xp} / {profile.level.xpToNextLevel} XP
              </span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: `${styles.colors.primary}20` }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(profile.level.xp / profile.level.xpToNextLevel) * 100}%`,
                  background: `linear-gradient(90deg, ${styles.colors.primary}, ${styles.colors.secondary || styles.colors.primary})`,
                  boxShadow: styles.shadows.glow(styles.colors.primary),
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            label="Matches"
            value={profile.stats.totalMatches}
            styles={styles}
          />
          <StatCard
            label="Win Rate"
            value={`${winRate}%`}
            subValue={`${profile.stats.wins}W - ${profile.stats.losses}L`}
            color={winRate >= 50 ? styles.colors.success : styles.colors.error}
            styles={styles}
          />
          <StatCard
            label="Best Streak"
            value={profile.stats.maxWinStreak}
            color={styles.colors.warning}
            styles={styles}
          />
          <StatCard
            label="Goal Diff"
            value={goalDiff >= 0 ? `+${goalDiff}` : goalDiff.toString()}
            color={goalDiff >= 0 ? styles.colors.success : styles.colors.error}
            styles={styles}
          />
          <StatCard
            label="Goals Scored"
            value={profile.stats.totalGoalsScored}
            styles={styles}
          />
          <StatCard
            label="Goals Conceded"
            value={profile.stats.totalGoalsConceded}
            styles={styles}
          />
          <StatCard
            label="Perfect Games"
            value={profile.stats.perfectGames}
            color={styles.colors.warning}
            styles={styles}
          />
          <StatCard
            label="Play Time"
            value={formatPlayTime(profile.stats.totalPlayTime)}
            styles={styles}
          />
        </motion.div>

        {/* Match history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: styles.colors.bg.card,
            border: `1px solid ${styles.colors.border.subtle}`,
          }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${styles.colors.border.subtle}` }}
          >
            <h2
              className="text-xl font-bold"
              style={{
                color: styles.colors.text.primary,
                fontFamily: styles.fonts.heading,
              }}
            >
              Recent Matches
            </h2>
            <span
              className="text-sm"
              style={{ color: styles.colors.text.muted }}
            >
              Last 5 matches
            </span>
          </div>

          {mockMatchHistory.map((match, index) => (
            <div
              key={match.id}
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom:
                  index < mockMatchHistory.length - 1
                    ? `1px solid ${styles.colors.border.subtle}`
                    : 'none',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{
                    background:
                      match.result === 'win'
                        ? `${styles.colors.success}20`
                        : `${styles.colors.error}20`,
                    color:
                      match.result === 'win'
                        ? styles.colors.success
                        : styles.colors.error,
                  }}
                >
                  {match.result === 'win' ? 'W' : 'L'}
                </div>
                <div>
                  <div
                    className="font-medium"
                    style={{ color: styles.colors.text.primary }}
                  >
                    vs {match.opponent}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: styles.colors.text.muted }}
                  >
                    {match.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="font-bold"
                  style={{
                    color: styles.colors.text.primary,
                    fontFamily: styles.fonts.score,
                  }}
                >
                  {match.score}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{
                    color:
                      match.eloChange >= 0
                        ? styles.colors.success
                        : styles.colors.error,
                  }}
                >
                  {match.eloChange >= 0 ? '+' : ''}
                  {match.eloChange} ELO
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <Link href={`/designs/${config.id}/achievements`}>
            <div
              className="p-6 rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: styles.colors.bg.card,
                border: `1px solid ${styles.colors.border.subtle}`,
              }}
            >
              <span className="text-3xl mb-2 block">🏆</span>
              <div
                className="font-bold"
                style={{
                  color: styles.colors.text.primary,
                  fontFamily: styles.fonts.heading,
                }}
              >
                View Achievements
              </div>
            </div>
          </Link>
          <Link href={`/designs/${config.id}/leaderboard`}>
            <div
              className="p-6 rounded-2xl text-center cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: styles.colors.bg.card,
                border: `1px solid ${styles.colors.border.subtle}`,
              }}
            >
              <span className="text-3xl mb-2 block">📊</span>
              <div
                className="font-bold"
                style={{
                  color: styles.colors.text.primary,
                  fontFamily: styles.fonts.heading,
                }}
              >
                View Leaderboard
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  color,
  styles,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
  styles: ReturnType<typeof useDesignStyles>;
}) {
  return (
    <div
      className="p-4 rounded-xl text-center"
      style={{
        background: styles.colors.bg.card,
        border: `1px solid ${styles.colors.border.subtle}`,
      }}
    >
      <div
        className="text-2xl font-bold mb-1"
        style={{
          color: color || styles.colors.primary,
          fontFamily: styles.fonts.score,
        }}
      >
        {value}
      </div>
      <div
        className="text-xs uppercase tracking-wider"
        style={{ color: styles.colors.text.muted }}
      >
        {label}
      </div>
      {subValue && (
        <div
          className="text-xs mt-1"
          style={{ color: styles.colors.text.muted }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
}

export default ThemedProfilePage;
