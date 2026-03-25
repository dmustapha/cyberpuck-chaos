'use client';

/**
 * PreMatchScreen - Mode and difficulty selection before match
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import { RankBadge } from '../ui/RankBadge';
import { StatusBadge } from '../ui/StatusBadge';
import type { Difficulty } from '@/types/game';

interface PreMatchScreenProps {
  className?: string;
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; description: string; color: string }
> = {
  easy: {
    label: 'EASY',
    description: 'Slower AI, good for practice',
    color: '#22c55e',
  },
  medium: {
    label: 'MEDIUM',
    description: 'Balanced gameplay',
    color: '#fbbf24',
  },
  hard: {
    label: 'HARD',
    description: 'Fast and aggressive AI',
    color: '#ef4444',
  },
};

export function PreMatchScreen({ className = '' }: PreMatchScreenProps) {
  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const gameModeType = useGameStore((state) => state.gameModeType);
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const startGame = useGameStore((state) => state.startGame);

  const profile = usePlayerStore((state) => state.profile);
  const settings = useSettingsStore((state) => state.settings);

  // Only show in AI mode when status is 'menu'
  // Never show in multiplayer mode
  if (status !== 'menu' || mode === 'multiplayer' || gameModeType === 'multiplayer') return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-20 ${className}`}
      style={{
        backgroundColor: cyberTheme.colors.bg.overlay,
        backdropFilter: 'blur(4px)',
      }}
    >
      <HUDPanel padding="lg" variant="glow" className="w-full max-w-lg mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-black mb-2 uppercase tracking-wider"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: `0 0 20px ${cyberTheme.colors.primary}40`,
            }}
          >
            NEW MATCH
          </h2>
          <StatusBadge status={settings.game.matchType} size="md" />
        </div>

        {/* Player info */}
        {profile && (
          <div
            className="flex items-center justify-between p-4 rounded-lg mb-6"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `1px solid ${cyberTheme.colors.border.default}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                style={{
                  backgroundColor: `${cyberTheme.colors.player.you}20`,
                  border: `2px solid ${cyberTheme.colors.player.you}`,
                }}
              >
                👤
              </div>
              <div>
                <div
                  className="font-bold"
                  style={{
                    color: cyberTheme.colors.text.primary,
                    fontFamily: cyberTheme.fonts.heading,
                  }}
                >
                  {profile.username}
                </div>
                <div
                  className="text-sm"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  {profile.rank.elo} ELO
                </div>
              </div>
            </div>
            <RankBadge rank={profile.rank} size="sm" />
          </div>
        )}

        {/* Difficulty selection */}
        <div className="mb-8">
          <h3
            className="text-sm font-bold uppercase tracking-wider mb-4"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Select Difficulty
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
              const config = difficultyConfig[diff];
              const isSelected = difficulty === diff;

              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className="p-4 rounded-lg text-center transition-all duration-200"
                  style={{
                    backgroundColor: isSelected
                      ? `${config.color}20`
                      : cyberTheme.colors.bg.tertiary,
                    border: `2px solid ${
                      isSelected ? config.color : cyberTheme.colors.border.default
                    }`,
                    boxShadow: isSelected ? `0 0 15px ${config.color}40` : 'none',
                  }}
                >
                  <div
                    className="font-bold mb-1"
                    style={{
                      color: isSelected ? config.color : cyberTheme.colors.text.primary,
                      fontFamily: cyberTheme.fonts.heading,
                    }}
                  >
                    {config.label}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: cyberTheme.colors.text.muted }}
                  >
                    {config.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Match settings preview */}
        <div
          className="flex justify-between items-center p-3 rounded-lg mb-6"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
          }}
        >
          <span
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            First to
          </span>
          <span
            className="font-bold"
            style={{
              color: cyberTheme.colors.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {settings.game.scoreToWin} Goals
          </span>
        </div>

        {/* Start button */}
        <CyberButton
          variant="primary"
          size="lg"
          glow
          onClick={() => startGame(settings.game.matchType)}
          className="w-full"
        >
          START MATCH
        </CyberButton>
      </HUDPanel>
    </div>
  );
}

export default PreMatchScreen;
