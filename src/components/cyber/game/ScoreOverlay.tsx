'use client';

/**
 * ScoreOverlay - Score display bar (positioned above the game canvas)
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { ComboCounter } from '../ui/ComboCounter';

interface ScoreOverlayProps {
  className?: string;
  onPause?: () => void;
}

export function ScoreOverlay({ className = '', onPause }: ScoreOverlayProps) {
  const scores = useGameStore((state) => state.scores);
  const combo = useGameStore((state) => state.combo);
  const difficulty = useGameStore((state) => state.difficulty);
  const mode = useGameStore((state) => state.mode);
  const playerNumber = useGameStore((state) => state.playerNumber);
  const profile = usePlayerStore((state) => state.profile);

  const playerName = profile?.username || 'You';
  // In multiplayer, show "Opponent" instead of AI difficulty
  const opponentName = mode === 'multiplayer'
    ? 'Opponent'
    : difficulty === 'easy'
      ? 'Easy AI'
      : difficulty === 'medium'
      ? 'Medium AI'
      : 'Hard AI';

  // For Player 2 in multiplayer, swap the scores so "You" shows their score
  const isPlayer2 = mode === 'multiplayer' && playerNumber === 2;
  const myScore = isPlayer2 ? scores.player2 : scores.player1;
  const opponentScore = isPlayer2 ? scores.player1 : scores.player2;

  // Dynamic colors based on who's winning (from local player's perspective)
  const meWinning = myScore > opponentScore;
  const opponentWinning = opponentScore > myScore;
  const isTied = myScore === opponentScore;

  // My color: green if winning, red if losing, neutral (primary blue) if tied
  const myColor = isTied
    ? cyberTheme.colors.primary
    : meWinning
      ? cyberTheme.colors.success
      : cyberTheme.colors.error;

  // Opponent color: green if winning, red if losing, neutral (primary blue) if tied
  const opponentColor = isTied
    ? cyberTheme.colors.primary
    : opponentWinning
      ? cyberTheme.colors.success
      : cyberTheme.colors.error;

  return (
    <div className={`w-full ${className}`}>
      {/* Score bar */}
      <div
        className="flex items-center justify-between gap-2 sm:gap-4 p-2 sm:p-4 rounded-lg"
        style={{
          backgroundColor: cyberTheme.colors.bg.panel,
          border: `1px solid ${cyberTheme.colors.border.default}`,
        }}
      >
        {/* You - Left side */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
            style={{
              backgroundColor: `${myColor}15`,
              border: `2px solid ${myColor}`,
              boxShadow: `0 0 15px ${myColor}40`,
            }}
          >
            <div
              className="text-2xl sm:text-4xl font-black tabular-nums"
              style={{
                color: myColor,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 15px ${myColor}`,
              }}
            >
              {myScore}
            </div>
          </div>
          <div>
            <div
              className="text-xs sm:text-sm font-bold uppercase tracking-wider"
              style={{
                color: myColor,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {playerName}
            </div>
            <div
              className="hidden sm:block text-xs uppercase"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              You
            </div>
          </div>
        </div>

        {/* Center - VS and Combo */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="text-lg sm:text-2xl font-bold"
            style={{
              color: cyberTheme.colors.text.muted,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            VS
          </div>
          {/* Combo counter */}
          {combo.current >= 2 && <ComboCounter combo={combo.current} size="sm" />}
        </div>

        {/* Opponent - Right side */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
          <div className="text-right">
            <div
              className="text-xs sm:text-sm font-bold uppercase tracking-wider"
              style={{
                color: opponentColor,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {opponentName}
            </div>
            <div
              className="hidden sm:block text-xs uppercase"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Opponent
            </div>
          </div>
          <div
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
            style={{
              backgroundColor: `${opponentColor}15`,
              border: `2px solid ${opponentColor}`,
              boxShadow: `0 0 15px ${opponentColor}40`,
            }}
          >
            <div
              className="text-2xl sm:text-4xl font-black tabular-nums"
              style={{
                color: opponentColor,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 15px ${opponentColor}`,
              }}
            >
              {opponentScore}
            </div>
          </div>
        </div>

        {/* Mobile pause button - inline with score bar */}
        {onPause && (
          <button
            className="sm:hidden flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg ml-1"
            onClick={onPause}
            style={{
              backgroundColor: `${cyberTheme.colors.primary}15`,
              border: `1px solid ${cyberTheme.colors.primary}40`,
            }}
          >
            <span className="text-base" style={{ color: cyberTheme.colors.primary }}>
              ⏸
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ScoreOverlay;
