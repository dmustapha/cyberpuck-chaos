'use client';

/**
 * MultiplayerGameOverModal - Modal shown when a multiplayer game ends
 *
 * Shows personalized win/lose message to each player with options to:
 * - Play Again (request rematch)
 * - Exit (return to main menu)
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import type { RematchState, OpponentExitedState } from '@/contexts/MultiplayerContext';

interface MultiplayerGameOverModalProps {
  isVisible: boolean;
  winner: 1 | 2 | null;
  playerNumber: 1 | 2 | null;
  finalScore: { player1: number; player2: number } | null;
  rematchState: RematchState;
  opponentExited: OpponentExitedState;
  onPlayAgain: () => void;
  onExit: () => void;
  onResetGame: () => void;
  className?: string;
}

export function MultiplayerGameOverModal({
  isVisible,
  winner,
  playerNumber,
  finalScore,
  rematchState,
  opponentExited,
  onPlayAgain,
  onExit,
  onResetGame,
  className = '',
}: MultiplayerGameOverModalProps) {
  const router = useRouter();

  // Don't render if not visible or missing data
  if (!isVisible || winner === null || playerNumber === null) {
    return null;
  }

  const didWin = winner === playerNumber;

  // Handle exit - send exit message and navigate
  const handleExit = () => {
    onExit();
    onResetGame();
    router.push('/');
  };

  // Handle opponent exited scenario
  if (opponentExited.hasExited) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center z-50 ${className}`}
        style={{
          backgroundColor: 'rgba(5, 5, 16, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <HUDPanel padding="lg" variant="glow" className="w-full max-w-sm mx-4">
          <h2
            className="text-2xl font-black text-center mb-4 uppercase tracking-wider"
            style={{
              color: cyberTheme.colors.warning,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: `0 0 20px ${cyberTheme.colors.warning}`,
            }}
          >
            OPPONENT LEFT
          </h2>

          <p
            className="text-center mb-6"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Your opponent has left the match.
          </p>

          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={() => {
              onResetGame();
              router.push('/');
            }}
            className="w-full"
          >
            BACK TO MENU
          </CyberButton>
        </HUDPanel>
      </div>
    );
  }

  // Handle rematch declined scenario
  if (rematchState.declined) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center z-50 ${className}`}
        style={{
          backgroundColor: 'rgba(5, 5, 16, 0.95)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <HUDPanel padding="lg" variant="glow" className="w-full max-w-sm mx-4">
          <h2
            className="text-2xl font-black text-center mb-4 uppercase tracking-wider"
            style={{
              color: cyberTheme.colors.warning,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: `0 0 20px ${cyberTheme.colors.warning}`,
            }}
          >
            REMATCH DECLINED
          </h2>

          <p
            className="text-center mb-6"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Your opponent declined the rematch.
          </p>

          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={() => {
              onResetGame();
              router.push('/');
            }}
            className="w-full"
          >
            BACK TO MENU
          </CyberButton>
        </HUDPanel>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-50 ${className}`}
      style={{
        backgroundColor: 'rgba(5, 5, 16, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <HUDPanel padding="lg" variant="glow" className="w-full max-w-sm mx-4 max-h-[90dvh] overflow-y-auto">
        {/* Result header */}
        <h2
          className="text-3xl sm:text-4xl font-black text-center mb-4 uppercase tracking-wider"
          style={{
            color: didWin ? cyberTheme.colors.success : cyberTheme.colors.error,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 30px ${didWin ? cyberTheme.colors.success : cyberTheme.colors.error}`,
          }}
        >
          {didWin ? 'VICTORY!' : 'DEFEAT'}
        </h2>

        {/* Subtitle */}
        <p
          className="text-center mb-6"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          {didWin ? 'You dominated the arena!' : 'Better luck next time!'}
        </p>

        {/* Final score */}
        {finalScore && (
          <div
            className="flex items-center justify-center gap-6 mb-6 p-3 sm:p-4 rounded-lg"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
            }}
          >
            <div className="text-center">
              <div
                className="text-3xl sm:text-4xl font-black"
                style={{
                  color: cyberTheme.colors.player.you,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {playerNumber === 1 ? finalScore.player1 : finalScore.player2}
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
                className="text-3xl sm:text-4xl font-black"
                style={{
                  color: cyberTheme.colors.player.opponent,
                  fontFamily: cyberTheme.fonts.heading,
                }}
              >
                {playerNumber === 1 ? finalScore.player2 : finalScore.player1}
              </div>
              <div
                className="text-xs uppercase tracking-wider"
                style={{ color: cyberTheme.colors.text.muted }}
              >
                Opponent
              </div>
            </div>
          </div>
        )}

        {/* Waiting for response message */}
        {rematchState.waitingForResponse && (
          <div
            className="text-center mb-4 p-3 rounded-lg"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}15`,
              border: `1px solid ${cyberTheme.colors.primary}40`,
            }}
          >
            <div
              className="text-sm uppercase tracking-wider animate-pulse"
              style={{ color: cyberTheme.colors.primary }}
            >
              Waiting for opponent...
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={onPlayAgain}
            disabled={rematchState.waitingForResponse}
            className="w-full"
          >
            {rematchState.waitingForResponse ? 'WAITING...' : 'PLAY AGAIN'}
          </CyberButton>
          <CyberButton
            variant="secondary"
            size="lg"
            onClick={handleExit}
            disabled={rematchState.waitingForResponse}
            className="w-full"
          >
            EXIT
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default MultiplayerGameOverModal;
