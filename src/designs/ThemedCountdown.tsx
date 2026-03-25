'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useDesign } from './DesignContext';

export function ThemedCountdown() {
  const status = useGameStore((state) => state.status);
  const countdown = useGameStore((state) => state.countdown);
  const setCountdown = useGameStore((state) => state.setCountdown);
  const { config } = useDesign();
  const { colors, effects, fonts } = config;

  useEffect(() => {
    if (status !== 'countdown') return;

    const timer = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, setCountdown]);

  if (status !== 'countdown') return null;

  // Design-specific text
  const getReadyText = () => {
    switch (config.id) {
      case 'neon-arcade': return 'READY PLAYER ONE';
      case 'retro-pixel': return 'GET READY!!';
      case 'ice-stadium': return 'Face-Off';
      case 'cyber-esports': return 'MATCH STARTING';
      case 'minimalist': return 'Get ready';
      default: return 'Get Ready!';
    }
  };

  const getCountdownDisplay = () => {
    if (countdown > 0) {
      if (config.id === 'retro-pixel') {
        return countdown.toString();
      }
      return countdown;
    }
    switch (config.id) {
      case 'neon-arcade': return 'FIGHT!';
      case 'retro-pixel': return 'GO!!';
      case 'ice-stadium': return 'PLAY!';
      case 'cyber-esports': return 'ENGAGE';
      case 'minimalist': return 'Go';
      default: return 'GO!';
    }
  };

  const getContainerStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (config.id) {
      case 'neon-arcade':
        return {
          ...base,
          background: `${colors.background}ee`,
          backdropFilter: 'blur(8px)',
        };
      case 'retro-pixel':
        return {
          ...base,
          background: colors.background,
        };
      case 'ice-stadium':
        return {
          ...base,
          background: `linear-gradient(135deg, ${colors.background}f0 0%, ${colors.backgroundSecondary}f0 100%)`,
          backdropFilter: 'blur(4px)',
        };
      case 'cyber-esports':
        return {
          ...base,
          background: `${colors.background}f5`,
          backdropFilter: 'blur(10px)',
        };
      case 'minimalist':
        return {
          ...base,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
        };
      default:
        return {
          ...base,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
        };
    }
  };

  const getCountdownStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: fonts.score,
      fontWeight: 'bold',
    };

    switch (config.id) {
      case 'neon-arcade':
        return {
          ...base,
          fontSize: '10rem',
          color: colors.accent,
          textShadow: `0 0 60px ${colors.accent}, 0 0 120px ${colors.accent}80`,
          animation: 'pulse 0.5s ease-in-out infinite',
        };
      case 'retro-pixel':
        return {
          ...base,
          fontSize: '6rem',
          color: colors.text,
          letterSpacing: '0.2em',
        };
      case 'ice-stadium':
        return {
          ...base,
          fontSize: '8rem',
          color: colors.text,
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        };
      case 'cyber-esports':
        return {
          ...base,
          fontSize: '9rem',
          color: colors.accent,
          textShadow: `0 0 40px ${colors.accent}`,
          letterSpacing: '0.1em',
        };
      case 'minimalist':
        return {
          ...base,
          fontSize: '8rem',
          color: colors.text,
          fontWeight: 300,
        };
      default:
        return {
          ...base,
          fontSize: '8rem',
          color: 'white',
        };
    }
  };

  return (
    <div style={getContainerStyle()}>
      <div className="text-center">
        {/* Scanline effect for retro */}
        {config.id === 'retro-pixel' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
            }}
          />
        )}

        {/* Cyber grid */}
        {config.id === 'cyber-esports' && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(${colors.border}20 1px, transparent 1px), linear-gradient(90deg, ${colors.border}20 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        )}

        <div style={getCountdownStyle()}>
          {getCountdownDisplay()}
        </div>

        <div
          className="mt-4"
          style={{
            color: colors.textMuted,
            fontFamily: fonts.body,
            fontSize: config.id === 'retro-pixel' ? '1rem' : '1.5rem',
            letterSpacing: config.id === 'retro-pixel' ? '0.15em' : '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {getReadyText()}
        </div>

        {/* Decorative elements */}
        {config.id === 'neon-arcade' && (
          <div className="flex justify-center gap-4 mt-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full animate-pulse"
                style={{
                  background: i === 1 ? colors.accent : colors.border,
                  boxShadow: `0 0 10px ${i === 1 ? colors.accent : colors.border}`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}

        {config.id === 'cyber-esports' && (
          <div
            className="mt-6 text-xs uppercase tracking-widest"
            style={{ color: colors.accent }}
          >
            ▸ INITIALIZING ◂
          </div>
        )}
      </div>
    </div>
  );
}
