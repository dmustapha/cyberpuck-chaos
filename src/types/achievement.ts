/**
 * Achievement Types for Cyber Esports Air Hockey
 */

export type AchievementCategory =
  | 'progression' // Level/rank milestones
  | 'performance' // In-game feats
  | 'dedication' // Play time/matches
  | 'mastery' // Skill-based
  | 'special'; // Hidden/rare

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Condition types for unlocking achievements
export type AchievementConditionType = 'stat' | 'event' | 'milestone';

export interface AchievementCondition {
  type: AchievementConditionType;
  target: string; // stat key, event name, or milestone identifier
  value: number; // threshold to unlock
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // emoji or icon identifier

  condition: AchievementCondition;

  // Rewards
  xpReward: number;
  titleUnlock?: string; // unlocks a player title

  // Display options
  trackable: boolean; // shows progress bar
  hidden: boolean; // hidden until unlocked
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  unlockedAt: string | null; // ISO date if unlocked, null if not
  notified: boolean; // user has seen unlock notification
}

export interface AchievementState {
  progress: Record<string, AchievementProgress>;
  recentUnlocks: string[]; // achievement IDs recently unlocked (for notifications)
}

// Rarity colors for display
export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: '#9ca3af', // gray
  uncommon: '#22c55e', // green
  rare: '#3b82f6', // blue
  epic: '#1D4ED8', // deep blue
  legendary: '#f59e0b', // amber/gold
};

// XP rewards by rarity
export const RARITY_XP_REWARDS: Record<AchievementRarity, number> = {
  common: 50,
  uncommon: 100,
  rare: 200,
  epic: 350,
  legendary: 500,
};
