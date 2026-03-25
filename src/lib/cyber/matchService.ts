/**
 * Match Service - Orchestrates all store updates when a match ends
 *
 * This service coordinates updates across:
 * - gameStore (match result data)
 * - playerStore (ELO, XP, stats)
 * - matchHistoryStore (match record)
 * - achievementStore (achievement checks)
 */

import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useMatchHistoryStore } from '@/stores/matchHistoryStore';
import { useAchievementStore } from '@/stores/achievementStore';
import type { MatchRecord } from '@/types/match';
import type { Difficulty } from '@/types/game';
import { getAchievementById } from './achievements';

export interface MatchEndResult {
  // Match outcome
  result: 'win' | 'loss';
  playerScore: number;
  opponentScore: number;

  // Rewards
  eloChange: number;
  xpGained: number;

  // Level/rank changes
  rankedUp: boolean;
  leveledUp: boolean;
  levelsGained: number;
  newElo: number;
  newLevel: number;

  // Match stats
  duration: number;
  maxCombo: number;
  isPerfectGame: boolean;
  isComebackWin: boolean;

  // Achievements unlocked
  achievementsUnlocked: string[];
  achievementXpGained: number;

  // Match record
  matchRecord: MatchRecord;
}

/**
 * Process the end of a match - updates all stores atomically
 * Call this when status becomes 'gameover'
 */
export function processMatchEnd(difficulty: Difficulty): MatchEndResult | null {
  // Get current game state
  const gameStore = useGameStore.getState();
  const playerStore = usePlayerStore.getState();
  const matchHistoryStore = useMatchHistoryStore.getState();
  const achievementStore = useAchievementStore.getState();

  const matchResult = gameStore.getMatchResult();
  const profile = playerStore.profile;

  if (!matchResult.metadata || !matchResult.winner || !profile) {
    return null;
  }

  const isWin = matchResult.winner === 'player1';
  const result = isWin ? 'win' : 'loss';
  const playerScore = matchResult.scores.player1;
  const opponentScore = matchResult.scores.player2;

  // 1. Update player stats and get rewards
  const playerUpdate = playerStore.recordMatchResult({
    result,
    playerScore,
    opponentScore,
    difficulty,
    duration: matchResult.duration,
    maxCombo: matchResult.maxCombo,
    isPerfectGame: matchResult.isPerfectGame,
    isComebackWin: matchResult.isComebackWin,
  });

  if (!playerUpdate) return null;

  // 2. Add match to history
  const matchRecord = matchHistoryStore.addMatch({
    type: matchResult.metadata.type,
    mode: 'ai',
    difficulty,
    playerScore,
    opponentScore,
    result,
    eloChange: playerUpdate.eloChange,
    xpGained: playerUpdate.xpGained,
    duration: matchResult.duration,
    maxCombo: matchResult.maxCombo,
    comebackWin: matchResult.isComebackWin,
    perfectGame: matchResult.isPerfectGame,
    opponentName: getAIOpponentName(difficulty),
  });

  // 3. Check achievements
  const allUnlocked: string[] = [];

  // Check event-based achievements (perfect game, comeback, speed, etc.)
  const eventUnlocked = achievementStore.checkMatchEventAchievements({
    result,
    playerScore,
    opponentScore,
    duration: matchResult.duration,
    maxCombo: matchResult.maxCombo,
    isPerfectGame: matchResult.isPerfectGame,
    isComebackWin: matchResult.isComebackWin,
  });
  allUnlocked.push(...eventUnlocked);

  // Check stat-based achievements (needs updated profile)
  const updatedProfile = usePlayerStore.getState().profile;
  if (updatedProfile) {
    const statUnlocked = achievementStore.checkStatAchievements(
      updatedProfile.stats,
      updatedProfile.level.current,
      updatedProfile.rank.elo
    );
    allUnlocked.push(...statUnlocked);
  }

  // Check achievement count achievements
  const metaUnlocked = achievementStore.checkAchievementCountAchievements();
  allUnlocked.push(...metaUnlocked);

  // 4. Award XP for achievements
  let achievementXpGained = 0;
  for (const achievementId of allUnlocked) {
    const achievement = getAchievementById(achievementId);
    if (achievement) {
      achievementXpGained += achievement.xpReward;
    }
  }

  // Add achievement XP to player
  if (achievementXpGained > 0) {
    playerStore.addXp(achievementXpGained);
  }

  // 5. Clear match metadata from game store
  gameStore._clearMatch();

  return {
    result,
    playerScore,
    opponentScore,
    eloChange: playerUpdate.eloChange,
    xpGained: playerUpdate.xpGained + achievementXpGained,
    rankedUp: playerUpdate.rankedUp,
    leveledUp: playerUpdate.leveledUp,
    levelsGained: playerUpdate.levelsGained,
    newElo: playerUpdate.newElo,
    newLevel: playerUpdate.newLevel.current,
    duration: matchResult.duration,
    maxCombo: matchResult.maxCombo,
    isPerfectGame: matchResult.isPerfectGame,
    isComebackWin: matchResult.isComebackWin,
    achievementsUnlocked: allUnlocked,
    achievementXpGained,
    matchRecord,
  };
}

/**
 * Get AI opponent name based on difficulty
 */
function getAIOpponentName(difficulty: Difficulty): string {
  const names: Record<Difficulty, string> = {
    easy: 'Training Bot',
    medium: 'Cyber Bot',
    hard: 'Elite Bot',
  };
  return names[difficulty];
}

/**
 * Initialize all stores for a new player
 * Call this on app load
 */
export function initializeStores(username?: string): void {
  const playerStore = usePlayerStore.getState();
  const achievementStore = useAchievementStore.getState();

  // Initialize player profile
  playerStore.initializePlayer(username);

  // Initialize achievement progress
  achievementStore.initializeProgress();

  // Grant early adopter achievement (beta period)
  const isUnlocked = achievementStore.isUnlocked('early_adopter');
  if (!isUnlocked) {
    achievementStore.unlockAchievement('early_adopter');
  }
}

/**
 * Reset all player data (for account reset)
 */
export function resetAllData(): void {
  const playerStore = usePlayerStore.getState();
  const matchHistoryStore = useMatchHistoryStore.getState();
  const achievementStore = useAchievementStore.getState();
  const gameStore = useGameStore.getState();

  playerStore.resetProfile();
  matchHistoryStore.clearHistory();
  achievementStore.resetAchievements();
  gameStore.resetGame();
}
