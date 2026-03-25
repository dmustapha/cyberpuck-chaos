/**
 * Match Types for Cyber Esports Air Hockey
 */

import type { PlayerRank } from './player';

export type MatchResult = 'win' | 'loss';
export type MatchType = 'ranked' | 'casual';
export type GameMode = 'ai' | 'multiplayer';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MatchRecord {
  id: string;
  timestamp: string; // ISO date string
  type: MatchType;
  mode: GameMode;
  difficulty?: Difficulty; // Only for AI matches

  // Scores
  playerScore: number;
  opponentScore: number;
  result: MatchResult;

  // Rewards
  eloChange: number;
  xpGained: number;

  // Performance metrics
  duration: number; // in seconds
  maxCombo: number;
  comebackWin: boolean; // won after being down 3+ goals
  perfectGame: boolean; // won 7-0

  // Opponent info
  opponentName: string;
  opponentRank?: PlayerRank; // For future multiplayer
}

export interface MatchHistoryState {
  matches: MatchRecord[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

// AI opponent names based on difficulty
export const AI_OPPONENT_NAMES: Record<Difficulty, string> = {
  easy: 'Rookie Bot',
  medium: 'Standard AI',
  hard: 'Elite AI',
};

// Score to win (configurable)
export type ScoreToWin = 5 | 7 | 10;
export const DEFAULT_SCORE_TO_WIN: ScoreToWin = 7;
