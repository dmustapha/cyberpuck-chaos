'use client';

/**
 * ParticleBackground - Floating particles that span the entire page
 */

import React, { useEffect, useMemo, useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
}

export function ParticleBackground({ particleCount = 50 }: ParticleBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  // Generate particles only on client to avoid hydration mismatch
  const particles = useMemo<Particle[]>(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.2,
    }));
  }, [particleCount]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Fixed particle container that covers the entire viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {mounted &&
          particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size + 'px',
                height: particle.size + 'px',
                left: particle.x + '%',
                top: particle.y + '%',
                backgroundColor: cyberTheme.colors.primary,
                opacity: particle.opacity,
                boxShadow: `0 0 ${particle.size}px ${cyberTheme.colors.primary}`,
                animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
                animationDelay: `-${particle.delay}s`,
              }}
            />
          ))}
      </div>

      {/* Keyframe animation for particles */}
      <style jsx global>{`
        @keyframes particleFloat {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
    </>
  );
}

export default ParticleBackground;
