'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameParticles } from './useGameParticles';
import gsap from 'gsap';

interface ParticleGameSystemProps {
  scrollProgress: number;
}

function ParticleGameSystem({ scrollProgress }: ParticleGameSystemProps) {
  const {
    particlesRef,
    initialPositions,
    setScrollProgress,
    updatePuckPosition,
    updatePlayerPosition,
    updateOpponentPosition,
    triggerGoalExplosion,
    resetGoalExplosion,
  } = useGameParticles(2000);

  const gameTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Track scroll changes
  useEffect(() => {
    setScrollProgress(scrollProgress);
  }, [scrollProgress, setScrollProgress]);

  // Game sequence (60-80% scroll)
  useEffect(() => {
    if (scrollProgress >= 0.6 && scrollProgress < 0.8) {
      // Only create timeline once
      if (!gameTimelineRef.current) {
        resetGoalExplosion();

        const timeline = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
        });

        const puckPos = { x: 0, y: 0 };
        const playerPos = { x: 0, y: -6 };
        const opponentPos = { x: 0, y: 6 };

        timeline
          // Puck moves toward player
          .to(puckPos, {
            duration: 0.4,
            x: 0,
            y: -5,
            ease: 'power1.in',
            onUpdate: () => updatePuckPosition(puckPos.x, puckPos.y),
          })
          // Player paddle moves to hit
          .to(
            playerPos,
            {
              duration: 0.2,
              x: 0,
              y: -5.5,
              onUpdate: () => updatePlayerPosition(playerPos.x, playerPos.y),
            },
            '-=0.15'
          )
          // Puck bounces to opponent
          .to(puckPos, {
            duration: 0.5,
            x: 1,
            y: 5,
            ease: 'power2.out',
            onUpdate: () => updatePuckPosition(puckPos.x, puckPos.y),
          })
          // Player paddle returns
          .to(
            playerPos,
            {
              duration: 0.3,
              x: 0,
              y: -6,
              onUpdate: () => updatePlayerPosition(playerPos.x, playerPos.y),
            },
            '-=0.4'
          )
          // Opponent paddle hits
          .to(
            opponentPos,
            {
              duration: 0.2,
              x: 1,
              y: 4.5,
              onUpdate: () => updateOpponentPosition(opponentPos.x, opponentPos.y),
            },
            '-=0.15'
          )
          // Puck bounces back
          .to(puckPos, {
            duration: 0.5,
            x: -1,
            y: -4,
            ease: 'power2.out',
            onUpdate: () => updatePuckPosition(puckPos.x, puckPos.y),
          })
          // Opponent returns
          .to(
            opponentPos,
            {
              duration: 0.3,
              x: 0,
              y: 6,
              onUpdate: () => updateOpponentPosition(opponentPos.x, opponentPos.y),
            },
            '-=0.4'
          )
          // Player hits final shot
          .to(
            playerPos,
            {
              duration: 0.2,
              x: -1,
              y: -4.5,
              onUpdate: () => updatePlayerPosition(playerPos.x, playerPos.y),
            },
            '-=0.15'
          )
          // GOAL! Puck into opponent's goal
          .to(puckPos, {
            duration: 0.6,
            x: 0,
            y: 8,
            ease: 'power3.in',
            onUpdate: () => updatePuckPosition(puckPos.x, puckPos.y),
          })
          // EXPLOSION
          .call(() => {
            triggerGoalExplosion();
          })
          .to({}, { duration: 0.3 }) // Hold explosion
          // Reset
          .call(() => {
            resetGoalExplosion();
          });

        gameTimelineRef.current = timeline;
      }
    } else {
      // Kill timeline when out of range
      if (gameTimelineRef.current) {
        gameTimelineRef.current.kill();
        gameTimelineRef.current = null;
      }
    }
  }, [
    scrollProgress,
    updatePuckPosition,
    updatePlayerPosition,
    updateOpponentPosition,
    triggerGoalExplosion,
    resetGoalExplosion,
  ]);

  // Dynamic particle colors based on stage
  const getParticleColors = () => {
    const colors = new Float32Array(2000 * 3);

    for (let i = 0; i < 2000; i++) {
      const i3 = i * 3;

      if (scrollProgress < 0.2) {
        // Arena: Cyan
        colors[i3] = 0;
        colors[i3 + 1] = 0.94;
        colors[i3 + 2] = 1;
      } else if (scrollProgress < 0.4) {
        // Paddles: Mix of green and red
        const isPaddleParticle = i > 1200;
        if (isPaddleParticle) {
          if (i < 1600) {
            // Player paddle: Green
            colors[i3] = 0.13;
            colors[i3 + 1] = 0.77;
            colors[i3 + 2] = 0.37;
          } else {
            // Opponent paddle: Red
            colors[i3] = 0.94;
            colors[i3 + 1] = 0.27;
            colors[i3 + 2] = 0.27;
          }
        } else {
          // Arena: Cyan
          colors[i3] = 0;
          colors[i3 + 1] = 0.94;
          colors[i3 + 2] = 1;
        }
      } else if (scrollProgress < 0.6) {
        // Puck added: White for puck
        const isPuckParticle = i > 1900;
        if (isPuckParticle) {
          colors[i3] = 1;
          colors[i3 + 1] = 1;
          colors[i3 + 2] = 1;
        } else if (i > 1200 && i < 1600) {
          colors[i3] = 0.13;
          colors[i3 + 1] = 0.77;
          colors[i3 + 2] = 0.37;
        } else if (i > 1600 && i < 1900) {
          colors[i3] = 0.94;
          colors[i3 + 1] = 0.27;
          colors[i3 + 2] = 0.27;
        } else {
          colors[i3] = 0;
          colors[i3 + 1] = 0.94;
          colors[i3 + 2] = 1;
        }
      } else if (scrollProgress < 0.8) {
        // Game playing: Full colors
        const isPuckParticle = i > 1900;
        if (isPuckParticle) {
          colors[i3] = 1;
          colors[i3 + 1] = 1;
          colors[i3 + 2] = 1;
        } else if (i > 1200 && i < 1600) {
          colors[i3] = 0.13;
          colors[i3 + 1] = 0.77;
          colors[i3 + 2] = 0.37;
        } else if (i > 1600 && i < 1900) {
          colors[i3] = 0.94;
          colors[i3 + 1] = 0.27;
          colors[i3 + 2] = 0.27;
        } else {
          colors[i3] = 0;
          colors[i3 + 1] = 0.94;
          colors[i3 + 2] = 1;
        }
      } else {
        // Title: Cyan and white
        const isCyberText = i < 600;
        if (isCyberText) {
          colors[i3] = 1;
          colors[i3 + 1] = 1;
          colors[i3 + 2] = 1;
        } else {
          colors[i3] = 0;
          colors[i3 + 1] = 0.94;
          colors[i3 + 2] = 1;
        }
      }
    }

    return colors;
  };

  const colors = getParticleColors();

  return (
    <>
      <Points ref={particlesRef} positions={initialPositions}>
        <PointMaterial
          transparent
          vertexColors
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.9}
        />
        <bufferAttribute attach="geometry-attributes-color" args={[colors, 3]} />
      </Points>

      {/* Ambient glow */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={0.8} color="#00f0ff" />

      {/* Goal area glow when in game stage */}
      {scrollProgress >= 0.6 && scrollProgress < 0.8 && (
        <>
          <pointLight position={[0, 8, 2]} intensity={1.5} color="#22c55e" distance={10} />
          <pointLight position={[0, -8, 2]} intensity={1.5} color="#ef4444" distance={10} />
        </>
      )}
    </>
  );
}

export interface ParticleGameProps {
  scrollProgress: number;
  className?: string;
}

export function ParticleGame({ scrollProgress, className = '' }: ParticleGameProps) {
  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 35], fov: 75 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050510']} />
        <ParticleGameSystem scrollProgress={scrollProgress} />
      </Canvas>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/90" />
    </div>
  );
}
