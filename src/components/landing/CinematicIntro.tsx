'use client';

/**
 * Cinematic Intro - Remotion Composition
 * 4-second epic intro sequence
 * Frame rate: 30fps = 120 total frames
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const CinematicIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Color palette
  const colors = {
    cyan: '#00f0ff',
    white: '#ffffff',
    black: '#030308',
    amber: '#f59e0b',
  };

  // Frame markers
  const PHASE_1_END = 30; // 0-1s: Initialize
  const PHASE_2_END = 60; // 1-2s: Hyperspace
  const PHASE_3_END = 90; // 2-3s: Puck formation
  const PHASE_4_END = 120; // 3-4s: Title slam

  // Phase 1: Initialize text (0-30 frames)
  const initializeOpacity = interpolate(frame, [0, 15, 30], [0, 1, 0]);
  const pulseScale = spring({
    frame: frame % 15,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  // Phase 2: Hyperspace effect (30-60 frames)
  const hyperspaceActive = frame >= PHASE_1_END && frame < PHASE_2_END;
  const lineCount = 20;
  const lineProgress = interpolate(
    frame,
    [PHASE_1_END, PHASE_2_END],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Phase 3: Puck formation (60-90 frames)
  const puckActive = frame >= PHASE_2_END && frame < PHASE_3_END;
  const puckScale = interpolate(
    frame,
    [PHASE_2_END, PHASE_2_END + 10, PHASE_3_END - 10, PHASE_3_END],
    [0, 1.2, 1.2, 15],
    { extrapolateRight: 'clamp' }
  );
  const puckOpacity = interpolate(
    frame,
    [PHASE_2_END, PHASE_2_END + 5, PHASE_3_END - 5, PHASE_3_END],
    [0, 1, 1, 0]
  );
  const puckZ = interpolate(
    frame,
    [PHASE_3_END - 10, PHASE_3_END],
    [0, -1000],
    { extrapolateRight: 'clamp' }
  );

  // Phase 4: Title slam (90-120 frames)
  const titleActive = frame >= PHASE_3_END;

  // "CYBER" comes from left with spring effect
  const cyberX = spring({
    frame: frame - PHASE_3_END,
    fps,
    from: -100,
    to: 0,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 1,
    },
  });

  // "AIR HOCKEY" comes from right with spring effect
  const airHockeyX = spring({
    frame: frame - (PHASE_3_END + 3),
    fps,
    from: 100,
    to: 0,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 1,
    },
  });

  // Impact flash
  const flashOpacity = interpolate(
    frame,
    [PHASE_3_END + 11, PHASE_3_END + 13, PHASE_3_END + 15],
    [0, 1, 0]
  );

  // Screen shake on impact
  const shakeX = interpolate(
    frame,
    [PHASE_3_END + 11, PHASE_3_END + 12, PHASE_3_END + 13, PHASE_3_END + 14],
    [0, -8, 8, 0]
  );

  const shakeY = interpolate(
    frame,
    [PHASE_3_END + 11, PHASE_3_END + 12, PHASE_3_END + 13, PHASE_3_END + 14],
    [0, 6, -6, 0]
  );

  // Chromatic aberration on impact
  const chromaticAmount = interpolate(
    frame,
    [PHASE_3_END + 11, PHASE_3_END + 13, PHASE_3_END + 16],
    [0, 6, 0]
  );

  // Particle explosion
  const particleCount = 30;
  const explosionProgress = interpolate(
    frame,
    [PHASE_3_END + 11, PHASE_4_END],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.black,
        transform: titleActive ? `translate(${shakeX}px, ${shakeY}px)` : 'none',
      }}
    >
      {/* PHASE 1: Initialize Text */}
      {frame < PHASE_2_END && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              opacity: initializeOpacity,
            }}
          >
            {/* Pulsing light */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: colors.cyan,
                transform: `translate(-50%, -50%) scale(${pulseScale})`,
                boxShadow: `0 0 ${40 * pulseScale}px ${colors.cyan}`,
                filter: `blur(${2 * pulseScale}px)`,
              }}
            />

            {/* Initialize text */}
            <div
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 32,
                fontWeight: 700,
                color: colors.cyan,
                textShadow: `0 0 20px ${colors.cyan}`,
                letterSpacing: '0.2em',
                marginTop: 100,
              }}
            >
              INITIALIZE...
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* PHASE 2: Hyperspace Lines */}
      {hyperspaceActive && (
        <AbsoluteFill>
          {Array.from({ length: lineCount }).map((_, i) => {
            const angle = (i / lineCount) * Math.PI * 2;
            const speed = 0.5 + (i % 3) * 0.3;
            const length = 100 + (i % 5) * 50;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 2,
                  height: length * lineProgress * speed,
                  background: `linear-gradient(to bottom, transparent, ${colors.cyan}, transparent)`,
                  transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(-${200 * lineProgress * speed}px)`,
                  boxShadow: `0 0 10px ${colors.cyan}`,
                  opacity: 0.7,
                }}
              />
            );
          })}
        </AbsoluteFill>
      )}

      {/* PHASE 3: Puck Formation and Rush */}
      {puckActive && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: 1000,
          }}
        >
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.white}, ${colors.cyan})`,
              transform: `scale(${puckScale}) translateZ(${puckZ}px)`,
              opacity: puckOpacity,
              boxShadow: `
                0 0 50px ${colors.cyan},
                0 0 100px ${colors.cyan},
                0 0 150px ${colors.cyan},
                inset 0 0 30px rgba(255, 255, 255, 0.5)
              `,
              filter: puckZ < -500 ? `blur(${Math.abs(puckZ) / 100}px)` : 'none',
            }}
          />
        </AbsoluteFill>
      )}

      {/* PHASE 4: Title Slam */}
      {titleActive && (
        <>
          {/* Impact Flash */}
          <AbsoluteFill
            style={{
              backgroundColor: colors.white,
              opacity: flashOpacity,
            }}
          />

          {/* Particle Explosion */}
          {Array.from({ length: particleCount }).map((_, i) => {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 0.5 + Math.random() * 0.5;
            const size = 3 + Math.random() * 4;

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  backgroundColor: i % 2 === 0 ? colors.cyan : colors.amber,
                  transform: `translate(-50%, -50%) translate(${Math.cos(angle) * 300 * explosionProgress * speed}px, ${Math.sin(angle) * 300 * explosionProgress * speed}px)`,
                  opacity: 1 - explosionProgress,
                  boxShadow: `0 0 10px ${i % 2 === 0 ? colors.cyan : colors.amber}`,
                }}
              />
            );
          })}

          {/* Title Text with Chromatic Aberration */}
          <AbsoluteFill
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
            }}
          >
            {/* CYBER - with RGB split effect on impact */}
            <div style={{ position: 'relative' }}>
              {/* Red channel */}
              <div
                style={{
                  position: 'absolute',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 120,
                  fontWeight: 900,
                  color: '#ff0000',
                  letterSpacing: '0.1em',
                  transform: `translateX(calc(${cyberX}% - ${chromaticAmount}px))`,
                  lineHeight: 1,
                  opacity: chromaticAmount > 0 ? 0.7 : 0,
                  mixBlendMode: 'screen',
                }}
              >
                CYBER
              </div>
              {/* Blue channel */}
              <div
                style={{
                  position: 'absolute',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 120,
                  fontWeight: 900,
                  color: '#0000ff',
                  letterSpacing: '0.1em',
                  transform: `translateX(calc(${cyberX}% + ${chromaticAmount}px))`,
                  lineHeight: 1,
                  opacity: chromaticAmount > 0 ? 0.7 : 0,
                  mixBlendMode: 'screen',
                }}
              >
                CYBER
              </div>
              {/* Main text */}
              <div
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 120,
                  fontWeight: 900,
                  color: colors.white,
                  letterSpacing: '0.1em',
                  textShadow: `
                    0 0 20px ${colors.cyan},
                    0 0 40px ${colors.cyan},
                    0 0 60px ${colors.cyan}
                  `,
                  transform: `translateX(${cyberX}%)`,
                  lineHeight: 1,
                }}
              >
                CYBER
              </div>
            </div>

            {/* AIR HOCKEY - with RGB split effect on impact */}
            <div style={{ position: 'relative' }}>
              {/* Red channel */}
              <div
                style={{
                  position: 'absolute',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 120,
                  fontWeight: 900,
                  color: '#ff0000',
                  letterSpacing: '0.1em',
                  transform: `translateX(calc(${airHockeyX}% - ${chromaticAmount}px))`,
                  lineHeight: 1,
                  opacity: chromaticAmount > 0 ? 0.7 : 0,
                  mixBlendMode: 'screen',
                }}
              >
                AIR HOCKEY
              </div>
              {/* Blue channel */}
              <div
                style={{
                  position: 'absolute',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 120,
                  fontWeight: 900,
                  color: '#0000ff',
                  letterSpacing: '0.1em',
                  transform: `translateX(calc(${airHockeyX}% + ${chromaticAmount}px))`,
                  lineHeight: 1,
                  opacity: chromaticAmount > 0 ? 0.7 : 0,
                  mixBlendMode: 'screen',
                }}
              >
                AIR HOCKEY
              </div>
              {/* Main text */}
              <div
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 120,
                  fontWeight: 900,
                  color: colors.cyan,
                  letterSpacing: '0.1em',
                  textShadow: `
                    0 0 20px ${colors.cyan},
                    0 0 40px ${colors.cyan},
                    0 0 60px ${colors.cyan}
                  `,
                  transform: `translateX(${airHockeyX}%)`,
                  lineHeight: 1,
                }}
              >
                AIR HOCKEY
              </div>
            </div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
