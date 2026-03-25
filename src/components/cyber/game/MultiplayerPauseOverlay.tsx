'use client';

/**
 * MultiplayerPauseOverlay - Pause overlay for multiplayer games
 *
 * Shows when the game is paused or resuming, with appropriate messaging
 * based on the pause reason.
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import type { PauseState, PauseReason } from '@/contexts/MultiplayerContext';

interface MultiplayerPauseOverlayProps {
  pauseState: PauseState;
  playerNumber: 1 | 2 | null;
  onResume: () => void;
  onQuit: () => void;
  className?: string;
}

function getPauseTitle(reason: PauseReason | null, pausedBy: 1 | 2 | null, playerNumber: 1 | 2 | null): string {
  if (!reason) return 'PAUSED';

  switch (reason) {
    case 'player_pause':
      if (pausedBy === playerNumber) {
        return 'GAME PAUSED';
      }
      return 'OPPONENT PAUSED';
    case 'opponent_pause':
      return 'OPPONENT PAUSED';
    case 'connection_lost':
      return 'CONNECTION LOST';
    case 'opponent_disconnected':
      return 'OPPONENT DISCONNECTED';
    default:
      return 'PAUSED';
  }
}

function getPauseMessage(reason: PauseReason | null, pausedBy: 1 | 2 | null, playerNumber: 1 | 2 | null, canResume: boolean, gracePeriodMs?: number): string {
  if (!reason) return '';

  switch (reason) {
    case 'player_pause':
      if (pausedBy === playerNumber) {
        return 'You paused the game. Press Resume when ready.';
      }
      return 'Your opponent paused the game. Waiting for them to resume...';
    case 'opponent_pause':
      return 'Your opponent paused the game. Waiting for them to resume...';
    case 'connection_lost':
      return 'Connection was lost. Attempting to reconnect...';
    case 'opponent_disconnected':
      if (gracePeriodMs) {
        const seconds = Math.ceil(gracePeriodMs / 1000);
        return `Your opponent disconnected. Waiting ${seconds}s for them to reconnect...`;
      }
      return 'Your opponent disconnected. Waiting for them to reconnect...';
    default:
      return canResume ? 'Press Resume to continue playing.' : 'Waiting...';
  }
}

export function MultiplayerPauseOverlay({
  pauseState,
  playerNumber,
  onResume,
  onQuit,
  className = '',
}: MultiplayerPauseOverlayProps) {
  const scores = useGameStore((state) => state.scores);

  // Don't render if not paused
  if (!pauseState.isPaused && pauseState.resumeCountdown === null) {
    return null;
  }

  const isResuming = pauseState.resumeCountdown !== null;
  const title = isResuming ? 'RESUMING' : getPauseTitle(pauseState.reason, pauseState.pausedBy, playerNumber);
  const message = isResuming
    ? 'Get ready!'
    : getPauseMessage(pauseState.reason, pauseState.pausedBy, playerNumber, pauseState.canResume, pauseState.gracePeriodMs);

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
          className="text-3xl font-black text-center mb-4 uppercase tracking-wider"
          style={{
            color: isResuming ? cyberTheme.colors.success : cyberTheme.colors.primary,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 20px ${isResuming ? cyberTheme.colors.success : cyberTheme.colors.primary}`,
          }}
        >
          {title}
        </h2>

        {/* Resume countdown */}
        {isResuming && pauseState.resumeCountdown !== null && (
          <div
            className="text-7xl font-black text-center mb-6"
            style={{
              color: cyberTheme.colors.success,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: `0 0 30px ${cyberTheme.colors.success}`,
              animation: 'pulse 0.5s ease-in-out',
            }}
          >
            {pauseState.resumeCountdown}
          </div>
        )}

        {/* Message */}
        <p
          className="text-center mb-6"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          {message}
        </p>

        {/* Current score */}
        <div
          className="flex items-center justify-center gap-6 mb-6 p-4 rounded-lg"
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
              {playerNumber === 1 ? scores.player1 : scores.player2}
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
              {playerNumber === 1 ? scores.player2 : scores.player1}
            </div>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Opponent
            </div>
          </div>
        </div>

        {/* Buttons - only show when not resuming */}
        {!isResuming && (
          <div className="space-y-3">
            {pauseState.canResume && (
              <CyberButton
                variant="primary"
                size="lg"
                glow
                onClick={onResume}
                className="w-full"
              >
                RESUME
              </CyberButton>
            )}
            <CyberButton
              variant="danger"
              size="lg"
              onClick={onQuit}
              className="w-full"
            >
              QUIT MATCH
            </CyberButton>
          </div>
        )}
      </HUDPanel>
    </div>
  );
}

export default MultiplayerPauseOverlay;
