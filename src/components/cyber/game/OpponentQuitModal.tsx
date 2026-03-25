'use client';

/**
 * OpponentQuitModal - Modal shown when opponent quits the game
 *
 * Displays a message that the opponent left and shows the result.
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';
import type { OpponentQuitState } from '@/contexts/MultiplayerContext';

interface OpponentQuitModalProps {
  opponentQuit: OpponentQuitState;
  playerNumber: 1 | 2 | null;
  onContinue: () => void;
  className?: string;
}

export function OpponentQuitModal({
  opponentQuit,
  playerNumber,
  onContinue,
  className = '',
}: OpponentQuitModalProps) {
  // Don't render if opponent hasn't quit
  if (!opponentQuit.hasQuit) {
    return null;
  }

  const didWin = opponentQuit.winner === playerNumber;
  const finalScore = opponentQuit.finalScore;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-50 ${className}`}
      style={{
        backgroundColor: 'rgba(5, 5, 16, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <HUDPanel padding="lg" variant="glow" className="w-full max-w-sm mx-4">
        {/* Header */}
        <h2
          className="text-3xl font-black text-center mb-4 uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.warning,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 20px ${cyberTheme.colors.warning}`,
          }}
        >
          OPPONENT LEFT
        </h2>

        {/* Message */}
        <p
          className="text-center mb-6"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          Your opponent has left the match.
        </p>

        {/* Result */}
        <div
          className="text-center mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: didWin
              ? `${cyberTheme.colors.success}15`
              : `${cyberTheme.colors.error}15`,
            border: `1px solid ${didWin ? cyberTheme.colors.success : cyberTheme.colors.error}40`,
          }}
        >
          <div
            className="text-2xl font-black uppercase mb-2"
            style={{
              color: didWin ? cyberTheme.colors.success : cyberTheme.colors.error,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {didWin ? 'YOU WIN!' : 'MATCH ENDED'}
          </div>
          <div
            className="text-sm"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Victory by forfeit
          </div>
        </div>

        {/* Final score */}
        {finalScore && (
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
                className="text-4xl font-black"
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

        {/* Continue button */}
        <CyberButton
          variant="primary"
          size="lg"
          glow
          onClick={onContinue}
          className="w-full"
        >
          CONTINUE
        </CyberButton>
      </HUDPanel>
    </div>
  );
}

export default OpponentQuitModal;
