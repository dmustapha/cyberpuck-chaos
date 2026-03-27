'use client';

/**
 * AISetupScreen - Full-page difficulty selection for AI mode
 *
 * Shows difficulty options and starts the AI game.
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

interface AISetupScreenProps {
  className?: string;
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; description: string; color: string }
> = {
  easy: {
    label: 'EASY',
    description: 'Warm up the reflexes',
    color: '#22c55e',
  },
  medium: {
    label: 'MEDIUM',
    description: 'Chaos gets real',
    color: '#fbbf24',
  },
  hard: {
    label: 'HARD',
    description: 'No mercy. Pure chaos.',
    color: '#ef4444',
  },
};

export function AISetupScreen({ className = '' }: AISetupScreenProps) {
  const difficulty = useGameStore((state) => state.difficulty);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const startGame = useGameStore((state) => state.startGame);
  const goToModeSelection = useGameStore((state) => state.goToModeSelection);

  const profile = usePlayerStore((state) => state.profile);
  const settings = useSettingsStore((state) => state.settings);

  const handleStartGame = () => {
    startGame(settings.game.matchType);
  };

  return (
    <div
      className={`min-h-screen-safe flex items-center justify-center p-4 ${className}`}
      style={{
        backgroundColor: cyberTheme.colors.bg.primary,
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, ${cyberTheme.colors.primary}15 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${cyberTheme.colors.secondary}10 0%, transparent 40%)
        `,
      }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${cyberTheme.colors.border.subtle} 1px, transparent 1px),
            linear-gradient(90deg, ${cyberTheme.colors.border.subtle} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <HUDPanel className="relative z-10 w-full max-w-lg" variant="glow" padding="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={cyberTheme.colors.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${cyberTheme.colors.primary}60)` }}>
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="8.5" cy="16" r="1.5" />
              <circle cx="15.5" cy="16" r="1.5" />
              <path d="M12 11V7a4 4 0 0 0-4-4H8" />
              <path d="M12 11V7a4 4 0 0 1 4-4h0" />
            </svg>
          </div>
          <h1
            className="text-2xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: cyberTheme.shadows.glowText(cyberTheme.colors.primary),
            }}
          >
            VS AI
          </h1>
          <p
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Select difficulty and start the match
          </p>
        </div>

        {/* Match Type Badge */}
        <div className="text-center mb-6">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={cyberTheme.colors.player.you} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
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
        <div className="mb-6">
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
                  className="p-4 rounded-lg text-center transition-all duration-200 hover:scale-105"
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
                    className="w-6 h-6 rounded-full mx-auto mb-2"
                    style={{
                      backgroundColor: isSelected ? config.color : `${config.color}40`,
                      boxShadow: isSelected ? `0 0 12px ${config.color}` : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
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
            border: `1px solid ${cyberTheme.colors.border.default}`,
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
          onClick={handleStartGame}
          className="w-full mb-4"
        >
          START MATCH
        </CyberButton>

        {/* Back button */}
        <div className="text-center">
          <CyberButton variant="ghost" size="sm" onClick={goToModeSelection}>
            ← Back to Mode Selection
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default AISetupScreen;
