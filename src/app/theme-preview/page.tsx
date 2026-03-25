'use client';

/**
 * World-Class Theme Preview Page
 * Interactive showcase of all 4 distinctive themes
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { themes, themeList, ThemeId, Theme } from '@/lib/themes';
import { useThemeStore } from '@/stores/themeStore';

// Theme-specific background component
function ThemeBackground({ theme }: { theme: Theme }) {
  if (theme.effects.starfield) {
    return <div className="arcade-starfield" />;
  }
  if (theme.effects.scanlines) {
    return <div className="retro-scanlines" />;
  }
  if (theme.effects.ambientLight) {
    return <div className="premium-ambient-light" />;
  }
  if (theme.effects.meshGradient) {
    return (
      <div className="electric-mesh-gradient">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
    );
  }
  return null;
}

// Mini game table preview
function MiniTable({ theme, isHovered }: { theme: Theme; isHovered: boolean }) {
  const { colors, effects } = theme;

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden transition-all duration-500"
      style={{
        background: colors.table,
        border: `3px solid ${colors.tableBorder}`,
        boxShadow: isHovered
          ? `0 0 ${effects.glowIntensity * 2}px ${colors.tableBorder}60, inset 0 0 30px rgba(0,0,0,0.5)`
          : `0 0 ${effects.glowIntensity}px ${colors.tableBorder}40, inset 0 0 20px rgba(0,0,0,0.3)`,
        borderRadius: theme.borderRadius === '0' ? '0' : '8px',
      }}
    >
      {/* Center line */}
      <div
        className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2"
        style={{ background: colors.centerLine }}
      />

      {/* Center circle */}
      <div
        className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
        style={{ borderColor: colors.centerCircle }}
      />

      {/* Goals */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 rounded-b-lg"
        style={{ background: colors.goalPlayer2 }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-2 rounded-t-lg"
        style={{ background: colors.goalPlayer1 }}
      />

      {/* Player 1 paddle */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.paddle1}, ${colors.paddle1Inner})`,
          boxShadow: isHovered
            ? `0 0 ${effects.glowIntensity * 1.5}px ${colors.paddle1Glow}`
            : `0 0 ${effects.glowIntensity}px ${colors.paddle1Glow}`,
        }}
      />

      {/* Player 2 paddle */}
      <div
        className={`absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.paddle2}, ${colors.paddle2Inner})`,
          boxShadow: isHovered
            ? `0 0 ${effects.glowIntensity * 1.5}px ${colors.paddle2Glow}`
            : `0 0 ${effects.glowIntensity}px ${colors.paddle2Glow}`,
        }}
      />

      {/* Puck */}
      <div
        className={`absolute left-1/2 top-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
        style={{
          background: colors.puck,
          boxShadow: `0 0 ${effects.glowIntensity}px ${colors.puckGlow}`,
        }}
      />

      {/* Scanlines overlay for retro */}
      {effects.scanlines && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      )}

      {/* CRT curve for retro */}
      {effects.screenCurvature && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: '8% / 5%',
            boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}
    </div>
  );
}

// Animated score display
function ScoreDisplay({
  theme,
  score,
  player,
  animate,
}: {
  theme: Theme;
  score: number;
  player: 1 | 2;
  animate: boolean;
}) {
  const color = player === 1 ? theme.colors.score1 : theme.colors.score2;
  const animClass = animate ? theme.animations.scoreChange : '';

  return (
    <div className="text-center">
      <div
        className={`text-5xl font-bold ${animClass}`}
        style={{
          color,
          fontFamily: theme.fonts.score,
          textShadow: `0 0 ${theme.effects.glowIntensity}px ${color}60`,
        }}
      >
        {score}
      </div>
      <div
        className="text-xs uppercase tracking-wider mt-1"
        style={{ color: theme.colors.textMuted }}
      >
        {player === 1 ? 'You' : 'CPU'}
      </div>
    </div>
  );
}

