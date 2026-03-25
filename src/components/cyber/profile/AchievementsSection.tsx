'use client';

/**
 * AchievementsSection - Achievement categories and grid display
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useAchievementStore } from '@/stores/achievementStore';
import { HUDPanel } from '../ui/HUDPanel';
import { Tabs } from '../ui/Tabs';
import { ProgressBar } from '../ui/ProgressBar';
import {
  ACHIEVEMENTS,
  CATEGORY_NAMES,
  RARITY_NAMES,
  getAchievementsByCategory,
  TOTAL_ACHIEVEMENTS,
} from '@/lib/cyber/achievements';
import type { AchievementCategory, AchievementRarity } from '@/types/achievement';

interface AchievementsSectionProps {
  className?: string;
}

const rarityColors: Record<AchievementRarity, string> = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#1D4ED8',
  legendary: '#fbbf24',
};

export function AchievementsSection({ className = '' }: AchievementsSectionProps) {
  const [activeCategory, setActiveCategory] =
    useState<AchievementCategory>('progression');

  const progress = useAchievementStore((state) => state.progress);
  const getUnlockedCount = useAchievementStore((state) => state.getUnlockedCount);
  const getProgressPercentage = useAchievementStore(
    (state) => state.getProgressPercentage
  );
  const getCategoryProgress = useAchievementStore(
    (state) => state.getCategoryProgress
  );

  const unlockedCount = getUnlockedCount();
  const categoryAchievements = getAchievementsByCategory(activeCategory);
  const categoryProgress = getCategoryProgress(activeCategory);

  const tabs = (Object.keys(CATEGORY_NAMES) as AchievementCategory[]).map(
    (cat) => ({
      id: cat,
      label: CATEGORY_NAMES[cat],
    })
  );

  return (
    <HUDPanel className={className} padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.text.primary,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          Achievements
        </h3>
        <span
          className="text-sm"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          {unlockedCount} / {TOTAL_ACHIEVEMENTS}
        </span>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <ProgressBar
          value={(unlockedCount / TOTAL_ACHIEVEMENTS) * 100}
          height="sm"
        />
      </div>

      {/* Category tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeCategory}
        onChange={(id) => setActiveCategory(id as AchievementCategory)}
        size="sm"
        variant="pills"
        className="mb-4"
      />

      {/* Category progress */}
      <div
        className="text-sm mb-4"
        style={{ color: cyberTheme.colors.text.muted }}
      >
        {categoryProgress.unlocked} / {categoryProgress.total} unlocked
      </div>

      {/* Achievement grid */}
      <div className="space-y-3">
        {categoryAchievements.map((achievement) => {
          const prog = progress[achievement.id];
          const isUnlocked = prog?.unlockedAt !== null;
          const progressPercent = getProgressPercentage(achievement.id);
          const rarityColor = rarityColors[achievement.rarity];

          return (
            <div
              key={achievement.id}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: isUnlocked
                  ? `${rarityColor}10`
                  : cyberTheme.colors.bg.tertiary,
                border: `1px solid ${isUnlocked ? rarityColor : 'transparent'}`,
                opacity: isUnlocked ? 1 : 0.7,
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    backgroundColor: isUnlocked
                      ? `${rarityColor}20`
                      : cyberTheme.colors.bg.secondary,
                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                  }}
                >
                  {achievement.hidden && !isUnlocked ? '❓' : achievement.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-bold truncate"
                      style={{
                        color: isUnlocked
                          ? cyberTheme.colors.text.primary
                          : cyberTheme.colors.text.secondary,
                        fontFamily: cyberTheme.fonts.heading,
                      }}
                    >
                      {achievement.hidden && !isUnlocked
                        ? 'Hidden Achievement'
                        : achievement.name}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded uppercase"
                      style={{
                        backgroundColor: `${rarityColor}20`,
                        color: rarityColor,
                      }}
                    >
                      {RARITY_NAMES[achievement.rarity]}
                    </span>
                  </div>

                  <p
                    className="text-sm mb-2"
                    style={{ color: cyberTheme.colors.text.muted }}
                  >
                    {achievement.hidden && !isUnlocked
                      ? 'Complete hidden requirements to unlock'
                      : achievement.description}
                  </p>

                  {/* Progress bar for trackable achievements */}
                  {achievement.trackable && !isUnlocked && (
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={progressPercent}
                        height="xs"
                        color={rarityColor}
                        className="flex-1"
                      />
                      <span
                        className="text-xs"
                        style={{ color: cyberTheme.colors.text.muted }}
                      >
                        {prog?.currentValue || 0}/{achievement.condition.value}
                      </span>
                    </div>
                  )}

                  {/* Unlock date */}
                  {isUnlocked && prog?.unlockedAt && (
                    <span
                      className="text-xs"
                      style={{ color: cyberTheme.colors.success }}
                    >
                      ✓ Unlocked
                    </span>
                  )}

                  {/* Reward info */}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs"
                      style={{ color: cyberTheme.colors.primary }}
                    >
                      +{achievement.xpReward} XP
                    </span>
                    {achievement.titleUnlock && (
                      <span
                        className="text-xs"
                        style={{ color: cyberTheme.colors.warning }}
                      >
                        Title: {achievement.titleUnlock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </HUDPanel>
  );
}

export default AchievementsSection;
