'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useDesign } from './DesignContext';
import { GameMode, Difficulty } from '@/types/game';
import { DesignId } from './types';

type MenuStep = 'main' | 'mode' | 'difficulty' | 'design';

export function ThemedMenu() {
  const router = useRouter();
  const [step, setStep] = useState<MenuStep>('main');
  const { config, setDesign, allDesigns, designId } = useDesign();
  const { colors, effects, fonts } = config;

  const setMode = useGameStore((state) => state.setMode);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const difficulty = useGameStore((state) => state.difficulty);
  const startGame = useGameStore((state) => state.startGame);

  const handlePlay = () => setStep('mode');
  const handleDesigns = () => setStep('design');

  const handleModeSelect = (mode: GameMode) => {
    setMode(mode);
    if (mode === 'ai') {
      setStep('difficulty');
    } else {
      startGame();
      router.push('/game');
    }
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    setDifficulty(diff);
    startGame();
    router.push('/game');
  };

  const handleBack = () => {
    if (step === 'difficulty') setStep('mode');
    else setStep('main');
  };

  // Get design-specific title
  const getTitle = () => {
    switch (config.id) {
      case 'neon-arcade': return 'NEON HOCKEY';
      case 'minimalist': return 'Air Hockey';
      case 'retro-pixel': return 'PUCK MASTERS';
      case 'ice-stadium': return 'ICE HOCKEY';
      case 'cyber-esports': return 'CYBER PUCK';
      default: return 'Air Hockey';
    }
  };

  const getSubtitle = () => {
    switch (config.id) {
      case 'neon-arcade': return 'INSERT COIN TO PLAY';
      case 'minimalist': return 'Tournament Edition';
      case 'retro-pixel': return '© 1985 RETRO GAMES';
      case 'ice-stadium': return 'Professional League';
      case 'cyber-esports': return 'RANKED MATCHMAKING';
      default: return '';
    }
  };

  const buttonStyle: React.CSSProperties = {
    background: colors.accent,
    color: colors.background,
    fontFamily: fonts.body,
    padding: '1rem 2rem',
    fontSize: config.id === 'retro-pixel' ? '0.75rem' : '1rem',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    boxShadow: effects.glowIntensity > 0 ? `0 0 20px ${colors.accent}40` : 'none',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    border: `2px solid ${colors.border}`,
    color: colors.text,
  };

  // Design Selection Screen
  if (step === 'design') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8"
        style={{ background: colors.background }}
      >
        <h2
          className="text-3xl font-bold mb-8"
          style={{ color: colors.text, fontFamily: fonts.heading }}
        >
          {config.id === 'retro-pixel' ? 'SELECT THEME' : 'Choose Design'}
        </h2>

        <div className="grid gap-4 w-full max-w-md mb-8">
          {allDesigns.map((design) => (
            <button
              key={design.id}
              onClick={() => setDesign(design.id as DesignId)}
              className="p-4 text-left transition-all"
              style={{
                background: designId === design.id ? `${design.colors.accent}20` : colors.surface,
                border: `2px solid ${designId === design.id ? design.colors.accent : colors.border}`,
                borderRadius: config.id === 'retro-pixel' ? 0 : '8px',
              }}
            >
              <div className="flex items-center gap-4">
                {/* Color preview */}
                <div
                  className="w-12 h-12 rounded flex-shrink-0"
                  style={{
                    background: design.colors.surface,
                    border: `2px solid ${design.colors.border}`,
                    borderRadius: design.id === 'retro-pixel' ? 0 : '8px',
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center gap-1 p-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: design.colors.player1 }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: design.colors.puck }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: design.colors.player2 }}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div
                    className="font-bold"
                    style={{ color: colors.text }}
                  >
                    {design.name}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    {design.description}
                  </div>
                </div>

                {designId === design.id && (
                  <div style={{ color: colors.accent }}>✓</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button onClick={handleBack} style={secondaryButtonStyle}>
          {config.id === 'retro-pixel' ? '< BACK' : 'Back'}
        </button>
      </div>
    );
  }

  // Mode Selection Screen
  if (step === 'mode') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8"
        style={{ background: colors.background }}
      >
        <h2
          className="text-3xl font-bold mb-8"
          style={{ color: colors.text, fontFamily: fonts.heading }}
        >
          {config.id === 'retro-pixel' ? 'SELECT MODE' : 'Select Mode'}
        </h2>

        <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
          <button
            onClick={() => handleModeSelect('ai')}
            className="p-6 text-center transition-all"
            style={{
              background: colors.surface,
              border: `2px solid ${colors.border}`,
              borderRadius: config.id === 'retro-pixel' ? 0 : '12px',
            }}
          >
            <div className="text-3xl mb-2">🤖</div>
            <div style={{ color: colors.text, fontFamily: fonts.body }}>
              {config.id === 'retro-pixel' ? '1 PLAYER' : 'VS Computer'}
            </div>
          </button>

          <button
            onClick={() => handleModeSelect('multiplayer')}
            className="p-6 text-center transition-all"
            style={{
              background: colors.surface,
              border: `2px solid ${colors.border}`,
              borderRadius: config.id === 'retro-pixel' ? 0 : '12px',
            }}
          >
            <div className="text-3xl mb-2">👥</div>
            <div style={{ color: colors.text, fontFamily: fonts.body }}>
              {config.id === 'retro-pixel' ? '2 PLAYERS' : 'Local Multiplayer'}
            </div>
          </button>
        </div>

        <button onClick={handleBack} style={secondaryButtonStyle}>
          {config.id === 'retro-pixel' ? '< BACK' : 'Back'}
        </button>
      </div>
    );
  }

  // Difficulty Selection Screen
  if (step === 'difficulty') {
    const difficulties: { value: Difficulty; label: string; desc: string }[] = [
      { value: 'easy', label: config.id === 'retro-pixel' ? 'EASY' : 'Easy', desc: 'For beginners' },
      { value: 'medium', label: config.id === 'retro-pixel' ? 'NORMAL' : 'Medium', desc: 'Balanced challenge' },
      { value: 'hard', label: config.id === 'retro-pixel' ? 'HARD' : 'Hard', desc: 'Expert level' },
    ];

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen p-8"
        style={{ background: colors.background }}
      >
        <h2
          className="text-3xl font-bold mb-8"
          style={{ color: colors.text, fontFamily: fonts.heading }}
        >
          {config.id === 'retro-pixel' ? 'SELECT LEVEL' : 'Select Difficulty'}
        </h2>

        <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => handleDifficultySelect(diff.value)}
              className="p-4 text-left transition-all"
              style={{
                background: difficulty === diff.value ? `${colors.accent}20` : colors.surface,
                border: `2px solid ${difficulty === diff.value ? colors.accent : colors.border}`,
                borderRadius: config.id === 'retro-pixel' ? 0 : '8px',
              }}
            >
              <div
                className="font-bold"
                style={{ color: colors.text, fontFamily: fonts.body }}
              >
                {diff.label}
              </div>
              <div
                className="text-sm"
                style={{ color: colors.textMuted }}
              >
                {diff.desc}
              </div>
            </button>
          ))}
        </div>

        <button onClick={handleBack} style={secondaryButtonStyle}>
          {config.id === 'retro-pixel' ? '< BACK' : 'Back'}
        </button>
      </div>
    );
  }

  // Main Menu
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 relative overflow-hidden"
      style={{ background: colors.background }}
    >
      {/* Background effects for neon theme */}
      {config.id === 'neon-arcade' && (
        <>
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 -top-48 -left-48"
            style={{ background: colors.accent }}
          />
          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 -bottom-48 -right-48"
            style={{ background: colors.border }}
          />
        </>
      )}

      {/* Grid for cyber theme */}
      {config.id === 'cyber-esports' && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${colors.border}20 1px, transparent 1px), linear-gradient(90deg, ${colors.border}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Title */}
      <div className="text-center mb-12 relative z-10">
        <h1
          className="font-bold mb-4"
          style={{
            color: colors.text,
            fontFamily: fonts.heading,
            fontSize: config.id === 'retro-pixel' ? '2rem' : '3.5rem',
            textShadow: effects.glowIntensity > 0
              ? `0 0 30px ${colors.accent}`
              : 'none',
          }}
        >
          {getTitle()}
        </h1>
        <p style={{ color: colors.textMuted, fontFamily: fonts.body }}>
          {getSubtitle()}
        </p>
      </div>

      {/* Animated puck */}
      <div
        className="w-16 h-16 rounded-full mb-12 animate-bounce relative z-10"
        style={{
          background: colors.puck,
          boxShadow: effects.glowIntensity > 0
            ? `0 0 30px ${colors.puckGlow}`
            : '0 4px 20px rgba(0,0,0,0.3)',
          borderRadius: config.id === 'retro-pixel' ? 0 : '50%',
        }}
      />

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        <button onClick={handlePlay} style={buttonStyle}>
          {config.id === 'retro-pixel' ? '> START GAME' : 'Play Game'}
        </button>

        <button onClick={handleDesigns} style={secondaryButtonStyle}>
          {config.id === 'retro-pixel' ? '> THEMES' : 'Change Design'}
        </button>
      </div>

      {/* Current design indicator */}
      <div
        className="absolute bottom-8 flex items-center gap-2 z-10"
        style={{ color: colors.textMuted }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ background: colors.accent }}
        />
        <span className="text-sm" style={{ fontFamily: fonts.body }}>
          {config.name}
        </span>
      </div>
    </div>
  );
}
