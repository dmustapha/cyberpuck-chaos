/**
 * Player Store - Manages player profile, rank, stats, and level
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlayerProfile, PlayerRank, PlayerStats, PlayerLevel } from '@/types/player';
import type { Difficulty } from '@/types/game';
import { getStartingElo, getRankFromElo, calculateEloChange, applyEloChange, checkRankUp } from '@/lib/cyber/elo';
import { getStartingLevel, calculateMatchXp, applyXp, checkLevelUp } from '@/lib/cyber/xp';
import { generateId, generateUsername, validateUsername } from '@/lib/cyber/utils';
import { createWalletStorage, STORAGE_KEYS } from '@/lib/cyber/walletStorage';

interface MatchResultData {
  result: 'win' | 'loss';
  playerScore: number;
  opponentScore: number;
  difficulty: Difficulty;
  duration: number;
  maxCombo: number;
  isPerfectGame: boolean;
  isComebackWin: boolean;
}

interface MatchResultUpdate {
  eloChange: number;
  xpGained: number;
  newElo: number;
  newLevel: PlayerLevel;
  rankedUp: boolean;
  leveledUp: boolean;
  levelsGained: number;
}

interface PlayerStore {
  // State
  profile: PlayerProfile | null;
  isInitialized: boolean;

  // Actions
  initializePlayer: (username?: string) => void;
  updateUsername: (username: string) => { success: boolean; error?: string };
  updateAvatar: (avatarIndex: number) => void;
  updateTitle: (titleId: string | null) => void;
  updateRank: (rank: PlayerRank) => void;
  updateStats: (stats: Partial<PlayerStats>) => void;
  updateLevel: (level: PlayerLevel) => void;
  updateLastPlayed: () => void;
  resetProfile: () => void;

  // Match result processing
  recordMatchResult: (data: MatchResultData) => MatchResultUpdate | null;
  addXp: (amount: number) => { leveledUp: boolean; levelsGained: number };

  // Computed helpers
  getWinRate: () => number;
  getGoalDifferential: () => number;
}

const createDefaultStats = (): PlayerStats => ({
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winStreak: 0,
  maxWinStreak: 0,
  totalGoalsScored: 0,
  totalGoalsConceded: 0,
  totalPlayTime: 0,
  averageMatchDuration: 0,
  maxCombo: 0,
  perfectGames: 0,
  comebackWins: 0,
});

const createDefaultProfile = (username?: string): PlayerProfile => {
  const elo = getStartingElo();
  return {
    id: generateId(),
    username: username || generateUsername(),
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    rank: getRankFromElo(elo),
    stats: createDefaultStats(),
    level: getStartingLevel(),
    avatarIndex: Math.floor(Math.random() * 10),
    titleId: null,
    season: 1,
  };
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isInitialized: false,

      // Actions
      initializePlayer: (username?: string) => {
        const { profile } = get();
        if (!profile) {
          set({
            profile: createDefaultProfile(username),
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },

      updateUsername: (username: string) => {
        const validation = validateUsername(username);
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }

        const { profile } = get();
        if (profile) {
          set({ profile: { ...profile, username } });
        }
        return { success: true };
      },

      updateAvatar: (avatarIndex: number) => {
        const { profile } = get();
        if (profile) {
          set({ profile: { ...profile, avatarIndex } });
        }
      },

      updateTitle: (titleId: string | null) => {
        const { profile } = get();
        if (profile) {
          set({ profile: { ...profile, titleId } });
        }
      },

      updateRank: (rank: PlayerRank) => {
        const { profile } = get();
        if (profile) {
          const peakElo = Math.max(rank.elo, profile.rank.peakElo);
          set({
            profile: { ...profile, rank: { ...rank, peakElo } },
          });
        }
      },

      updateStats: (statsUpdate: Partial<PlayerStats>) => {
        const { profile } = get();
        if (profile) {
          const newStats = { ...profile.stats, ...statsUpdate };
          if (newStats.winStreak > newStats.maxWinStreak) {
            newStats.maxWinStreak = newStats.winStreak;
          }
          set({ profile: { ...profile, stats: newStats } });
        }
      },

      updateLevel: (level: PlayerLevel) => {
        const { profile } = get();
        if (profile) {
          set({ profile: { ...profile, level } });
        }
      },

      updateLastPlayed: () => {
        const { profile } = get();
        if (profile) {
          set({
            profile: { ...profile, lastPlayedAt: new Date().toISOString() },
          });
        }
      },

      resetProfile: () => {
        set({ profile: null, isInitialized: false });
      },

      // Record match result - atomically updates all stats
      recordMatchResult: (data: MatchResultData) => {
        const { profile } = get();
        if (!profile) return null;

        const {
          result,
          playerScore,
          opponentScore,
          difficulty,
          duration,
          maxCombo,
          isPerfectGame,
          isComebackWin,
        } = data;

        const isWin = result === 'win';
        const oldStats = profile.stats;
        const oldElo = profile.rank.elo;
        const oldLevel = profile.level.current;

        // Calculate ELO change
        const eloChange = calculateEloChange(result, playerScore, opponentScore, difficulty);
        const newElo = applyEloChange(oldElo, eloChange);
        const newRank = getRankFromElo(newElo, profile.rank.peakElo);
        const rankedUp = checkRankUp(oldElo, newElo);

        // Calculate XP
        const newWinStreak = isWin ? oldStats.winStreak + 1 : 0;
        const xpGained = calculateMatchXp(result, playerScore, opponentScore, newWinStreak, isComebackWin);
        const newLevel = applyXp(profile.level, xpGained);
        const leveledUp = checkLevelUp(oldLevel, newLevel.current);
        const levelsGained = newLevel.current - oldLevel;

        // Calculate new stats
        const newTotalMatches = oldStats.totalMatches + 1;
        const newTotalPlayTime = oldStats.totalPlayTime + duration;
        const newAvgDuration = Math.floor(newTotalPlayTime / newTotalMatches);

        const newStats: PlayerStats = {
          totalMatches: newTotalMatches,
          wins: isWin ? oldStats.wins + 1 : oldStats.wins,
          losses: isWin ? oldStats.losses : oldStats.losses + 1,
          winStreak: newWinStreak,
          maxWinStreak: Math.max(oldStats.maxWinStreak, newWinStreak),
          totalGoalsScored: oldStats.totalGoalsScored + playerScore,
          totalGoalsConceded: oldStats.totalGoalsConceded + opponentScore,
          totalPlayTime: newTotalPlayTime,
          averageMatchDuration: newAvgDuration,
          maxCombo: Math.max(oldStats.maxCombo, maxCombo),
          perfectGames: isPerfectGame ? oldStats.perfectGames + 1 : oldStats.perfectGames,
          comebackWins: isComebackWin ? oldStats.comebackWins + 1 : oldStats.comebackWins,
        };

        // Update profile atomically
        set({
          profile: {
            ...profile,
            rank: newRank,
            stats: newStats,
            level: newLevel,
            lastPlayedAt: new Date().toISOString(),
          },
        });

        return {
          eloChange,
          xpGained,
          newElo,
          newLevel,
          rankedUp,
          leveledUp,
          levelsGained,
        };
      },

      // Add XP (for achievements, bonuses, etc.)
      addXp: (amount: number) => {
        const { profile } = get();
        if (!profile) return { leveledUp: false, levelsGained: 0 };

        const oldLevel = profile.level.current;
        const newLevel = applyXp(profile.level, amount);
        const leveledUp = checkLevelUp(oldLevel, newLevel.current);
        const levelsGained = newLevel.current - oldLevel;

        set({ profile: { ...profile, level: newLevel } });

        return { leveledUp, levelsGained };
      },

      // Computed helpers
      getWinRate: () => {
        const { profile } = get();
        if (!profile || profile.stats.totalMatches === 0) return 0;
        return (profile.stats.wins / profile.stats.totalMatches) * 100;
      },

      getGoalDifferential: () => {
        const { profile } = get();
        if (!profile) return 0;
        return profile.stats.totalGoalsScored - profile.stats.totalGoalsConceded;
      },
    }),
    {
      name: STORAGE_KEYS.player,
      storage: createJSONStorage(() => createWalletStorage(STORAGE_KEYS.player)),
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
