'use client';

/**
 * ThemedAchievementsPage - Achievements page with design system theming
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesignStyles } from '../useDesignStyles';
import { useDesign } from '../DesignContext';
import { usePlayerStore } from '@/stores/playerStore';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'gameplay' | 'rank' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const mockAchievements: Achievement[] = [
  { id: '1', name: 'First Blood', description: 'Win your first match', category: 'gameplay', rarity: 'common', xpReward: 50, progress: 1, maxProgress: 1, unlocked: true, unlockedAt: '2024-01-15' },
  { id: '2', name: 'Win Streak', description: 'Win 5 matches in a row', category: 'gameplay', rarity: 'rare', xpReward: 150, progress: 3, maxProgress: 5, unlocked: false },
  { id: '3', name: 'Perfect Game', description: 'Win 7-0 against any opponent', category: 'gameplay', rarity: 'epic', xpReward: 300, progress: 0, maxProgress: 1, unlocked: false },
  { id: '4', name: 'Bronze Badge', description: 'Reach Bronze rank', category: 'rank', rarity: 'common', xpReward: 100, progress: 1, maxProgress: 1, unlocked: true, unlockedAt: '2024-01-10' },
  { id: '5', name: 'Silver Shield', description: 'Reach Silver rank', category: 'rank', rarity: 'common', xpReward: 150, progress: 1, maxProgress: 1, unlocked: true, unlockedAt: '2024-01-12' },
  { id: '6', name: 'Golden Glory', description: 'Reach Gold rank', category: 'rank', rarity: 'rare', xpReward: 250, progress: 1, maxProgress: 1, unlocked: true, unlockedAt: '2024-01-14' },
  { id: '7', name: 'Platinum Prestige', description: 'Reach Platinum rank', category: 'rank', rarity: 'epic', xpReward: 400, progress: 0, maxProgress: 1, unlocked: false },
  { id: '8', name: 'Diamond Dream', description: 'Reach Diamond rank', category: 'rank', rarity: 'epic', xpReward: 600, progress: 0, maxProgress: 1, unlocked: false },
  { id: '9', name: 'Master Mind', description: 'Reach Master rank', category: 'rank', rarity: 'legendary', xpReward: 1000, progress: 0, maxProgress: 1, unlocked: false },
  { id: '10', name: 'Comeback King', description: 'Win after being down by 3+ goals', category: 'gameplay', rarity: 'rare', xpReward: 200, progress: 0, maxProgress: 1, unlocked: false },
  { id: '11', name: 'Marathon Runner', description: 'Play for 10 hours total', category: 'special', rarity: 'rare', xpReward: 250, progress: 4, maxProgress: 10, unlocked: false },
  { id: '12', name: 'Century', description: 'Score 100 total goals', category: 'gameplay', rarity: 'rare', xpReward: 200, progress: 67, maxProgress: 100, unlocked: false },
];

const categoryFilters = [
  { value: 'all', label: 'All' },
  { value: 'gameplay', label: 'Gameplay' },
  { value: 'rank', label: 'Rank' },
  { value: 'social', label: 'Social' },
  { value: 'special', label: 'Special' },
];

export function ThemedAchievementsPage() {
  const styles = useDesignStyles();
  const { config } = useDesign();
  const profile = usePlayerStore((state) => state.profile);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const filteredAchievements = mockAchievements.filter((achievement) => {
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false;
    if (showUnlockedOnly && !achievement.unlocked) return false;
    return true;
  });

  const unlockedCount = mockAchievements.filter((a) => a.unlocked).length;
  const totalXpEarned = mockAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return styles.colors.text.secondary;
      case 'rare': return styles.colors.info || '#3b82f6';
      case 'epic': return styles.colors.secondary || '#1D4ED8';
      case 'legendary': return styles.colors.warning;
      default: return styles.colors.text.primary;
    }
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
            Achievements
          </h1>
          <p style={{ color: styles.colors.text.secondary }}>
            Track your progress and unlock rewards
          </p>
        </motion.div>

        {/* Stats overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div
            className="p-6 rounded-2xl text-center"
            style={{
              background: styles.colors.bg.card,
              border: `1px solid ${styles.colors.border.subtle}`,
            }}
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{
                color: styles.colors.primary,
                fontFamily: styles.fonts.score,
              }}
            >
              {unlockedCount}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: styles.colors.text.muted }}
            >
              Unlocked
            </div>
          </div>
          <div
            className="p-6 rounded-2xl text-center"
            style={{
              background: styles.colors.bg.card,
              border: `1px solid ${styles.colors.border.subtle}`,
            }}
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{
                color: styles.colors.secondary || styles.colors.primary,
                fontFamily: styles.fonts.score,
              }}
            >
              {mockAchievements.length}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: styles.colors.text.muted }}
            >
              Total
            </div>
          </div>
          <div
            className="p-6 rounded-2xl text-center"
            style={{
              background: styles.colors.bg.card,
              border: `1px solid ${styles.colors.border.subtle}`,
            }}
          >
            <div
              className="text-3xl font-bold mb-1"
              style={{
                color: styles.colors.success,
                fontFamily: styles.fonts.score,
              }}
            >
              {totalXpEarned.toLocaleString()}
            </div>
            <div
              className="text-sm uppercase tracking-wider"
              style={{ color: styles.colors.text.muted }}
            >
              XP Earned
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4"
          style={{
            background: styles.colors.bg.card,
            border: `1px solid ${styles.colors.border.subtle}`,
          }}
        >
          <div className="flex items-center gap-2">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setCategoryFilter(filter.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background:
                    categoryFilter === filter.value
                      ? styles.colors.primary
                      : 'transparent',
                  color:
                    categoryFilter === filter.value
                      ? config.id === 'arctic-frost'
                        ? styles.colors.bg.primary
                        : '#ffffff'
                      : styles.colors.text.secondary,
                  border: `1px solid ${
                    categoryFilter === filter.value
                      ? styles.colors.primary
                      : styles.colors.border.subtle
                  }`,
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: styles.colors.primary }}
            />
            <span
              className="text-sm"
              style={{ color: styles.colors.text.secondary }}
            >
              Show unlocked only
            </span>
          </label>
        </motion.div>

        {/* Achievements grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-5 rounded-2xl relative overflow-hidden"
              style={{
                background: achievement.unlocked
                  ? `linear-gradient(135deg, ${styles.colors.bg.card}, ${getRarityColor(achievement.rarity)}10)`
                  : styles.colors.bg.card,
                border: `1px solid ${
                  achievement.unlocked
                    ? getRarityColor(achievement.rarity)
                    : styles.colors.border.subtle
                }`,
                opacity: achievement.unlocked ? 1 : 0.7,
              }}
            >
              <div className="flex items-start gap-4">
                {/* Icon placeholder */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: achievement.unlocked
                      ? `${getRarityColor(achievement.rarity)}20`
                      : `${styles.colors.text.muted}10`,
                    border: `2px solid ${
                      achievement.unlocked
                        ? getRarityColor(achievement.rarity)
                        : styles.colors.border.subtle
                    }`,
                  }}
                >
                  <span
                    className="text-2xl"
                    style={{
                      filter: achievement.unlocked ? 'none' : 'grayscale(1)',
                    }}
                  >
                    {achievement.unlocked ? (
                      achievement.rarity === 'legendary' ? '🏆' :
                      achievement.rarity === 'epic' ? '💎' :
                      achievement.rarity === 'rare' ? '🌟' : '✅'
                    ) : '🔒'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold truncate"
                      style={{
                        color: achievement.unlocked
                          ? styles.colors.text.primary
                          : styles.colors.text.muted,
                        fontFamily: styles.fonts.heading,
                      }}
                    >
                      {achievement.name}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold uppercase shrink-0"
                      style={{
                        background: `${getRarityColor(achievement.rarity)}20`,
                        color: getRarityColor(achievement.rarity),
                      }}
                    >
                      {achievement.rarity}
                    </span>
                  </div>

                  <p
                    className="text-sm mb-2"
                    style={{ color: styles.colors.text.muted }}
                  >
                    {achievement.description}
                  </p>

                  {/* Progress bar */}
                  {!achievement.unlocked && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs"
                          style={{ color: styles.colors.text.muted }}
                        >
                          Progress
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: styles.colors.primary }}
                        >
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: `${styles.colors.primary}20` }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                            background: styles.colors.primary,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* XP reward */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="text-xs font-medium"
                      style={{ color: styles.colors.success }}
                    >
                      +{achievement.xpReward} XP
                    </span>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span
                        className="text-xs"
                        style={{ color: styles.colors.text.muted }}
                      >
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemedAchievementsPage;
