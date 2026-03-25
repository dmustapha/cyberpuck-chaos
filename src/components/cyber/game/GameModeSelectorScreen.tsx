'use client';

/**
 * GameModeSelectorScreen - Full-page mode selection
 *
 * Shows VS AI and VS PLAYER options.
 * Displayed on /game page when no game is active.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';

interface GameModeSelectorScreenProps {
  className?: string;
}

export function GameModeSelectorScreen({ className = '' }: GameModeSelectorScreenProps) {
  const router = useRouter();
  const goToAISetup = useGameStore((state) => state.goToAISetup);
  const goToMultiplayerLobby = useGameStore((state) => state.goToMultiplayerLobby);

  const handleAISelect = () => {
    goToAISetup();
  };

  const handleMultiplayerSelect = () => {
    goToMultiplayerLobby();
  };

  const handleBack = () => {
    router.push('/');
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
          <h1
            className="text-3xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: cyberTheme.shadows.glowText(cyberTheme.colors.primary),
            }}
          >
            SELECT GAME MODE
          </h1>
          <p
            className="text-sm"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Choose how you want to play
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* VS AI Card */}
          <button
            onClick={handleAISelect}
            className="p-4 sm:p-6 rounded-lg text-center transition-all duration-200 hover:scale-105 group"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${cyberTheme.colors.border.default}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cyberTheme.colors.player.you;
              e.currentTarget.style.boxShadow = cyberTheme.shadows.glow(cyberTheme.colors.player.you);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cyberTheme.colors.border.default;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🤖</div>
            <h3
              className="text-lg sm:text-xl font-bold uppercase mb-2"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              VS AI
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Practice against computer opponents
            </p>
            <div
              className="text-xs uppercase tracking-wider py-1 px-2 rounded inline-block"
              style={{
                backgroundColor: `${cyberTheme.colors.player.you}20`,
                color: cyberTheme.colors.player.you,
              }}
            >
              OFFLINE
            </div>
          </button>

          {/* VS Player Card */}
          <button
            onClick={handleMultiplayerSelect}
            className="p-4 sm:p-6 rounded-lg text-center transition-all duration-200 hover:scale-105 group"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${cyberTheme.colors.border.default}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cyberTheme.colors.primary;
              e.currentTarget.style.boxShadow = cyberTheme.shadows.glow(cyberTheme.colors.primary);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = cyberTheme.colors.border.default;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚔️</div>
            <h3
              className="text-lg sm:text-xl font-bold uppercase mb-2"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              VS PLAYER
            </h3>
            <p
              className="text-sm mb-3"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Challenge real opponents online
            </p>
            <div
              className="text-xs uppercase tracking-wider py-1 px-2 rounded inline-block"
              style={{
                backgroundColor: `${cyberTheme.colors.primary}20`,
                color: cyberTheme.colors.primary,
              }}
            >
              BLOCKCHAIN
            </div>
          </button>
        </div>

        {/* Back button */}
        <div className="text-center">
          <CyberButton variant="ghost" size="sm" onClick={handleBack}>
            Back to Home
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default GameModeSelectorScreen;
