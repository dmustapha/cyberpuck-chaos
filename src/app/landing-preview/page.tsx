'use client';

/**
 * Holographic Command Center Landing Page
 * Military-tech meets sci-fi hologram interface
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { cyberTheme } from '@/lib/cyber/theme';
import { CyberButton } from '@/components/cyber/ui/CyberButton';

// Holographic theme extension
const holoTheme = {
  colors: {
    cyan: '#00f0ff',
    teal: '#0ff',
    amber: '#f59e0b',
    deepSpace: '#050510',
  },
};

// Particle interface (keeping from original HeroSection)
interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
}

// Radar blip interface
interface RadarBlip {
  id: number;
  angle: number;
  distance: number;
  delay: number;
}

export default function HolographicLanding() {
  const [mounted, setMounted] = useState(false);

  // Generate background particles (from original HeroSection)
  const particles = useMemo<Particle[]>(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  // Generate radar blips
  const radarBlips = useMemo<RadarBlip[]>(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      distance: Math.random() * 40 + 20,
      delay: Math.random() * 6,
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, -10px); }
          50% { transform: translate(-5px, 5px); }
          75% { transform: translate(-10px, -5px); }
        }

        @keyframes radarSweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes radarPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes blipFade {
          0%, 80% { opacity: 0; }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes puckSpin {
          0% { transform: rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateY(360deg) rotateZ(360deg); }
        }

        @keyframes ringOrbit {
          0% { transform: rotateX(60deg) rotateZ(0deg); }
          100% { transform: rotateX(60deg) rotateZ(360deg); }
        }

        @keyframes glitchText {
          0%, 90%, 100% { transform: translate(0); opacity: 1; }
          92% { transform: translate(-2px, 2px); opacity: 0.8; }
          94% { transform: translate(2px, -2px); opacity: 0.8; }
          96% { transform: translate(-2px, -2px); opacity: 0.8; }
        }

        @keyframes dataFlow {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        @keyframes holoPanelFloat {
          0%, 100% { transform: perspective(1000px) rotateX(0deg) translateY(0); }
          50% { transform: perspective(1000px) rotateX(2deg) translateY(-5px); }
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }

        .holo-panel {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(0, 255, 255, 0.02) 100%);
          border: 1px solid rgba(0, 240, 255, 0.3);
          box-shadow:
            0 0 20px rgba(0, 240, 255, 0.2),
            inset 0 0 20px rgba(0, 240, 255, 0.05);
          position: relative;
          overflow: hidden;
          animation: holoPanelFloat 6s ease-in-out infinite;
        }

        .holo-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${holoTheme.colors.cyan}, transparent);
          animation: scanLine 4s linear infinite;
        }

        .holo-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 240, 255, 0.03) 2px,
            rgba(0, 240, 255, 0.03) 4px
          );
          pointer-events: none;
        }

        .corner-bracket {
          position: absolute;
          width: 20px;
          height: 20px;
          border: 2px solid ${holoTheme.colors.cyan};
        }

        .corner-bracket.top-left {
          top: -1px;
          left: -1px;
          border-right: none;
          border-bottom: none;
        }

        .corner-bracket.top-right {
          top: -1px;
          right: -1px;
          border-left: none;
          border-bottom: none;
        }

        .corner-bracket.bottom-left {
          bottom: -1px;
          left: -1px;
          border-right: none;
          border-top: none;
        }

        .corner-bracket.bottom-right {
          bottom: -1px;
          right: -1px;
          border-left: none;
          border-top: none;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <main className="relative min-h-screen overflow-hidden" style={{ backgroundColor: holoTheme.colors.deepSpace }}>
        {/* Background particles (original effect) */}
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
                backgroundColor: holoTheme.colors.cyan,
                opacity: particle.opacity,
                boxShadow: `0 0 ${particle.size * 2}px ${holoTheme.colors.cyan}`,
                animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
                animationDelay: `-${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(${holoTheme.colors.cyan}40 1px, transparent 1px),
              linear-gradient(90deg, ${holoTheme.colors.cyan}40 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridPulse 4s ease-in-out infinite',
          }}
        />

        {/* Radar background */}
        <div className="absolute top-20 right-10 w-96 h-96 opacity-20">
          <div className="relative w-full h-full">
            {/* Radar rings */}
            {[1, 2, 3, 4].map((ring) => (
              <div
                key={ring}
                className="absolute top-1/2 left-1/2 rounded-full border"
                style={{
                  width: `${ring * 25}%`,
                  height: `${ring * 25}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: holoTheme.colors.cyan,
                  borderWidth: '1px',
                  animation: 'radarPulse 3s ease-in-out infinite',
                  animationDelay: `${ring * 0.2}s`,
                }}
              />
            ))}

            {/* Radar sweep */}
            <div
              className="absolute top-1/2 left-1/2 w-1/2 h-1 origin-left"
              style={{
                background: `linear-gradient(90deg, ${holoTheme.colors.cyan}, transparent)`,
                animation: 'radarSweep 4s linear infinite',
              }}
            />

            {/* Radar blips */}
            {mounted && radarBlips.map((blip) => (
              <div
                key={blip.id}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: holoTheme.colors.cyan,
                  boxShadow: `0 0 10px ${holoTheme.colors.cyan}`,
                  transform: `translate(-50%, -50%) rotate(${blip.angle}deg) translateX(${blip.distance}%)`,
                  animation: `blipFade 6s ease-in-out infinite`,
                  animationDelay: `${blip.delay}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl mx-auto text-center">
            {/* System Status */}
            <div className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: `1px solid ${holoTheme.colors.cyan}`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: holoTheme.colors.cyan,
                  boxShadow: `0 0 10px ${holoTheme.colors.cyan}`,
                  animation: 'statusBlink 2s ease-in-out infinite',
                }}
              />
              <span
                className="text-sm font-medium tracking-wider"
                style={{
                  fontFamily: cyberTheme.fonts.mono,
                  color: holoTheme.colors.cyan,
                }}
              >
                SYSTEM ONLINE
              </span>
            </div>

            {/* Main Title with Glitch Effect */}
            <h1
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 uppercase tracking-wider"
              style={{
                fontFamily: cyberTheme.fonts.heading,
                color: cyberTheme.colors.text.primary,
                textShadow: `
                  0 0 10px ${holoTheme.colors.cyan},
                  0 0 20px ${holoTheme.colors.cyan},
                  0 0 40px ${holoTheme.colors.cyan}
                `,
                animation: 'glitchText 8s ease-in-out infinite',
              }}
            >
              CYBER
              <br />
              <span style={{ color: holoTheme.colors.cyan }}>AIR HOCKEY</span>
            </h1>

            {/* 3D Holographic Puck */}
            <div className="relative w-64 h-64 mx-auto my-12" style={{ perspective: '1000px' }}>
              {/* Puck core */}
              <div
                className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full"
                style={{
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(circle, ${holoTheme.colors.cyan}, ${holoTheme.colors.teal})`,
                  boxShadow: `
                    0 0 30px ${holoTheme.colors.cyan},
                    0 0 60px ${holoTheme.colors.cyan},
                    inset 0 0 20px rgba(255, 255, 255, 0.5)
                  `,
                  animation: 'puckSpin 4s linear infinite',
                }}
              />

              {/* Orbiting rings */}
              {[0, 1, 2].map((ring) => (
                <div
                  key={ring}
                  className="absolute top-1/2 left-1/2 rounded-full"
                  style={{
                    width: `${140 + ring * 20}px`,
                    height: `${140 + ring * 20}px`,
                    transform: 'translate(-50%, -50%)',
                    border: `2px solid ${holoTheme.colors.cyan}`,
                    borderRadius: '50%',
                    opacity: 0.3,
                    animation: `ringOrbit ${4 + ring}s linear infinite`,
                    animationDelay: `${ring * 0.5}s`,
                  }}
                />
              ))}

              {/* Data points */}
              {[0, 90, 180, 270].map((angle, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: holoTheme.colors.amber,
                    boxShadow: `0 0 10px ${holoTheme.colors.amber}`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(100px)`,
                    animation: `blipFade 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link href="/game">
                <CyberButton variant="primary" size="lg" glow>
                  <span style={{ fontFamily: cyberTheme.fonts.heading, letterSpacing: '0.1em' }}>
                    INITIALIZE GAME
                  </span>
                </CyberButton>
              </Link>
              <Link href="/leaderboard">
                <CyberButton variant="secondary" size="lg">
                  <span style={{ fontFamily: cyberTheme.fonts.heading, letterSpacing: '0.1em' }}>
                    ACCESS RANKINGS
                  </span>
                </CyberButton>
              </Link>
            </div>

            {/* Stats as Holographic Readouts */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { value: '25+', label: 'ACHIEVEMENTS', unit: 'UNLOCKABLE' },
                { value: '6', label: 'RANK TIERS', unit: 'PROGRESSION' },
                { value: '100', label: 'MAX LEVEL', unit: 'ULTIMATE' },
              ].map((stat, i) => (
                <div key={i} className="text-center relative">
                  <div
                    className="text-5xl font-black mb-2"
                    style={{
                      fontFamily: cyberTheme.fonts.heading,
                      color: holoTheme.colors.cyan,
                      textShadow: `0 0 20px ${holoTheme.colors.cyan}`,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{
                      color: cyberTheme.colors.text.secondary,
                      fontFamily: cyberTheme.fonts.mono,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-xs opacity-50"
                    style={{
                      color: holoTheme.colors.amber,
                      fontFamily: cyberTheme.fonts.mono,
                    }}
                  >
                    [{stat.unit}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Command Panels Section */}
        <section className="relative z-10 px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-4xl md:text-5xl font-bold text-center mb-16 uppercase"
              style={{
                fontFamily: cyberTheme.fonts.heading,
                color: holoTheme.colors.cyan,
                textShadow: `0 0 20px ${holoTheme.colors.cyan}`,
              }}
            >
              TACTICAL OVERVIEW
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'RANKED PROTOCOL',
                  subtitle: 'COMPETITIVE MODE',
                  description: 'Engage in ranked matches to climb the leaderboard. Each victory brings you closer to Master tier.',
                  stats: ['ELO TRACKING', 'TIER ADVANCEMENT', 'SKILL MATCHING'],
                },
                {
                  title: 'ACHIEVEMENT MATRIX',
                  subtitle: 'UNLOCK SYSTEM',
                  description: 'Complete challenges to unlock exclusive rewards, badges, and special effects for your puck.',
                  stats: ['25+ CHALLENGES', 'RARE UNLOCKS', 'PROGRESSION TREE'],
                },
                {
                  title: 'TACTICAL ANALYSIS',
                  subtitle: 'PERFORMANCE METRICS',
                  description: 'Deep dive into your gameplay statistics. Track accuracy, response time, and strategic patterns.',
                  stats: ['REAL-TIME STATS', 'MATCH HISTORY', 'AI INSIGHTS'],
                },
              ].map((panel, i) => (
                <div
                  key={i}
                  className="holo-panel p-8 rounded-lg relative"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {/* Corner brackets */}
                  <div className="corner-bracket top-left" />
                  <div className="corner-bracket top-right" />
                  <div className="corner-bracket bottom-left" />
                  <div className="corner-bracket bottom-right" />

                  <div
                    className="text-xs uppercase tracking-widest mb-2 opacity-60"
                    style={{
                      fontFamily: cyberTheme.fonts.mono,
                      color: holoTheme.colors.amber,
                    }}
                  >
                    {panel.subtitle}
                  </div>

                  <h3
                    className="text-2xl font-bold mb-4 uppercase"
                    style={{
                      fontFamily: cyberTheme.fonts.heading,
                      color: holoTheme.colors.cyan,
                    }}
                  >
                    {panel.title}
                  </h3>

                  <p
                    className="mb-6 leading-relaxed"
                    style={{ color: cyberTheme.colors.text.secondary }}
                  >
                    {panel.description}
                  </p>

                  <div className="space-y-2">
                    {panel.stats.map((stat, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: holoTheme.colors.cyan,
                            boxShadow: `0 0 5px ${holoTheme.colors.cyan}`,
                          }}
                        />
                        <span
                          className="text-sm"
                          style={{
                            fontFamily: cyberTheme.fonts.mono,
                            color: cyberTheme.colors.text.secondary,
                          }}
                        >
                          {stat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Feed Section */}
        <section className="relative z-10 px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="holo-panel p-6 rounded-lg">
              <div className="corner-bracket top-left" />
              <div className="corner-bracket top-right" />

              <div
                className="text-sm uppercase tracking-widest mb-4"
                style={{
                  fontFamily: cyberTheme.fonts.mono,
                  color: holoTheme.colors.amber,
                }}
              >
                [LIVE ACTIVITY FEED]
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex gap-8 animate-marquee"
                  style={{
                    animation: 'marquee 30s linear infinite',
                  }}
                >
                  {[
                    'PLAYER_7842 ACHIEVED PLATINUM RANK',
                    'NEW RECORD: 127 WPM PUCK SPEED',
                    'PLAYER_3391 UNLOCKED "UNTOUCHABLE" BADGE',
                    'SEASON 4 STARTS IN 3 DAYS',
                    'TOP PLAYER: CYBER_MASTER WITH 2847 ELO',
                  ].map((msg, i) => (
                    <div
                      key={i}
                      className="whitespace-nowrap text-sm"
                      style={{
                        fontFamily: cyberTheme.fonts.mono,
                        color: holoTheme.colors.cyan,
                      }}
                    >
                      {msg}
                      <span className="mx-4" style={{ color: holoTheme.colors.amber }}>●</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Season Intel Section */}
        <section className="relative z-10 px-4 py-20 pb-32">
          <div className="max-w-4xl mx-auto">
            <div className="holo-panel p-10 rounded-lg text-center">
              <div className="corner-bracket top-left" />
              <div className="corner-bracket top-right" />
              <div className="corner-bracket bottom-left" />
              <div className="corner-bracket bottom-right" />

              <div
                className="text-xs uppercase tracking-widest mb-4 opacity-60"
                style={{
                  fontFamily: cyberTheme.fonts.mono,
                  color: holoTheme.colors.amber,
                }}
              >
                MISSION BRIEFING
              </div>

              <h2
                className="text-4xl font-bold mb-6 uppercase"
                style={{
                  fontFamily: cyberTheme.fonts.heading,
                  color: holoTheme.colors.cyan,
                  textShadow: `0 0 20px ${holoTheme.colors.cyan}`,
                }}
              >
                SEASON 4: NEON WARFARE
              </h2>

              <p
                className="mb-8 text-lg"
                style={{ color: cyberTheme.colors.text.secondary }}
              >
                Complete seasonal challenges to unlock exclusive holographic puck skins,
                victory animations, and the legendary &quot;Cyber Champion&quot; title.
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: cyberTheme.fonts.mono,
                      color: cyberTheme.colors.text.secondary,
                    }}
                  >
                    SEASON PROGRESS
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      fontFamily: cyberTheme.fonts.mono,
                      color: holoTheme.colors.cyan,
                    }}
                  >
                    67%
                  </span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    border: `1px solid ${holoTheme.colors.cyan}`,
                  }}
                >
                  <div
                    className="h-full relative"
                    style={{
                      width: '67%',
                      background: `linear-gradient(90deg, ${holoTheme.colors.teal}, ${holoTheme.colors.cyan})`,
                      boxShadow: `0 0 10px ${holoTheme.colors.cyan}`,
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                      }}
                    />
                  </div>
                </div>
              </div>

              <Link href="/game">
                <CyberButton variant="primary" size="lg" glow>
                  <span style={{ fontFamily: cyberTheme.fonts.heading, letterSpacing: '0.1em' }}>
                    BEGIN MISSION
                  </span>
                </CyberButton>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
