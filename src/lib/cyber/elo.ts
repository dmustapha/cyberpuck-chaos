/**
 * ELO Calculation System for Cyber Esports Air Hockey
 */

import type { RankTier, Division, PlayerRank } from '@/types/player';
import type { Difficulty } from '@/types/match';
import { RANK_THRESHOLDS, STARTING_ELO } from '@/types/player';

// Base ELO changes
const BASE_WIN_ELO = 25;
const BASE_LOSS_ELO = -15;

// Difficulty multipliers for AI matches
const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 0.6,
  medium: 1.0,
  hard: 1.4,
};

// Score differential bonus per goal
const SCORE_DIFF_BONUS = 2;

// Minimum ELO (can't go below 0)
const MIN_ELO = 0;

/**
 * Calculate ELO change after a match
 */
export function calculateEloChange(
  result: 'win' | 'loss',
  playerScore: number,
  opponentScore: number,
  difficulty: Difficulty
): number {
  const base = result === 'win' ? BASE_WIN_ELO : BASE_LOSS_ELO;
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const scoreDiff = Math.abs(playerScore - opponentScore);

  // Bonus/penalty based on score differential
  const diffBonus = scoreDiff * SCORE_DIFF_BONUS * (result === 'win' ? 1 : -0.5);

  return Math.round(base * multiplier + diffBonus);
}

/**
 * Apply ELO change and return new ELO (clamped to minimum)
 */
export function applyEloChange(currentElo: number, change: number): number {
  return Math.max(MIN_ELO, currentElo + change);
}

/**
 * Get the rank tier for a given ELO
 */
export function getTierForElo(elo: number): RankTier {
  if (elo >= RANK_THRESHOLDS.MASTER.min) return 'MASTER';
  if (elo >= RANK_THRESHOLDS.DIAMOND.min) return 'DIAMOND';
  if (elo >= RANK_THRESHOLDS.PLATINUM.min) return 'PLATINUM';
  if (elo >= RANK_THRESHOLDS.GOLD.min) return 'GOLD';
  if (elo >= RANK_THRESHOLDS.SILVER.min) return 'SILVER';
  return 'BRONZE';
}

/**
 * Get the division within a tier for a given ELO
 */
export function getDivisionForElo(elo: number): Division {
  const tier = getTierForElo(elo);

  // Master tier only has division I
  if (tier === 'MASTER') return 'I';

  const { min, max } = RANK_THRESHOLDS[tier];
  const tierRange = max - min + 1;
  const divisionSize = tierRange / 3;
  const positionInTier = elo - min;

  if (positionInTier >= divisionSize * 2) return 'I';
  if (positionInTier >= divisionSize) return 'II';
  return 'III';
}

/**
 * Get full rank from ELO
 */
export function getRankFromElo(elo: number, peakElo?: number): PlayerRank {
  return {
    tier: getTierForElo(elo),
    division: getDivisionForElo(elo),
    elo,
    peakElo: peakElo ?? elo,
  };
}

/**
 * Get ELO progress to next division (0-100%)
 */
export function getProgressToNextDivision(elo: number): number {
  const tier = getTierForElo(elo);

  // Master tier has no next division
  if (tier === 'MASTER') return 100;

  const { min, max } = RANK_THRESHOLDS[tier];
  const tierRange = max - min + 1;
  const divisionSize = tierRange / 3;
  const positionInTier = elo - min;
  const positionInDivision = positionInTier % divisionSize;

  return Math.min(100, Math.floor((positionInDivision / divisionSize) * 100));
}

/**
 * Get ELO needed to reach next division
 */
export function getEloToNextDivision(elo: number): number {
  const tier = getTierForElo(elo);
  const division = getDivisionForElo(elo);

  // Already at max (Master I)
  if (tier === 'MASTER') return 0;

  const { min, max } = RANK_THRESHOLDS[tier];
  const tierRange = max - min + 1;
  const divisionSize = Math.floor(tierRange / 3);

  if (division === 'III') {
    return min + divisionSize - elo;
  } else if (division === 'II') {
    return min + divisionSize * 2 - elo;
  } else {
    // Division I, need to reach next tier
    return max + 1 - elo;
  }
}

/**
 * Format rank as string (e.g., "GOLD II")
 */
export function formatRank(rank: PlayerRank): string {
  if (rank.tier === 'MASTER') return 'MASTER';
  return `${rank.tier} ${rank.division}`;
}

/**
 * Compare two ranks (returns positive if a > b, negative if a < b, 0 if equal)
 */
export function compareRanks(a: PlayerRank, b: PlayerRank): number {
  return a.elo - b.elo;
}

/**
 * Check if player ranked up (tier or division improved)
 */
export function checkRankUp(oldElo: number, newElo: number): boolean {
  const oldTier = getTierForElo(oldElo);
  const newTier = getTierForElo(newElo);
  const oldDivision = getDivisionForElo(oldElo);
  const newDivision = getDivisionForElo(newElo);

  // Tier improved
  if (newTier !== oldTier) {
    const tierOrder: RankTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER'];
    return tierOrder.indexOf(newTier) > tierOrder.indexOf(oldTier);
  }

  // Same tier, check division
  const divisionOrder: Division[] = ['III', 'II', 'I'];
  return divisionOrder.indexOf(newDivision) > divisionOrder.indexOf(oldDivision);
}

/**
 * Get default starting rank
 */
export function getStartingRank(): PlayerRank {
  return getRankFromElo(STARTING_ELO);
}

/**
 * Get starting ELO value
 */
export function getStartingElo(): number {
  return STARTING_ELO;
}
