'use client';

/**
 * GoalCelebration - Epic goal scored effect with particles and screen flash
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

export function GoalCelebration() {
  const status = useGameStore((state) => state.status);
  const lastScorer = useGameStore((state) => state.lastScorer);
  const playerNumber = useGameStore((state) => state.playerNumber);
  const mode = useGameStore((state) => state.mode);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showText, setShowText] = useState(false);

  // Determine if the goal was scored by the local player
  const isMyGoal = mode === 'multiplayer'
    ? (lastScorer === 'player1' && playerNumber === 1) || (lastScorer === 'player2' && playerNumber === 2)
    : lastScorer === 'player1';

  // Colors based on who scored
  const colors = isMyGoal
    ? ['#00ff88', '#00ffcc', '#00ffff', '#88ffcc'] // Green/cyan for player goal
    : ['#ff0088', '#ff00cc', '#ff44aa', '#ff88cc']; // Pink/magenta for opponent goal

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.5;
      const speed = 8 + Math.random() * 12;
      newParticles.push({
        id: i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    }
    setParticles(newParticles);
  }, [colors]);

  useEffect(() => {
    if (status === 'goal') {
      // Trigger effects
      setShowFlash(true);
      setShowText(true);
      createParticles();

      // Hide flash after brief moment
      const flashTimer = setTimeout(() => setShowFlash(false), 150);

      // Animate particles
      const particleInterval = setInterval(() => {
        setParticles((prev) =>
          prev
            .map((p) => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy + 0.3, // gravity
              life: p.life - 0.02,
            }))
            .filter((p) => p.life > 0)
        );
      }, 16);

      // Clean up - animation finishes at 1s, leaving 2.5s clean reposition time
      const cleanupTimer = setTimeout(() => {
        setShowText(false);
        setParticles([]);
      }, 1000);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(cleanupTimer);
        clearInterval(particleInterval);
      };
    }
  }, [status, createParticles]);

  if (status !== 'goal') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Screen flash */}
      {showFlash && (
        <div
          className="absolute inset-0 transition-opacity duration-150"
          style={{
            background: isMyGoal
              ? 'radial-gradient(circle, rgba(0,255,136,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,0,136,0.4) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Particles */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size * p.life}
            fill={p.color}
            opacity={p.life}
            style={{
              filter: `drop-shadow(0 0 ${p.size}px ${p.color})`,
            }}
          />
        ))}
      </svg>

      {/* Goal text */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-6xl md:text-8xl font-black tracking-wider animate-pulse"
            style={{
              color: isMyGoal ? '#00ff88' : '#ff0088',
              textShadow: isMyGoal
                ? '0 0 20px #00ff88, 0 0 40px #00ff88, 0 0 60px #00ffcc'
                : '0 0 20px #ff0088, 0 0 40px #ff0088, 0 0 60px #ff00cc',
              fontFamily: 'Orbitron, sans-serif',
              animation: 'goalPulse 0.5s ease-out',
            }}
          >
            GOAL!
          </div>
        </div>
      )}

      {/* Shockwave ring */}
      {showFlash && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="rounded-full border-4"
            style={{
              width: '100px',
              height: '100px',
              borderColor: isMyGoal ? '#00ff88' : '#ff0088',
              animation: 'shockwave 0.6s ease-out forwards',
              boxShadow: isMyGoal
                ? '0 0 30px #00ff88, inset 0 0 30px #00ff88'
                : '0 0 30px #ff0088, inset 0 0 30px #ff0088',
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes goalPulse {
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

        @keyframes shockwave {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default GoalCelebration;