// Theme card component
function ThemeCard({
  theme,
  isSelected,
  onSelect,
}: {
  theme: Theme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [score1, setScore1] = useState(7);
  const [score2, setScore2] = useState(3);
  const [animateScore, setAnimateScore] = useState(false);

  // Demo score animation on hover
  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setAnimateScore(true);
        setScore1((s) => (s >= 10 ? 0 : s + 1));
        setTimeout(() => setAnimateScore(false), 600);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative cursor-pointer overflow-hidden transition-all duration-500 ${
        isSelected ? 'ring-4 ring-white scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
      style={{
        background: theme.colors.backgroundGradient || theme.colors.background,
        border: `2px solid ${theme.colors.tableBorder}`,
        borderRadius: theme.borderRadius === '0' ? '4px' : theme.borderRadius,
      }}
    >
      {/* Theme Name Badge */}
      <div
        className="absolute top-4 left-4 px-4 py-1.5 text-xs font-bold uppercase tracking-wider z-10"
        style={{
          background: theme.colors.primary,
          color: theme.colors.background,
          fontFamily: theme.fonts.heading,
          borderRadius: theme.borderRadius === '0' ? '0' : '9999px',
          boxShadow: `0 0 ${theme.effects.glowIntensity}px ${theme.colors.primary}50`,
        }}
      >
        {theme.name}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center z-10"
          style={{ background: theme.colors.primary }}
        >
          <svg
            className="w-4 h-4"
            style={{ color: theme.colors.background }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="p-6 pt-16">
        {/* Mini Table */}
        <div className="mb-6">
          <MiniTable theme={theme} isHovered={isHovered} />
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <ScoreDisplay
            theme={theme}
            score={score1}
            player={1}
            animate={animateScore}
          />
          <div
            className="text-2xl font-bold"
            style={{ color: theme.colors.textMuted }}
          >
            -
          </div>
          <ScoreDisplay
            theme={theme}
            score={score2}
            player={2}
            animate={false}
          />
        </div>

        {/* Sample Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${theme.cssPrefix}-button`}
            style={{
              background: theme.colors.primary,
              color: theme.colors.background,
              fontFamily: theme.fonts.heading,
              borderRadius: theme.borderRadius === '0' ? '0' : '8px',
              boxShadow: `0 0 ${theme.effects.glowIntensity / 2}px ${theme.colors.primary}50`,
            }}
          >
            PLAY
          </button>
          <button
            className="flex-1 py-3 px-4 font-semibold text-sm transition-all"
            style={{
              background: 'transparent',
              color: theme.colors.text,
              fontFamily: theme.fonts.heading,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.borderRadius === '0' ? '0' : '8px',
            }}
          >
            SETTINGS
          </button>
        </div>

        {/* Tagline */}
        <p
          className="text-center text-sm font-bold uppercase tracking-widest"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.fonts.heading,
          }}
        >
          {theme.tagline}
        </p>

        {/* Description */}
        <p
          className="text-center text-xs mt-2"
          style={{ color: theme.colors.textMuted }}
        >
          {theme.description}
        </p>
      </div>

      {/* Hover overlay effect */}
      {isHovered && !isSelected && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.colors.primary}10 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}

// Color swatch component
function ColorSwatch({
  name,
  color,
  theme,
}: {
  name: string;
  color: string;
  theme: Theme;
}) {
  return (
    <div className="text-center">
      <div
        className="w-full aspect-square rounded-lg mb-2 border transition-all hover:scale-110 cursor-pointer"
        style={{
          background: color,
          borderColor: `${theme.colors.text}20`,
          boxShadow: `0 0 15px ${color}30`,
          borderRadius: theme.borderRadius === '0' ? '4px' : '8px',
        }}
      />
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: theme.colors.textMuted }}
      >
        {name}
      </span>
    </div>
  );
}

