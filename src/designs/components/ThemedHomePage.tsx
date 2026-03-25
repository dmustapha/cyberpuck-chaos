'use client';

/**
 * ThemedHomePage - Full home page with hero, stats, and season tracking
 * Uses DesignConfig for complete theming
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDesignStyles } from '../useDesignStyles';
import { useDesign } from '../DesignContext';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';

export function ThemedHomePage() {
  const router = useRouter();
  const styles = useDesignStyles();
  const { config } = useDesign();
  const goToModeSelection = useGameStore((state) => state.goToModeSelection);
  const profile = usePlayerStore((state) => state.profile);

  const handlePlayNow = () => {
    goToModeSelection();
    router.push(`/designs/${config.id}/play`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: `${styles.colors.success}20`,
                border: `1px solid ${styles.colors.success}40`,
                color: styles.colors.success,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              LIVE
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-wider"
            style={{
              fontFamily: styles.fonts.heading,
              color: styles.colors.text.primary,
              textShadow: styles.effects.glowIntensity > 15
                ? styles.shadows.glowText(styles.colors.primary)
                : 'none',
            }}
          >
            AIR{' '}
            <span style={{ color: styles.colors.primary }}>HOCKEY</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: styles.colors.text.secondary }}
          >
            Compete in the ultimate air hockey experience. Climb the ranks,
            unlock achievements, and prove you&apos;re the best.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handlePlayNow}
              className="px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary || styles.colors.primary})`,
                color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
                boxShadow: styles.shadows.glowStrong(styles.colors.primary),
              }}
            >
              Play Now
            </button>
            <Link href={`/designs/${config.id}/leaderboard`}>
              <button
                className="px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wider transition-all hover:opacity-80"
                style={{
                  background: `${styles.colors.primary}15`,
                  border: `2px solid ${styles.colors.primary}40`,
                  color: styles.colors.primary,
                }}
              >
                View Rankings
              </button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 md:gap-16"
            style={{ color: styles.colors.text.muted }}
          >
            <StatItem
              value="25+"
              label="Achievements"
              styles={styles}
            />
            <StatItem
              value="6"
              label="Rank Tiers"
              styles={styles}
            />
            <StatItem
              value="100"
              label="Max Level"
              styles={styles}
            />
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: `linear-gradient(to top, ${styles.colors.bg.primary}, transparent)`,
          }}
        />
      </section>

      {/* Profile Preview Section */}
      {profile && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-6 md:p-8"
              style={{
                background: styles.colors.bg.card,
                border: `1px solid ${styles.colors.border.subtle}`,
                boxShadow: styles.shadows.panel,
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${styles.colors.primary}40, ${styles.colors.secondary}40)`,
                    border: `3px solid ${styles.colors.primary}`,
                  }}
                >
                  <span
                    className="text-2xl font-bold"
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
                  <h3
                    className="text-2xl font-bold mb-1"
                    style={{
                      color: styles.colors.text.primary,
                      fontFamily: styles.fonts.heading,
                    }}
                  >
                    {profile.username}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-sm"
                      style={{ color: styles.colors.text.muted }}
                    >
                      Level {profile.level.current}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        background: `${styles.colors.rank[profile.rank.tier]}20`,
                        color: styles.colors.rank[profile.rank.tier],
                      }}
                    >
                      {profile.rank.tier}
                    </span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: styles.colors.success,
                        fontFamily: styles.fonts.score,
                      }}
                    >
                      {profile.stats.wins}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wider"
                      style={{ color: styles.colors.text.muted }}
                    >
                      Wins
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: styles.colors.error,
                        fontFamily: styles.fonts.score,
                      }}
                    >
                      {profile.stats.losses}
                    </div>
                    <div
                      className="text-xs uppercase tracking-wider"
                      style={{ color: styles.colors.text.muted }}
                    >
                      Losses
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: styles.colors.primary,
                        fontFamily: styles.fonts.score,
                      }}
                    >
                      {profile.stats.wins + profile.stats.losses > 0
                        ? Math.round(
                            (profile.stats.wins /
                              (profile.stats.wins + profile.stats.losses)) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div
                      className="text-xs uppercase tracking-wider"
                      style={{ color: styles.colors.text.muted }}
                    >
                      Win Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm"
                    style={{ color: styles.colors.text.muted }}
                  >
                    XP Progress
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: styles.colors.primary }}
                  >
                    {profile.level.xp} / {profile.level.xpToNextLevel} XP
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
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
          </div>
        </section>
      )}

      {/* Season Banner */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${styles.colors.primary}30, ${styles.colors.secondary}20)`,
              border: `1px solid ${styles.colors.primary}40`,
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: styles.colors.primary,
                    color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
                  }}
                >
                  Season 1
                </span>
                <span
                  className="text-sm"
                  style={{ color: styles.colors.text.muted }}
                >
                  72 days remaining
                </span>
              </div>

              <h2
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{
                  fontFamily: styles.fonts.heading,
                  color: styles.colors.text.primary,
                }}
              >
                {config.name} Championship
              </h2>

              <p
                className="text-lg mb-6 max-w-2xl"
                style={{ color: styles.colors.text.secondary }}
              >
                Compete in ranked matches to climb the leaderboard and earn exclusive
                rewards.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: styles.colors.primary,
                    color: config.id === 'arctic-frost' ? styles.colors.bg.primary : '#ffffff',
                  }}
                >
                  View Rewards
                </button>
                <Link href={`/designs/${config.id}/leaderboard`}>
                  <button
                    className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all hover:opacity-80"
                    style={{
                      background: 'transparent',
                      border: `2px solid ${styles.colors.primary}60`,
                      color: styles.colors.primary,
                    }}
                  >
                    Season Leaderboard
                  </button>
                </Link>
              </div>
            </div>

            {/* Decorative background elements */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: styles.colors.primary }}
            />
            <div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: styles.colors.secondary }}
            />
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickLinkCard
              title="Quick Match"
              description="Jump into a fast-paced game against AI"
              href={`/designs/${config.id}/play`}
              icon="play"
              styles={styles}
            />
            <QuickLinkCard
              title="Ranked"
              description="Compete for glory and climb the ranks"
              href={`/designs/${config.id}/play`}
              icon="trophy"
              styles={styles}
            />
            <QuickLinkCard
              title="Practice"
              description="Hone your skills in training mode"
              href={`/designs/${config.id}/play`}
              icon="target"
              styles={styles}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({
  value,
  label,
  styles,
}: {
  value: string;
  label: string;
  styles: ReturnType<typeof useDesignStyles>;
}) {
  return (
    <div className="text-center">
      <div
        className="text-3xl font-bold"
        style={{
          color: styles.colors.primary,
          fontFamily: styles.fonts.heading,
        }}
      >
        {value}
      </div>
      <div className="text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

function QuickLinkCard({
  title,
  description,
  href,
  icon,
  styles,
}: {
  title: string;
  description: string;
  href: string;
  icon: 'play' | 'trophy' | 'target';
  styles: ReturnType<typeof useDesignStyles>;
}) {
  const icons = {
    play: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
    ),
    trophy: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    ),
    target: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    ),
  };

  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="rounded-2xl p-6 cursor-pointer transition-all h-full"
        style={{
          background: styles.colors.bg.card,
          border: `1px solid ${styles.colors.border.subtle}`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: `${styles.colors.primary}20`,
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke={styles.colors.primary}
            viewBox="0 0 24 24"
          >
            {icons[icon]}
          </svg>
        </div>
        <h3
          className="text-lg font-bold mb-2"
          style={{
            color: styles.colors.text.primary,
            fontFamily: styles.fonts.heading,
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm"
          style={{ color: styles.colors.text.muted }}
        >
          {description}
        </p>
      </motion.div>
    </Link>
  );
}

export default ThemedHomePage;
