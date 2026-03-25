/**
 * Match History Store - Manages match records with pagination
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MatchRecord, MatchType, MatchResult } from '@/types/match';
import { generateId } from '@/lib/cyber/utils';
import { createWalletStorage, STORAGE_KEYS } from '@/lib/cyber/walletStorage';

const MAX_MATCHES = 100; // Keep last 100 matches to save storage
const PAGE_SIZE = 10;

interface MatchHistoryStore {
  // State
  matches: MatchRecord[];

  // Actions
  addMatch: (match: Omit<MatchRecord, 'id' | 'timestamp'>) => MatchRecord;
  getMatch: (id: string) => MatchRecord | undefined;
  getRecentMatches: (limit?: number) => MatchRecord[];
  getMatchesByType: (type: MatchType) => MatchRecord[];
  getMatchesByResult: (result: MatchResult) => MatchRecord[];
  getMatchesPage: (page: number, pageSize?: number) => MatchRecord[];
  getTotalPages: (pageSize?: number) => number;
  clearHistory: () => void;

  // Stats helpers
  getRecentWinRate: (lastN?: number) => number;
  getStreakInfo: () => { type: 'win' | 'loss' | 'none'; count: number };
  getAverageMatchDuration: () => number;
  getTotalPlayTime: () => number;
}

export const useMatchHistoryStore = create<MatchHistoryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      matches: [],

      // Actions
      addMatch: (matchData) => {
        const match: MatchRecord = {
          ...matchData,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => {
          const newMatches = [match, ...state.matches];
          // Keep only last MAX_MATCHES to prevent storage overflow
          if (newMatches.length > MAX_MATCHES) {
            newMatches.pop();
          }
          return { matches: newMatches };
        });

        return match;
      },

      getMatch: (id: string) => {
        return get().matches.find((m) => m.id === id);
      },

      getRecentMatches: (limit = 5) => {
        return get().matches.slice(0, limit);
      },

      getMatchesByType: (type: MatchType) => {
        return get().matches.filter((m) => m.type === type);
      },

      getMatchesByResult: (result: MatchResult) => {
        return get().matches.filter((m) => m.result === result);
      },

      getMatchesPage: (page: number, pageSize = PAGE_SIZE) => {
        const { matches } = get();
        const start = page * pageSize;
        return matches.slice(start, start + pageSize);
      },

      getTotalPages: (pageSize = PAGE_SIZE) => {
        return Math.ceil(get().matches.length / pageSize);
      },

      clearHistory: () => {
        set({ matches: [] });
      },

      // Stats helpers
      getRecentWinRate: (lastN = 10) => {
        const { matches } = get();
        const recent = matches.slice(0, Math.min(lastN, matches.length));
        if (recent.length === 0) return 0;
        const wins = recent.filter((m) => m.result === 'win').length;
        return (wins / recent.length) * 100;
      },

      getStreakInfo: () => {
        const { matches } = get();
        if (matches.length === 0) return { type: 'none' as const, count: 0 };

        const firstResult = matches[0].result;
        let count = 0;

        for (const match of matches) {
          if (match.result === firstResult) {
            count++;
          } else {
            break;
          }
        }

        return { type: firstResult, count };
      },

      getAverageMatchDuration: () => {
        const { matches } = get();
        if (matches.length === 0) return 0;
        const total = matches.reduce((sum, m) => sum + m.duration, 0);
        return Math.floor(total / matches.length);
      },

      getTotalPlayTime: () => {
        const { matches } = get();
        return matches.reduce((sum, m) => sum + m.duration, 0);
      },
    }),
    {
      name: STORAGE_KEYS.matches,
      storage: createJSONStorage(() => createWalletStorage(STORAGE_KEYS.matches)),
      partialize: (state) => ({ matches: state.matches }),
    }
  )
);
