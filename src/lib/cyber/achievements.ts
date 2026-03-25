/**
 * Achievement Definitions for Cyber Esports Air Hockey
 * 25 achievements across 5 categories
 */

import type { Achievement, AchievementCategory, AchievementRarity } from '@/types/achievement';
import { RARITY_XP_REWARDS } from '@/types/achievement';

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // ============================================
  // PROGRESSION (5) - Level/rank milestones
  // ============================================
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Play your first match',
    category: 'progression',
    rarity: 'common',
    icon: '🎮',
    condition: { type: 'stat', target: 'totalMatches', value: 1 },
    xpReward: RARITY_XP_REWARDS.common,
    trackable: false,
    hidden: false,
  },
  {
    id: 'rising_star',
    name: 'Rising Star',
    description: 'Reach level 10',
    category: 'progression',
    rarity: 'uncommon',
    icon: '⭐',
    condition: { type: 'stat', target: 'level', value: 10 },
    xpReward: RARITY_XP_REWARDS.uncommon,
    titleUnlock: 'Rising Star',
    trackable: true,
    hidden: false,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Reach level 25',
    category: 'progression',
    rarity: 'rare',
    icon: '🎖️',
    condition: { type: 'stat', target: 'level', value: 25 },
    xpReward: RARITY_XP_REWARDS.rare,
    titleUnlock: 'Veteran',
    trackable: true,
    hidden: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Reach level 50',
    category: 'progression',
    rarity: 'epic',
    icon: '💎',
    condition: { type: 'stat', target: 'level', value: 50 },
    xpReward: RARITY_XP_REWARDS.epic,
    titleUnlock: 'Elite Player',
    trackable: true,
    hidden: false,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reach level 100',
    category: 'progression',
    rarity: 'legendary',
    icon: '👑',
    condition: { type: 'stat', target: 'level', value: 100 },
    xpReward: RARITY_XP_REWARDS.legendary,
    titleUnlock: 'Living Legend',
    trackable: true,
    hidden: false,
  },

  // ============================================
  // PERFORMANCE (6) - In-game feats
  // ============================================
  {
    id: 'hat_trick',
    name: 'Hat Trick',
    description: 'Score 3+ goals in a single match',
    category: 'performance',
    rarity: 'common',
    icon: '🎩',
    condition: { type: 'event', target: 'goalsInMatch', value: 3 },
    xpReward: RARITY_XP_REWARDS.common,
    trackable: false,
    hidden: false,
  },
  {
    id: 'domination',
    name: 'Domination',
    description: 'Win a match 7-0',
    category: 'performance',
    rarity: 'rare',
    icon: '💪',
    condition: { type: 'event', target: 'perfectGame', value: 1 },
    xpReward: RARITY_XP_REWARDS.rare,
    titleUnlock: 'Dominator',
    trackable: false,
    hidden: false,
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win after being down 3+ goals',
    category: 'performance',
    rarity: 'epic',
    icon: '🔥',
    condition: { type: 'event', target: 'comebackWin', value: 1 },
    xpReward: RARITY_XP_REWARDS.epic,
    titleUnlock: 'Comeback King',
    trackable: false,
    hidden: false,
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 5x combo',
    category: 'performance',
    rarity: 'rare',
    icon: '⚡',
    condition: { type: 'stat', target: 'maxCombo', value: 5 },
    xpReward: RARITY_XP_REWARDS.rare,
    trackable: true,
    hidden: false,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a match in under 60 seconds',
    category: 'performance',
    rarity: 'epic',
    icon: '⏱️',
    condition: { type: 'event', target: 'quickWin', value: 60 },
    xpReward: RARITY_XP_REWARDS.epic,
    titleUnlock: 'Speed Demon',
    trackable: false,
    hidden: false,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Win 3 matches without conceding a goal',
    category: 'performance',
    rarity: 'legendary',
    icon: '🛡️',
    condition: { type: 'stat', target: 'perfectGames', value: 3 },
    xpReward: RARITY_XP_REWARDS.legendary,
    titleUnlock: 'Untouchable',
    trackable: true,
    hidden: false,
  },

  // ============================================
  // DEDICATION (5) - Play time/matches
  // ============================================
  {
    id: 'regular',
    name: 'Regular',
    description: 'Play 10 matches',
    category: 'dedication',
    rarity: 'common',
    icon: '📊',
    condition: { type: 'stat', target: 'totalMatches', value: 10 },
    xpReward: RARITY_XP_REWARDS.common,
    trackable: true,
    hidden: false,
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Play 50 matches',
    category: 'dedication',
    rarity: 'uncommon',
    icon: '📈',
    condition: { type: 'stat', target: 'totalMatches', value: 50 },
    xpReward: RARITY_XP_REWARDS.uncommon,
    trackable: true,
    hidden: false,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Play 100 matches',
    category: 'dedication',
    rarity: 'rare',
    icon: '🏆',
    condition: { type: 'stat', target: 'totalMatches', value: 100 },
    xpReward: RARITY_XP_REWARDS.rare,
    titleUnlock: 'Dedicated',
    trackable: true,
    hidden: false,
  },
  {
    id: 'obsessed',
    name: 'Obsessed',
    description: 'Play 500 matches',
    category: 'dedication',
    rarity: 'epic',
    icon: '🎯',
    condition: { type: 'stat', target: 'totalMatches', value: 500 },
    xpReward: RARITY_XP_REWARDS.epic,
    titleUnlock: 'Obsessed',
    trackable: true,
    hidden: false,
  },
  {
    id: 'timeless',
    name: 'Timeless',
    description: 'Play for 10 hours total',
    category: 'dedication',
    rarity: 'legendary',
    icon: '⏳',
    condition: { type: 'stat', target: 'totalPlayTime', value: 36000 }, // 10 hours in seconds
    xpReward: RARITY_XP_REWARDS.legendary,
    titleUnlock: 'Timeless',
    trackable: true,
    hidden: false,
  },

  // ============================================
  // MASTERY (5) - Skill-based
  // ============================================
  {
    id: 'win_streak_3',
    name: 'On Fire',
    description: 'Win 3 matches in a row',
    category: 'mastery',
    rarity: 'common',
    icon: '🔥',
    condition: { type: 'stat', target: 'winStreak', value: 3 },
    xpReward: RARITY_XP_REWARDS.common,
    trackable: true,
    hidden: false,
  },
  {
    id: 'win_streak_5',
    name: 'Unstoppable',
    description: 'Win 5 matches in a row',
    category: 'mastery',
    rarity: 'rare',
    icon: '💥',
    condition: { type: 'stat', target: 'winStreak', value: 5 },
    xpReward: RARITY_XP_REWARDS.rare,
    titleUnlock: 'Unstoppable',
    trackable: true,
    hidden: false,
  },
  {
    id: 'win_streak_10',
    name: 'Invincible',
    description: 'Win 10 matches in a row',
    category: 'mastery',
    rarity: 'legendary',
    icon: '🌟',
    condition: { type: 'stat', target: 'maxWinStreak', value: 10 },
    xpReward: RARITY_XP_REWARDS.legendary,
    titleUnlock: 'Invincible',
    trackable: true,
    hidden: false,
  },
  {
    id: 'rank_up',
    name: 'Climbing',
    description: 'Reach Silver tier',
    category: 'mastery',
    rarity: 'uncommon',
    icon: '🥈',
    condition: { type: 'milestone', target: 'tier', value: 800 }, // Silver threshold
    xpReward: RARITY_XP_REWARDS.uncommon,
    trackable: false,
    hidden: false,
  },
  {
    id: 'top_tier',
    name: 'Top Tier',
    description: 'Reach Diamond tier',
    category: 'mastery',
    rarity: 'epic',
    icon: '💠',
    condition: { type: 'milestone', target: 'tier', value: 2000 }, // Diamond threshold
    xpReward: RARITY_XP_REWARDS.epic,
    titleUnlock: 'Diamond Player',
    trackable: false,
    hidden: false,
  },

  // ============================================
  // SPECIAL (4) - Hidden/rare
  // ============================================
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Play during the beta period',
    category: 'special',
    rarity: 'rare',
    icon: '🚀',
    condition: { type: 'event', target: 'betaPlayer', value: 1 },
    xpReward: RARITY_XP_REWARDS.rare,
    titleUnlock: 'Pioneer',
    trackable: false,
    hidden: true,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Unlock 10 achievements',
    category: 'special',
    rarity: 'uncommon',
    icon: '✨',
    condition: { type: 'stat', target: 'achievementsUnlocked', value: 10 },
    xpReward: RARITY_XP_REWARDS.uncommon,
    trackable: true,
    hidden: false,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Unlock 20 achievements',
    category: 'special',
    rarity: 'epic',
    icon: '🎖️',
    condition: { type: 'stat', target: 'achievementsUnlocked', value: 20 },
    xpReward: RARITY_XP_REWARDS.epic,
    titleUnlock: 'Completionist',
    trackable: true,
    hidden: false,
  },
  {
    id: 'master_of_all',
    name: 'Master of All',
    description: 'Unlock all achievements',
    category: 'special',
    rarity: 'legendary',
    icon: '🏅',
    condition: { type: 'stat', target: 'achievementsUnlocked', value: 25 },
    xpReward: RARITY_XP_REWARDS.legendary,
    titleUnlock: 'Master',
    trackable: true,
    hidden: true,
  },
];

// Helper functions
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export function getAchievementsByRarity(rarity: AchievementRarity): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.rarity === rarity);
}

export function getVisibleAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !a.hidden);
}

export function getTrackableAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.trackable);
}

export function getTitles(): { id: string; title: string }[] {
  return ACHIEVEMENTS.filter((a) => a.titleUnlock).map((a) => ({
    id: a.id,
    title: a.titleUnlock!,
  }));
}

// Get total achievement count
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;

// Category display names
export const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  progression: 'Progression',
  performance: 'Performance',
  dedication: 'Dedication',
  mastery: 'Mastery',
  special: 'Special',
};

// Rarity display names
export const RARITY_NAMES: Record<AchievementRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};
