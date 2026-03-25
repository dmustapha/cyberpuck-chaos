'use client';

/**
 * PostMatchScreen - Results screen after match ends
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cyberTheme, getRankColor } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useMatchHistoryStore } from '@/stores/matchHistoryStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import { RankBadge } from '../ui/RankBadge';
import { EloDisplay } from '../ui/EloDisplay';
import { ProgressBar } from '../ui/ProgressBar';
import { calculateEloChange, applyEloChange, getRankFromElo, checkRankUp } from '@/lib/cyber/elo';
import { calculateMatchXp, applyXp, getLevelProgress, checkLevelUp } from '@/lib/cyber/xp';
import { getAchievementById } from '@/lib/cyber/achievements';
import type { MatchResult } from '@/types/match';

interface PostMatchScreenProps {
  className?: string;
}

export function PostMatchScreen({ className = '' }: PostMatchScreenProps) {
  const status = useGameStore((state) => state.status);
  const winner = useGameStore((state) => state.winner);
  const scores = useGameStore((state) => state.scores);
  const difficulty = useGameStore((state) => state.difficulty);
  const matchMetadata = useGameStore((state) => state.matchMetadata);
  const combo = useGameStore((state) => state.combo);
  const getMatchDuration = useGameStore((state) => state.getMatchDuration);
  const resetGame = useGameStore((state) => state.resetGame);
  const startGame = useGameStore((state) => state.startGame);

  const profile = usePlayerStore((state) => state.profile);
  const updateRank = usePlayerStore((state) => state.updateRank);
  const updateStats = usePlayerStore((state) => state.updateStats);
  const updateLevel = usePlayerStore((state) => state.updateLevel);
  const updateLastPlayed = usePlayerStore((state) => state.updateLastPlayed);

  const addMatch = useMatchHistoryStore((state) => state.addMatch);

  const checkStatAchievements = useAchievementStore((state) => state.checkStatAchievements);
  const checkMatchEventAchievements = useAchievementStore((state) => state.checkMatchEventAchievements);
  const checkAchievementCountAchievements = useAchievementStore((state) => state.checkAchievementCountAchievements);
  const addXpToPlayer = usePlayerStore((state) => state.addXp);

  const [processed, setProcessed] = useState(false);
  const [eloChange, setEloChange] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [rankedUp, setRankedUp] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState<string[]>([]);

  const isWin = winner === 'player1';
  const result: MatchResult = isWin ? 'win' : 'loss';

  useEffect(() => {
    if (status === 'gameover' && profile && !processed) {
      // Calculate changes
      const eloDelta = calculateEloChange(result, scores.player1, scores.player2, difficulty);
      const xp = calculateMatchXp(
        result,
        scores.player1,
        scores.player2,
        isWin ? profile.stats.winStreak + 1 : 0,
        matchMetadata?.comebackWin ?? false
      );

      setEloChange(eloDelta);
      setXpGained(xp);

      // Apply ELO changes
      const newElo = applyEloChange(profile.rank.elo, eloDelta);
      const newRank = getRankFromElo(newElo, profile.rank.peakElo);
      const didRankUp = checkRankUp(profile.rank.elo, newElo);
      setRankedUp(didRankUp);
      updateRank(newRank);

      // Apply XP changes
      const newLevel = applyXp(profile.level, xp);
      const didLevelUp = checkLevelUp(profile.level.current, newLevel.current);
      setLeveledUp(didLevelUp);
      updateLevel(newLevel);

      // Update stats
      const duration = getMatchDuration();
      const matchCount = profile.stats.totalMatches + 1;
      updateStats({
        totalMatches: matchCount,
        wins: profile.stats.wins + (isWin ? 1 : 0),
        losses: profile.stats.losses + (isWin ? 0 : 1),
        winStreak: isWin ? profile.stats.winStreak + 1 : 0,
        totalGoalsScored: profile.stats.totalGoalsScored + scores.player1,
        totalGoalsConceded: profile.stats.totalGoalsConceded + scores.player2,
        totalPlayTime: profile.stats.totalPlayTime + duration,
        averageMatchDuration: Math.floor(
          (profile.stats.totalPlayTime + duration) / matchCount
        ),
        maxCombo: Math.max(profile.stats.maxCombo, combo.max),
        perfectGames:
          profile.stats.perfectGames + (isWin && scores.player2 === 0 ? 1 : 0),
        comebackWins:
          profile.stats.comebackWins + (matchMetadata?.comebackWin ? 1 : 0),
      });

      updateLastPlayed();

      // Add match to history
      addMatch({
        type: 'ranked',
        mode: 'ai',
        difficulty,
        playerScore: scores.player1,
        opponentScore: scores.player2,
        result,
        eloChange: eloDelta,
        xpGained: xp,
        duration,
        maxCombo: combo.max,
        comebackWin: matchMetadata?.comebackWin ?? false,
        perfectGame: isWin && scores.player2 === 0,
        opponentName: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} AI`,
      });

      // Check achievements
      const allUnlocked: string[] = [];

      // Check event-based achievements
      const eventUnlocked = checkMatchEventAchievements({
        result,
        playerScore: scores.player1,
        opponentScore: scores.player2,
        duration,
        maxCombo: combo.max,
        isPerfectGame: isWin && scores.player2 === 0,
        isComebackWin: matchMetadata?.comebackWin ?? false,
      });
      allUnlocked.push(...eventUnlocked);

      // Check stat-based achievements (use updated stats)
      const updatedStats = {
        totalMatches: matchCount,
        wins: profile.stats.wins + (isWin ? 1 : 0),
        losses: profile.stats.losses + (isWin ? 0 : 1),
        winStreak: isWin ? profile.stats.winStreak + 1 : 0,
        maxWinStreak: Math.max(profile.stats.maxWinStreak, isWin ? profile.stats.winStreak + 1 : 0),
        totalGoalsScored: profile.stats.totalGoalsScored + scores.player1,
        totalGoalsConceded: profile.stats.totalGoalsConceded + scores.player2,
        totalPlayTime: profile.stats.totalPlayTime + duration,
        averageMatchDuration: Math.floor((profile.stats.totalPlayTime + duration) / matchCount),
        maxCombo: Math.max(profile.stats.maxCombo, combo.max),
        perfectGames: profile.stats.perfectGames + (isWin && scores.player2 === 0 ? 1 : 0),
        comebackWins: profile.stats.comebackWins + (matchMetadata?.comebackWin ? 1 : 0),
      };
      const statUnlocked = checkStatAchievements(updatedStats, newLevel.current, newElo);
      allUnlocked.push(...statUnlocked);

      // Check achievement count achievements
      const metaUnlocked = checkAchievementCountAchievements();
      allUnlocked.push(...metaUnlocked);

      // Award XP for achievements
      let achievementXp = 0;
      for (const id of allUnlocked) {
        const achievement = getAchievementById(id);
        if (achievement) {
          achievementXp += achievement.xpReward;
        }
      }
      if (achievementXp > 0) {
        addXpToPlayer(achievementXp);
        setXpGained(xp + achievementXp);
      }

      setAchievementsUnlocked(allUnlocked);
      setProcessed(true);
    }
  }, [status, profile, processed, checkMatchEventAchievements, checkStatAchievements, checkAchievementCountAchievements, addXpToPlayer]);

  // Reset processed state when game resets
  useEffect(() => {
    if (status !== 'gameover') {
      setProcessed(false);
      setAchievementsUnlocked([]);
    }
  }, [status]);

  if (status !== 'gameover') return null;

  const levelProgress = profile ? getLevelProgress(profile.level) : 0;

  // Simplified UI when profile is not available (e.g., wallet not connected)
  if (!profile) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center z-40 ${className}`}
        style={{
          backgroundColor: 'rgba(5, 5, 16, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <HUDPanel padding="lg" variant="glow" className="w-full max-w-md mx-4">
          {/* Result header */}
          <div className="text-center mb-6">
            <h2
              className="text-4xl font-black mb-2 uppercase tracking-wider"
              style={{
                color: isWin ? cyberTheme.colors.success : cyberTheme.colors.error,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 30px ${isWin ? cyberTheme.colors.success : cyberTheme.colors.error}`,
              }}
            >
              {isWin ? 'VICTORY!' : 'DEFEAT'}
            </h2>

            {/* Score */}
            <div
              className="flex items-center justify-center gap-4"
              style={{ color: cyberTheme.colors.text.primary }}
            >
              <span
                className="text-5xl font-black"
                style={{
                  color: cyberTheme.colors.player.you,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {scores.player1}
              </span>
              <span className="text-2xl" style={{ color: cyberTheme.colors.text.muted }}>
                -
              </span>
              <span
                className="text-5xl font-black"
                style={{
                  color: cyberTheme.colors.player.opponent,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {scores.player2}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <CyberButton
              variant="primary"
              size="lg"
              glow
              onClick={() => {
                setProcessed(false);
                startGame();
              }}
              className="w-full"
            >
              PLAY AGAIN
            </CyberButton>
            <Link href="/" className="block">
              <CyberButton variant="secondary" size="lg" className="w-full">
                BACK TO HOME
              </CyberButton>
            </Link>
          </div>
        </HUDPanel>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-40 ${className}`}
      style={{
        backgroundColor: 'rgba(5, 5, 16, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <HUDPanel padding="lg" variant="glow" className="w-full max-w-md mx-4">
        {/* Result header */}
        <div className="text-center mb-6">
          <h2
            className="text-4xl font-black mb-2 uppercase tracking-wider"
            style={{
              color: isWin ? cyberTheme.colors.success : cyberTheme.colors.error,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: `0 0 30px ${isWin ? cyberTheme.colors.success : cyberTheme.colors.error}`,
            }}
          >
            {isWin ? 'VICTORY!' : 'DEFEAT'}
          </h2>

          {/* Score */}
          <div
            className="flex items-center justify-center gap-4"
            style={{ color: cyberTheme.colors.text.primary }}
          >
            <span
              className="text-5xl font-black"
              style={{
                color: cyberTheme.colors.player.you,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {scores.player1}
            </span>
            <span className="text-2xl" style={{ color: cyberTheme.colors.text.muted }}>
              -
            </span>
            <span
              className="text-5xl font-black"
              style={{
                color: cyberTheme.colors.player.opponent,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {scores.player2}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-4 p-4 rounded-lg mb-6"
          style={{ backgroundColor: cyberTheme.colors.bg.tertiary }}
        >
          {/* ELO change */}
          <div className="text-center">
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              ELO
            </div>
            <EloDisplay elo={profile.rank.elo} change={eloChange} size="md" />
          </div>

          {/* XP gained */}
          <div className="text-center">
            <div
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              XP Gained
            </div>
            <span
              className="text-2xl font-bold"
              style={{
                color: cyberTheme.colors.success,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              +{xpGained}
            </span>
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Current Rank
          </span>
          <RankBadge rank={profile.rank} size="md" showElo />
        </div>

        {/* Level progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Level {profile.level.current}
            </span>
            <span
              className="text-sm"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {profile.level.xp} / {profile.level.xpToNextLevel} XP
            </span>
          </div>
          <ProgressBar value={levelProgress} height="sm" />
        </div>

        {/* Notifications */}
        {(rankedUp || leveledUp || matchMetadata?.comebackWin || achievementsUnlocked.length > 0) && (
          <div className="space-y-2 mb-6">
            {/* Achievement unlocks */}
            {achievementsUnlocked.map((id) => {
              const achievement = getAchievementById(id);
              if (!achievement) return null;
              return (
                <div
                  key={id}
                  className="p-3 rounded-lg flex items-center gap-3"
                  style={{
                    backgroundColor: `${cyberTheme.colors.warning}15`,
                    border: `1px solid ${cyberTheme.colors.warning}`,
                  }}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div
                      className="font-bold text-sm uppercase"
                      style={{ color: cyberTheme.colors.warning }}
                    >
                      Achievement Unlocked!
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: cyberTheme.colors.text.primary }}
                    >
                      {achievement.name}
                    </div>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: cyberTheme.colors.success }}
                  >
                    +{achievement.xpReward} XP
                  </span>
                </div>
              );
            })}
            {rankedUp && (
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: `${getRankColor(profile.rank.tier)}20`,
                  border: `1px solid ${getRankColor(profile.rank.tier)}`,
                }}
              >
                <span
                  className="font-bold uppercase"
                  style={{ color: getRankColor(profile.rank.tier) }}
                >
                  Rank Up! You reached {profile.rank.tier}
                </span>
              </div>
            )}
            {leveledUp && (
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: `${cyberTheme.colors.primary}20`,
                  border: `1px solid ${cyberTheme.colors.primary}`,
                }}
              >
                <span
                  className="font-bold uppercase"
                  style={{ color: cyberTheme.colors.primary }}
                >
                  Level Up! Now level {profile.level.current}
                </span>
              </div>
            )}
            {matchMetadata?.comebackWin && (
              <div
                className="p-3 rounded-lg text-center"
                style={{
                  backgroundColor: `${cyberTheme.colors.warning}20`,
                  border: `1px solid ${cyberTheme.colors.warning}`,
                }}
              >
                <span
                  className="font-bold uppercase"
                  style={{ color: cyberTheme.colors.warning }}
                >
                  Comeback Victory! +30 Bonus XP
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={() => {
              setProcessed(false);
              startGame();
            }}
            className="w-full"
          >
            PLAY AGAIN
          </CyberButton>
          <Link href="/" className="block">
            <CyberButton variant="secondary" size="lg" className="w-full">
              BACK TO HOME
            </CyberButton>
          </Link>
        </div>
      </HUDPanel>
    </div>
  );
}

export default PostMatchScreen;
