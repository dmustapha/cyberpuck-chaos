'use client';

/**
 * RematchRequestModal - Modal shown when opponent requests a rematch
 *
 * Allows the player to accept or decline the rematch request.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';

interface RematchRequestModalProps {
  isVisible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onResetGame: () => void;
  className?: string;
}

export function RematchRequestModal({
  isVisible,
  onAccept,
  onDecline,
  onResetGame,
  className = '',
}: RematchRequestModalProps) {
  const router = useRouter();

  if (!isVisible) {
    return null;
  }

  const handleDecline = () => {
    onDecline();
    onResetGame();
    router.push('/');
  };

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
          className="text-2xl font-black text-center mb-2 uppercase tracking-wider"
          style={{
            color: cyberTheme.colors.primary,
            fontFamily: cyberTheme.fonts.heading,
            textShadow: `0 0 20px ${cyberTheme.colors.primary}`,
          }}
        >
          REMATCH REQUEST
        </h2>

        {/* Message */}
        <p
          className="text-center mb-6"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          Your opponent wants to play again!
        </p>

        {/* Animated indicator */}
        <div
          className="flex justify-center mb-6"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}20`,
              border: `2px solid ${cyberTheme.colors.primary}`,
            }}
          >
            <span className="text-3xl">🎮</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={onAccept}
            className="w-full"
          >
            YES, REMATCH!
          </CyberButton>
          <CyberButton
            variant="secondary"
            size="lg"
            onClick={handleDecline}
            className="w-full"
          >
            NO, EXIT
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default RematchRequestModal;
