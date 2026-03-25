'use client';

/**
 * GameHUD - Full game HUD wrapper component
 * Note: ScoreOverlay is now rendered outside this component in the game page
 */

import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CountdownOverlay } from './CountdownOverlay';
import { PauseMenu } from './PauseMenu';
import { PreMatchScreen } from './PreMatchScreen';
import { PostMatchScreen } from './PostMatchScreen';
import { GoalCelebration } from './GoalCelebration';

interface GameHUDProps {
  children?: React.ReactNode;
  className?: string;
}

export function GameHUD({ children, className = '' }: GameHUDProps) {
  const status = useGameStore((state) => state.status);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);

  // Handle escape key to toggle pause
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (status === 'playing') {
          pauseGame();
        } else if (status === 'paused') {
          resumeGame();
        }
      }
    },
    [status, pauseGame, resumeGame]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Game canvas container */}
      <div className="relative w-full h-full">{children}</div>

      {/* Game state overlays */}
      <PreMatchScreen />
      <CountdownOverlay />
      <PauseMenu />
      <PostMatchScreen />
      <GoalCelebration />
    </div>
  );
}

export default GameHUD;
