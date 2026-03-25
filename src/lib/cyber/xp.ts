/**
 * XP and Leveling System for Cyber Esports Air Hockey
 */

import type { PlayerLevel } from '@/types/player';

// XP rewards for various actions
export const XP_REWARDS = {
  matchWin: 100,
  matchLoss: 40,
  goalScored: 10,
  perfectGame: 50, // bonus for 7-0
  comebackWin: 30, // bonus for winning after being down 3+
  winStreakBonus: 10, // per consecutive win (3+)
} as const;

// Level curve constants
const BASE_XP = 100;
const XP_GROWTH_RATE = 1.08;
const MAX_LEVEL = 100;

/**
 * Calculate XP required to reach a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(XP_GROWTH_RATE, level - 1));
}

/**
 * Calculate total XP required to reach a level from level 1
 */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpForLevel(i);
  }
  return total;
}

/**
 * Get level from total XP
 */
export function getLevelFromTotalXp(totalXp: number): number {
  let level = 1;
  let xpAccumulated = 0;

  while (level < MAX_LEVEL) {
    const xpNeeded = xpForLevel(level);
    if (xpAccumulated + xpNeeded > totalXp) {
      break;
    }
    xpAccumulated += xpNeeded;
    level++;
  }

  return level;
}

/**
 * Calculate XP gain from a match
 */
export function calculateMatchXp(
  result: 'win' | 'loss',
  playerScore: number,
  opponentScore: number,
  winStreak: number,
  comebackWin: boolean
): number {
  let xp = 0;

  // Base XP for result
  xp += result === 'win' ? XP_REWARDS.matchWin : XP_REWARDS.matchLoss;

  // XP for goals scored
  xp += playerScore * XP_REWARDS.goalScored;

  // Bonus for perfect game
  if (result === 'win' && opponentScore === 0) {
    xp += XP_REWARDS.perfectGame;
  }

  // Bonus for comeback win
  if (comebackWin) {
    xp += XP_REWARDS.comebackWin;
  }

  // Win streak bonus (3+ consecutive wins)
  if (result === 'win' && winStreak >= 3) {
    xp += XP_REWARDS.winStreakBonus * Math.min(winStreak, 10); // cap at 10
  }

  return xp;
}

/**
 * Apply XP to player level and return updated level info
 */
export function applyXp(currentLevel: PlayerLevel, xpGained: number): PlayerLevel {
  const newTotalXp = currentLevel.totalXp + xpGained;
  const newLevel = getLevelFromTotalXp(newTotalXp);

  // Calculate XP within current level
  const xpForCurrentLevel = totalXpForLevel(newLevel);
  const xpForNextLevel = xpForLevel(newLevel);
  const xpInCurrentLevel = newTotalXp - xpForCurrentLevel;

  return {
    current: newLevel,
    xp: xpInCurrentLevel,
    xpToNextLevel: xpForNextLevel,
    totalXp: newTotalXp,
  };
}

/**
 * Get progress percentage to next level (0-100)
 */
export function getLevelProgress(level: PlayerLevel): number {
  if (level.xpToNextLevel === 0) return 100;
  return Math.floor((level.xp / level.xpToNextLevel) * 100);
}

/**
 * Check if player leveled up
 */
export function checkLevelUp(oldLevel: number, newLevel: number): boolean {
  return newLevel > oldLevel;
}

/**
 * Get levels gained from XP
 */
export function getLevelsGained(oldLevel: number, newLevel: number): number {
  return Math.max(0, newLevel - oldLevel);
}

/**
 * Get starting player level
 */
export function getStartingLevel(): PlayerLevel {
  return {
    current: 1,
    xp: 0,
    xpToNextLevel: xpForLevel(1),
    totalXp: 0,
  };
}

/**
 * Format level for display
 */
export function formatLevel(level: number): string {
  return `Lv. ${level}`;
}
