'use client';

/**
 * EPIC Cinematic Landing Page
 * Combines Remotion intro with interactive Framer Motion content
 */

import { useState, useEffect, useMemo } from 'react';
import { Player } from '@remotion/player';
import { AnimatePresence, motion } from 'framer-motion';
import { CinematicIntro } from '@/components/landing/CinematicIntro';
import { HeroReveal } from '@/components/landing/HeroReveal';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ArenaPreview } from '@/components/landing/ArenaPreview';

const colors = {
  cyan: '#00f0ff',
  deepSpace: '#030308',
};

interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function LandingV2() {
  const [introComplete, setIntroComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);

    // Auto-complete intro after 4.3 seconds (120 frames @ 30fps + transition)
    const timer = setTimeout(() => {
      setIntroComplete(true);
    }, 4300);

    return () => clearTimeout(timer);
  }, []);

  // Mouse trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (introComplete) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [introComplete]);

  // Generate background particles
  const particles = useMemo<Particle[]>(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <>
      {/* Global styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Inter:wght@400;500;600;700&display=swap');

        body {
          margin: 0;
          overflow-x: hidden;
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, -10px);
          }
          50% {
            transform: translate(-5px, 5px);
          }
          75% {
            transform: translate(-10px, -5px);
          }
        }
      `}</style>

      <main
        className="relative min-h-screen overflow-hidden"
        style={{ backgroundColor: colors.deepSpace }}
      >
        {/* Remotion Intro */}
        <AnimatePresence>
          {!introComplete && (
            <motion.div
              className="fixed inset-0 z-50"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Player
                component={CinematicIntro}
                durationInFrames={120}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                controls={false}
                autoPlay
                loop={false}
                showVolumeControls={false}
                clickToPlay={false}
                doubleClickToFullscreen={false}
                spaceKeyToPlayOrPause={false}
                renderLoading={() => <div />}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content (shown after intro) */}
        <AnimatePresence>
          {introComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Background particles */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
                        backgroundColor: colors.cyan,
                        opacity: particle.opacity,
                        boxShadow: `0 0 ${particle.size * 2}px ${colors.cyan}`,
                        animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `-${particle.delay}s`,
                      }}
                    />
                  ))}
              </div>

              {/* Mouse cursor trail */}
              <motion.div
                className="fixed pointer-events-none z-50"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: `2px solid ${colors.cyan}`,
                  boxShadow: `0 0 20px ${colors.cyan}`,
                }}
                animate={{
                  x: mousePosition.x - 10,
                  y: mousePosition.y - 10,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 28,
                }}
              />

              {/* Particle trail following cursor */}
              {mounted && (
                <ParticleTrail
                  x={mousePosition.x}
                  y={mousePosition.y}
                  color={colors.cyan}
                />
              )}

              {/* Grid overlay */}
              <motion.div
                className="fixed inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(${colors.cyan}40 1px, transparent 1px),
                    linear-gradient(90deg, ${colors.cyan}40 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                }}
                animate={{
                  opacity: [0.05, 0.15, 0.05],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Sections */}
              <div className="relative z-10">
                <HeroReveal />
                <FeaturesSection />
                <ArenaPreview />

                {/* Footer */}
                <footer className="relative px-4 py-16 text-center">
                  <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <div
                      className="mb-6"
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: colors.cyan,
                        textShadow: `0 0 20px ${colors.cyan}`,
                      }}
                    >
                      READY TO DOMINATE?
                    </div>

                    <p
                      className="mb-8 text-lg"
                      style={{
                        color: '#9ca3af',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Join thousands of players in the ultimate cyber competition
                    </p>

                    <motion.div
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-full cursor-pointer"
                      style={{
                        backgroundColor: `${colors.cyan}10`,
                        border: `2px solid ${colors.cyan}`,
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: `0 0 30px ${colors.cyan}`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: colors.cyan,
                          boxShadow: `0 0 10px ${colors.cyan}`,
                        }}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [1, 0.6, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <span
                        className="text-sm font-medium tracking-wider uppercase"
                        style={{
                          fontFamily: 'Orbitron, sans-serif',
                          color: colors.cyan,
                        }}
                      >
                        SYSTEM STATUS: ONLINE
                      </span>
                    </motion.div>

                    <div
                      className="mt-12 text-sm opacity-50"
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        color: '#9ca3af',
                      }}
                    >
                      © 2026 CYBER AIR HOCKEY. ALL RIGHTS RESERVED.
                    </div>
                  </motion.div>
                </footer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

// Particle trail component
const ParticleTrail = ({
  x,
  y,
  color,
}: {
  x: number;
  y: number;
  color: string;
}) => {
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>(
    []
  );

  useEffect(() => {
    const id = Date.now();
    setTrail((prev) => [...prev.slice(-8), { x, y, id }]);

    const timeout = setTimeout(() => {
      setTrail((prev) => prev.filter((p) => p.id !== id));
    }, 500);

    return () => clearTimeout(timeout);
  }, [x, y]);

  return (
    <>
      {trail.map((point, i) => (
        <motion.div
          key={point.id}
          className="fixed pointer-events-none"
          style={{
            left: point.x,
            top: point.y,
            width: 8 - i * 0.8,
            height: 8 - i * 0.8,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </>
  );
};
