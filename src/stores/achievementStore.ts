/**
 * Achievement Store - Manages achievement progress and unlocks
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AchievementProgress } from '@/types/achievement';
import type { PlayerStats } from '@/types/player';
import { ACHIEVEMENTS, getAchievementById, TOTAL_ACHIEVEMENTS } from '@/lib/cyber/achievements';
import { createWalletStorage, STORAGE_KEYS } from '@/lib/cyber/walletStorage';

interface MatchEventData {
  result: 'win' | 'loss';
  playerScore: number;
  opponentScore: number;
  duration: number;
  maxCombo: number;
  isPerfectGame: boolean;
  isComebackWin: boolean;
}

interface AchievementStore {
  // State
  progress: Record<string, AchievementProgress>;
  recentUnlocks: string[]; // Achievement IDs for toast notifications

  // Actions
  initializeProgress: () => void;
  updateProgress: (achievementId: string, currentValue: number) => boolean;
  unlockAchievement: (achievementId: string) => boolean;
  markNotified: (achievementId: string) => void;
  clearRecentUnlocks: () => void;
  getNextUnlock: () => string | null;
  resetAchievements: () => void;

  // Bulk checking - call after match or stat changes
  checkStatAchievements: (stats: PlayerStats, level: number, elo: number) => string[];
  checkMatchEventAchievements: (event: MatchEventData) => string[];
  checkAchievementCountAchievements: () => string[];

  // Query helpers
  getProgress: (achievementId: string) => AchievementProgress | undefined;
  isUnlocked: (achievementId: string) => boolean;
  getUnlockedCount: () => number;
  getUnlockedAchievements: () => string[];
  getProgressPercentage: (achievementId: string) => number;
  getCategoryProgress: (category: string) => { unlocked: number; total: number };
}

const createInitialProgress = (): Record<string, AchievementProgress> => {
  const progress: Record<string, AchievementProgress> = {};
  for (const achievement of ACHIEVEMENTS) {
    progress[achievement.id] = {
      achievementId: achievement.id,
      currentValue: 0,
      unlockedAt: null,
      notified: false,
    };
  }
  return progress;
};

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      // Initial state
      progress: {},
      recentUnlocks: [],

      // Actions
      initializeProgress: () => {
        const { progress } = get();
        if (Object.keys(progress).length === 0) {
          set({ progress: createInitialProgress() });
        } else {
          // Add any new achievements that don't exist yet
          const updated = { ...progress };
          let hasChanges = false;
          for (const achievement of ACHIEVEMENTS) {
            if (!updated[achievement.id]) {
              updated[achievement.id] = {
                achievementId: achievement.id,
                currentValue: 0,
                unlockedAt: null,
                notified: false,
              };
              hasChanges = true;
            }
          }
          if (hasChanges) {
            set({ progress: updated });
          }
        }
      },

      updateProgress: (achievementId: string, currentValue: number) => {
        const { progress, recentUnlocks } = get();
        const achievement = getAchievementById(achievementId);
        const existing = progress[achievementId];

        if (!achievement || !existing || existing.unlockedAt != null) {
          return false; // Already unlocked or doesn't exist
        }

        const newValue = Math.max(existing.currentValue, currentValue);
        const shouldUnlock = newValue >= achievement.condition.value;

        if (shouldUnlock) {
          set({
            progress: {
              ...progress,
              [achievementId]: {
                ...existing,
                currentValue: newValue,
                unlockedAt: new Date().toISOString(),
                notified: false,
              },
            },
            recentUnlocks: [...recentUnlocks, achievementId],
          });
          return true;
        }

        // Just update progress
        set({
          progress: {
            ...progress,
            [achievementId]: { ...existing, currentValue: newValue },
          },
        });
        return false;
      },

      unlockAchievement: (achievementId: string) => {
        const { progress, recentUnlocks } = get();
        const existing = progress[achievementId];

        if (!existing || existing.unlockedAt != null) {
          return false; // Already unlocked or doesn't exist
        }

        const achievement = getAchievementById(achievementId);
        if (!achievement) return false;

        set({
          progress: {
            ...progress,
            [achievementId]: {
              ...existing,
              currentValue: achievement.condition.value,
              unlockedAt: new Date().toISOString(),
              notified: false,
            },
          },
          recentUnlocks: [...recentUnlocks, achievementId],
        });
        return true;
      },

      markNotified: (achievementId: string) => {
        const { progress } = get();
        const existing = progress[achievementId];
        if (existing) {
          set({
            progress: {
              ...progress,
              [achievementId]: { ...existing, notified: true },
            },
          });
        }
      },

      clearRecentUnlocks: () => {
        set({ recentUnlocks: [] });
      },

      getNextUnlock: () => {
        const { recentUnlocks } = get();
        if (recentUnlocks.length === 0) return null;
        const [next, ...rest] = recentUnlocks;
        set({ recentUnlocks: rest });
        return next;
      },

      resetAchievements: () => {
        set({ progress: createInitialProgress(), recentUnlocks: [] });
      },

      // Check all stat-based achievements
      checkStatAchievements: (stats: PlayerStats, level: number, elo: number) => {
        const { updateProgress, isUnlocked } = get();
        const unlocked: string[] = [];

        // Map stat names to values
        const statValues: Record<string, number> = {
          totalMatches: stats.totalMatches,
          wins: stats.wins,
          losses: stats.losses,
          winStreak: stats.winStreak,
          maxWinStreak: stats.maxWinStreak,
          totalGoalsScored: stats.totalGoalsScored,
          totalGoalsConceded: stats.totalGoalsConceded,
          totalPlayTime: stats.totalPlayTime,
          maxCombo: stats.maxCombo,
          perfectGames: stats.perfectGames,
          comebackWins: stats.comebackWins,
          level: level,
          tier: elo, // For tier milestones, we use ELO value
        };

        // Check stat-based and milestone achievements
        for (const achievement of ACHIEVEMENTS) {
          if (isUnlocked(achievement.id)) continue;
          if (achievement.condition.type !== 'stat' && achievement.condition.type !== 'milestone') continue;

          const targetValue = statValues[achievement.condition.target];
          if (targetValue !== undefined && targetValue >= achievement.condition.value) {
            if (updateProgress(achievement.id, targetValue)) {
              unlocked.push(achievement.id);
            }
          }
        }

        return unlocked;
      },

      // Check event-based achievements (called after match)
      checkMatchEventAchievements: (event: MatchEventData) => {
        const { unlockAchievement, isUnlocked } = get();
        const unlocked: string[] = [];

        // Hat trick - scored 3+ goals
        if (event.playerScore >= 3 && !isUnlocked('hat_trick')) {
          if (unlockAchievement('hat_trick')) unlocked.push('hat_trick');
        }

        // Domination - perfect game (7-0)
        if (event.isPerfectGame && !isUnlocked('domination')) {
          if (unlockAchievement('domination')) unlocked.push('domination');
        }

        // Comeback King - won after being down 3+
        if (event.isComebackWin && !isUnlocked('comeback_king')) {
          if (unlockAchievement('comeback_king')) unlocked.push('comeback_king');
        }

        // Speed Demon - won in under 60 seconds
        if (event.result === 'win' && event.duration < 60 && !isUnlocked('speed_demon')) {
          if (unlockAchievement('speed_demon')) unlocked.push('speed_demon');
        }

        return unlocked;
      },

      // Check meta achievements (achievement count)
      checkAchievementCountAchievements: () => {
        const { updateProgress, getUnlockedCount, isUnlocked } = get();
        const count = getUnlockedCount();
        const unlocked: string[] = [];

        // Perfectionist - 10 achievements
        if (count >= 10 && !isUnlocked('perfectionist')) {
          if (updateProgress('perfectionist', count)) unlocked.push('perfectionist');
        }

        // Completionist - 20 achievements
        if (count >= 20 && !isUnlocked('completionist')) {
          if (updateProgress('completionist', count)) unlocked.push('completionist');
        }

        // Master of All - all achievements (minus the meta ones)
        if (count >= TOTAL_ACHIEVEMENTS - 1 && !isUnlocked('master_of_all')) {
          if (updateProgress('master_of_all', count)) unlocked.push('master_of_all');
        }

        return unlocked;
      },

      // Query helpers
      getProgress: (achievementId: string) => {
        return get().progress[achievementId];
      },

      isUnlocked: (achievementId: string) => {
        const prog = get().progress[achievementId];
        return prog?.unlockedAt != null; // Fixed: handles both null and undefined
      },

      getUnlockedCount: () => {
        const { progress } = get();
        return Object.values(progress).filter((p) => p.unlockedAt != null).length;
      },

      getUnlockedAchievements: () => {
        const { progress } = get();
        return Object.values(progress)
          .filter((p) => p.unlockedAt != null)
          .map((p) => p.achievementId);
      },

      getProgressPercentage: (achievementId: string) => {
        const { progress } = get();
        const prog = progress[achievementId];
        const achievement = getAchievementById(achievementId);

        if (!prog || !achievement) return 0;
        if (prog.unlockedAt != null) return 100;

        return Math.min(100, (prog.currentValue / achievement.condition.value) * 100);
      },

      getCategoryProgress: (category: string) => {
        const { progress } = get();
        const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category);
        const unlocked = categoryAchievements.filter(
          (a) => progress[a.id]?.unlockedAt != null
        ).length;
        return { unlocked, total: categoryAchievements.length };
      },
    }),
    {
      name: STORAGE_KEYS.achievements,
      storage: createJSONStorage(() => createWalletStorage(STORAGE_KEYS.achievements)),
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);