export default function ThemePreviewPage() {
  const { themeId, theme: currentTheme, setTheme } = useThemeStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleApplyTheme = (id: ThemeId) => {
    if (id !== themeId) {
      setIsTransitioning(true);
      setTimeout(() => {
        setTheme(id);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
      style={{
        background:
          currentTheme.colors.backgroundGradient || currentTheme.colors.background,
      }}
    >
      {/* Theme-specific background effects */}
      <ThemeBackground theme={currentTheme} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 transition-all hover:scale-105"
          style={{
            color: currentTheme.colors.text,
            backgroundColor: `${currentTheme.colors.primary}20`,
            border: `1px solid ${currentTheme.colors.primary}40`,
            borderRadius: currentTheme.borderRadius === '0' ? '4px' : '8px',
            fontFamily: currentTheme.fonts.heading,
          }}
        >
          <span style={{ fontSize: currentTheme.id === 'retro' ? '1.25rem' : '1rem' }}>
            {currentTheme.id === 'retro' ? '< ' : '← '}
          </span>
          BACK TO HOME
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl md:text-6xl font-bold mb-4 uppercase tracking-wider ${currentTheme.animations.idle}`}
            style={{
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.heading,
              textShadow: `0 0 ${currentTheme.effects.glowIntensity}px ${currentTheme.colors.primary}40`,
            }}
          >
            Choose Your Theme
          </h1>
          <p
            className="text-lg"
            style={{
              color: currentTheme.colors.textMuted,
              fontFamily: currentTheme.fonts.body,
            }}
          >
            Click on a theme to apply it instantly. Current:{' '}
            <strong
              style={{
                color: currentTheme.colors.primary,
                fontFamily: currentTheme.fonts.heading,
              }}
            >
              {currentTheme.name}
            </strong>
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {themeList.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={themeId === theme.id}
              onSelect={() => handleApplyTheme(theme.id)}
            />
          ))}
        </div>

        {/* Color Palette Section */}
        <div
          className="p-8 mb-8 transition-all"
          style={{
            background: `${currentTheme.colors.background}ee`,
            border: `1px solid ${currentTheme.colors.tableBorder}30`,
            borderRadius: currentTheme.borderRadius === '0' ? '4px' : '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2
            className="text-2xl font-bold mb-6 uppercase tracking-wider"
            style={{
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.heading,
            }}
          >
            {currentTheme.name} Color Palette
          </h2>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            <ColorSwatch name="Primary" color={currentTheme.colors.primary} theme={currentTheme} />
            <ColorSwatch name="Secondary" color={currentTheme.colors.secondary} theme={currentTheme} />
            <ColorSwatch name="Accent" color={currentTheme.colors.accent} theme={currentTheme} />
            <ColorSwatch name="You" color={currentTheme.colors.paddle1} theme={currentTheme} />
            <ColorSwatch name="Opponent" color={currentTheme.colors.paddle2} theme={currentTheme} />
            <ColorSwatch name="Puck" color={currentTheme.colors.puck} theme={currentTheme} />
            <ColorSwatch name="Text" color={currentTheme.colors.text} theme={currentTheme} />
            <ColorSwatch name="Background" color={currentTheme.colors.background} theme={currentTheme} />
          </div>
        </div>

        {/* Effects Section */}
        <div
          className="p-8 mb-8 transition-all"
          style={{
            background: `${currentTheme.colors.background}ee`,
            border: `1px solid ${currentTheme.colors.tableBorder}30`,
            borderRadius: currentTheme.borderRadius === '0' ? '4px' : '16px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2
            className="text-2xl font-bold mb-6 uppercase tracking-wider"
            style={{
              color: currentTheme.colors.text,
              fontFamily: currentTheme.fonts.heading,
            }}
          >
            Visual Effects
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Starfield', active: currentTheme.effects.starfield },
              { name: 'Scanlines', active: currentTheme.effects.scanlines },
              { name: 'Phosphor Bloom', active: currentTheme.effects.phosphorBloom },
              { name: 'Screen Curve', active: currentTheme.effects.screenCurvature },
              { name: 'Mesh Gradient', active: currentTheme.effects.meshGradient },
              { name: 'Metallic Shimmer', active: currentTheme.effects.metallicShimmer },
              { name: 'Ambient Light', active: currentTheme.effects.ambientLight },
              { name: 'Trail Effect', active: currentTheme.effects.trailEffect },
            ].map((effect) => (
              <div
                key={effect.name}
                className="flex items-center gap-3 p-3"
                style={{
                  background: effect.active ? `${currentTheme.colors.primary}20` : 'transparent',
                  borderRadius: currentTheme.borderRadius === '0' ? '4px' : '8px',
                  border: `1px solid ${effect.active ? currentTheme.colors.primary : currentTheme.colors.textMuted}30`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: effect.active ? currentTheme.colors.primary : currentTheme.colors.textMuted,
                    boxShadow: effect.active ? `0 0 8px ${currentTheme.colors.primary}` : 'none',
                  }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: effect.active ? currentTheme.colors.text : currentTheme.colors.textMuted,
                    fontFamily: currentTheme.fonts.body,
                  }}
                >
                  {effect.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Play button */}
        <div className="text-center">
          <Link href="/game">
            <button
              className={`py-5 px-16 font-bold text-xl uppercase tracking-wider transition-all hover:scale-105 ${currentTheme.cssPrefix}-button`}
              style={{
                background: currentTheme.colors.primary,
                color: currentTheme.colors.background,
                fontFamily: currentTheme.fonts.heading,
                borderRadius: currentTheme.borderRadius === '0' ? '0' : '12px',
                boxShadow: `0 0 ${currentTheme.effects.glowIntensity * 2}px ${currentTheme.colors.primary}40`,
              }}
            >
              Play with {currentTheme.name}
            </button>
          </Link>
          <p
            className="mt-4 text-sm"
            style={{
              color: currentTheme.colors.textMuted,
              fontFamily: currentTheme.fonts.body,
            }}
          >
            Theme is automatically saved and will persist across sessions
          </p>
        </div>
      </div>
    </div>
  );
}
