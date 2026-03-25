'use client';

/**
 * MultiplayerLobbyScreen - Create or Join game options
 *
 * Shows connected wallet and options to create or join a game.
 * Both options interact with the game server.
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import { CreateGameModal } from './CreateGameModal';
import { JoinGameModal } from './JoinGameModal';

interface MultiplayerLobbyScreenProps {
  className?: string;
}

export function MultiplayerLobbyScreen({ className = '' }: MultiplayerLobbyScreenProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const goToModeSelection = useGameStore((state) => state.goToModeSelection);
  const { shortAddress } = useDynamicWallet();

  return (
    <>
      {/* Create Game Modal */}
      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Join Game Modal */}
      <JoinGameModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />

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

        <HUDPanel className="relative z-10 w-full max-w-md" variant="glow" padding="lg">
          {/* Wallet Info */}
          <div
            className="flex items-center justify-between p-3 rounded-lg mb-3 sm:mb-6"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `1px solid ${cyberTheme.colors.border.default}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cyberTheme.colors.success }}
              />
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                Connected
              </span>
            </div>
            <span
              className="font-mono text-sm"
              style={{ color: cyberTheme.colors.success }}
            >
              {shortAddress}
            </span>
          </div>

          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <div className="text-3xl sm:text-5xl mb-2 sm:mb-4">⚔️</div>
            <h1
              className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-1 sm:mb-2"
              style={{
                color: cyberTheme.colors.text.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              MULTIPLAYER
            </h1>
            <p
              className="text-sm"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Create a new game or join with a Game ID
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* Create Game */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full p-3 sm:p-5 rounded-lg text-left transition-all duration-200 hover:scale-[1.02]"
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
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: `${cyberTheme.colors.primary}20`,
                    border: `1px solid ${cyberTheme.colors.primary}40`,
                  }}
                >
                  +
                </div>
                <div className="flex-1">
                  <h3
                    className="font-bold uppercase text-lg mb-1"
                    style={{
                      color: cyberTheme.colors.text.primary,
                      fontFamily: cyberTheme.fonts.heading,
                    }}
                  >
                    Create Game
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: cyberTheme.colors.text.muted }}
                  >
                    Start a new game and share the ID
                  </p>
                </div>
                <div
                  className="text-xl"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  →
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="relative">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className="w-full border-t"
                  style={{ borderColor: cyberTheme.colors.border.default }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 text-sm uppercase tracking-wider"
                  style={{
                    backgroundColor: cyberTheme.colors.bg.panel,
                    color: cyberTheme.colors.text.muted,
                  }}
                >
                  or
                </span>
              </div>
            </div>

            {/* Join Game */}
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full p-3 sm:p-5 rounded-lg text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: cyberTheme.colors.bg.tertiary,
                border: `2px solid ${cyberTheme.colors.border.default}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = cyberTheme.colors.success;
                e.currentTarget.style.boxShadow = cyberTheme.shadows.glow(cyberTheme.colors.success);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = cyberTheme.colors.border.default;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: `${cyberTheme.colors.success}20`,
                    border: `1px solid ${cyberTheme.colors.success}40`,
                  }}
                >
                  ⏎
                </div>
                <div className="flex-1">
                  <h3
                    className="font-bold uppercase text-lg mb-1"
                    style={{
                      color: cyberTheme.colors.text.primary,
                      fontFamily: cyberTheme.fonts.heading,
                    }}
                  >
                    Join Game
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: cyberTheme.colors.text.muted }}
                  >
                    Enter a Game ID to join
                  </p>
                </div>
                <div
                  className="text-xl"
                  style={{ color: cyberTheme.colors.text.muted }}
                >
                  →
                </div>
              </div>
            </button>
          </div>

          {/* Info Box - hidden on small screens to save space */}
          <div
            className="hidden sm:block mt-3 sm:mt-6 p-3 sm:p-4 rounded-lg text-sm"
            style={{
              backgroundColor: `${cyberTheme.colors.info}10`,
              border: `1px solid ${cyberTheme.colors.info}30`,
            }}
          >
            <p style={{ color: cyberTheme.colors.text.secondary }}>
              <span style={{ color: cyberTheme.colors.info }}>Note:</span> Both creating and joining
              a game registers the action on the server.
            </p>
          </div>

          {/* Back button */}
          <div className="mt-3 sm:mt-6 text-center">
            <CyberButton variant="ghost" size="sm" onClick={goToModeSelection}>
              ← Back to Mode Selection
            </CyberButton>
          </div>
        </HUDPanel>
      </div>
    </>
  );
}

export default MultiplayerLobbyScreen;
