/**
 * Player Types for Cyber Esports Air Hockey
 */

// Rank tiers from lowest to highest
export type RankTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'MASTER';

// Division within each tier (III = lowest, I = highest)
export type Division = 'III' | 'II' | 'I';

// ELO thresholds for each tier
export const RANK_THRESHOLDS: Record<RankTier, { min: number; max: number }> = {
  BRONZE: { min: 0, max: 799 },
  SILVER: { min: 800, max: 1199 },
  GOLD: { min: 1200, max: 1599 },
  PLATINUM: { min: 1600, max: 1999 },
  DIAMOND: { min: 2000, max: 2399 },
  MASTER: { min: 2400, max: Infinity },
};

// Starting ELO for new players
export const STARTING_ELO = 1200;

export interface PlayerRank {
  tier: RankTier;
  division: Division;
  elo: number;
  peakElo: number;
}

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winStreak: number;
  maxWinStreak: number;
  totalGoalsScored: number;
  totalGoalsConceded: number;
  totalPlayTime: number; // in seconds
  averageMatchDuration: number;
  maxCombo: number;
  perfectGames: number; // 7-0 victories
  comebackWins: number; // won after being down 3+ goals
}

export interface PlayerLevel {
  current: number; // 1-100
  xp: number; // current level XP progress
  xpToNextLevel: number;
  totalXp: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  createdAt: string; // ISO date string
  lastPlayedAt: string; // ISO date string
  rank: PlayerRank;
  stats: PlayerStats;
  level: PlayerLevel;
  avatarIndex: number; // 0-9 predefined avatars
  titleId: string | null; // equipped title from achievements
  season: number; // current ranked season
}

// Default stats for new player
export const DEFAULT_PLAYER_STATS: PlayerStats = {
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
};

// Default rank for new player (Gold III at 1200 ELO)
export const DEFAULT_PLAYER_RANK: PlayerRank = {
  tier: 'GOLD',
  division: 'III',
  elo: STARTING_ELO,
  peakElo: STARTING_ELO,
};

// Default level for new player
export const DEFAULT_PLAYER_LEVEL: PlayerLevel = {
  current: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalXp: 0,
};
