'use client';

/**
 * CountdownOverlay - 3-2-1-GO animation
 */

import React, { useEffect, useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';

interface CountdownOverlayProps {
  className?: string;
}

export function CountdownOverlay({ className = '' }: CountdownOverlayProps) {
  const countdown = useGameStore((state) => state.countdown);
  const status = useGameStore((state) => state.status);
  const [displayValue, setDisplayValue] = useState<string | number>('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (status === 'countdown') {
      if (countdown > 0) {
        setDisplayValue(countdown);
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 800);
        return () => clearTimeout(timer);
      } else {
        setDisplayValue('GO!');
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [countdown, status]);

  if (status !== 'countdown') return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-30 pointer-events-none ${className}`}
      style={{
        backgroundColor: 'rgba(5, 5, 16, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className={`text-7xl sm:text-9xl font-black ${isAnimating ? 'animate-countdown' : ''}`}
        style={{
          color:
            displayValue === 'GO!'
              ? cyberTheme.colors.success
              : cyberTheme.colors.primary,
          fontFamily: cyberTheme.fonts.heading,
          textShadow: `
            0 0 20px ${displayValue === 'GO!' ? cyberTheme.colors.success : cyberTheme.colors.primary},
            0 0 40px ${displayValue === 'GO!' ? cyberTheme.colors.success : cyberTheme.colors.primary},
            0 0 60px ${displayValue === 'GO!' ? cyberTheme.colors.success : cyberTheme.colors.primary}
          `,
        }}
      >
        {displayValue}
      </div>

      <style jsx>{`
        @keyframes countdownPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-countdown {
          animation: countdownPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}

export default CountdownOverlay;
