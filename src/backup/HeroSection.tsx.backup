'use client';

/**
 * HeroSection - Animated hero with CTA for home page
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { CyberButton } from '../ui/CyberButton';
import { StatusBadge } from '../ui/StatusBadge';

// Particle configuration
interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const goToModeSelection = useGameStore((state) => state.goToModeSelection);

  // Generate particles only on client to avoid hydration mismatch
  const particles = useMemo<Particle[]>(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 8 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.2,
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePlayNow = () => {
    // Reset to mode selection and navigate to game page
    goToModeSelection();
    router.push('/game');
  };

  return (
    <>

      <section
        className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden ${className}`}
      >
      {/* Animated background particles - more mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {mounted && particles.map((particle) => (
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

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${cyberTheme.colors.primary}15 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Status badge */}
        <div className="flex justify-center mb-6">
          <StatusBadge status="live" pulse size="md" />
        </div>

        {/* Main heading */}
        <h1
          className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-wider"
          style={{
            fontFamily: cyberTheme.fonts.heading,
            color: cyberTheme.colors.text.primary,
            textShadow: `0 0 20px ${cyberTheme.colors.primary}60`,
          }}
        >
          CYBER{' '}
          <span style={{ color: cyberTheme.colors.primary }}>AIR HOCKEY</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          Compete in the ultimate futuristic air hockey experience. Climb the ranks,
          unlock achievements, and prove you&apos;re the best.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={handlePlayNow}
          >
            PLAY NOW
          </CyberButton>
          <Link href="/leaderboard">
            <CyberButton variant="secondary" size="lg">
              VIEW RANKINGS
            </CyberButton>
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="mt-12 flex items-center justify-center gap-8 md:gap-16"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          <div className="text-center">
            <div
              className="text-3xl font-bold"
              style={{
                color: cyberTheme.colors.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              25+
            </div>
            <div className="text-sm uppercase tracking-wider">Achievements</div>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold"
              style={{
                color: cyberTheme.colors.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              6
            </div>
            <div className="text-sm uppercase tracking-wider">Rank Tiers</div>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold"
              style={{
                color: cyberTheme.colors.primary,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              100
            </div>
            <div className="text-sm uppercase tracking-wider">Max Level</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to top, ${cyberTheme.colors.bg.primary}, transparent)`,
        }}
      />
    </section>
    </>
  );
}

export default HeroSection;
