'use client';

/**
 * PauseMenu - Pause overlay menu
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';

interface PauseMenuProps {
  className?: string;
}

export function PauseMenu({ className = '' }: PauseMenuProps) {
  const status = useGameStore((state) => state.status);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const scores = useGameStore((state) => state.scores);

  if (status !== 'paused') return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-40 ${className}`}
      style={{
        backgroundColor: 'rgba(5, 5, 16, 0.9)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <HUDPanel padding="lg" variant="glow" className="w-full max-w-sm mx-4">
        {/* Header */}
        <h2
          className="text-3xl font-black text-center mb-6 uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.primary,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 20px ${cyberTheme.colors.primary}`,
          }}
        >
          PAUSED
        </h2>

        {/* Current score */}
        <div
          className="flex items-center justify-center gap-6 mb-8 p-4 rounded-lg"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
          }}
        >
          <div className="text-center">
            <div
              className="text-4xl font-black"
              style={{
                color: cyberTheme.colors.player.you,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {scores.player1}
            </div>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              You
            </div>
          </div>
          <div
            className="text-2xl"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            -
          </div>
          <div className="text-center">
            <div
              className="text-4xl font-black"
              style={{
                color: cyberTheme.colors.player.opponent,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {scores.player2}
            </div>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              AI
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={resumeGame}
            className="w-full"
          >
            RESUME
          </CyberButton>
          <CyberButton
            variant="danger"
            size="lg"
            onClick={resetGame}
            className="w-full"
          >
            QUIT MATCH
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default PauseMenu;
