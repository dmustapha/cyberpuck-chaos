'use client';

/**
 * HeroReveal - Post-intro hero section with Framer Motion
 * Smooth animations and interactive elements
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CyberButton } from '@/components/cyber/ui/CyberButton';
import { cyberTheme } from '@/lib/cyber/theme';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const colors = {
  cyan: '#00f0ff',
  white: '#ffffff',
  amber: '#f59e0b',
  deepSpace: '#030308',
};

export const HeroReveal = () => {
  const [statsValues, setStatsValues] = useState({
    matches: 0,
    players: 0,
    ranks: 0,
  });

  // Animate counters
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      matches: 10000,
      players: 500,
      ranks: 6,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setStatsValues({
        matches: Math.floor(targets.matches * progress),
        players: Math.floor(targets.players * progress),
        ranks: Math.floor(targets.ranks * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setStatsValues(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center px-4 py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="max-w-7xl mx-auto text-center">
        {/* Title stays from intro */}
        <motion.h1
          className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 uppercase tracking-wider"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: colors.white,
            textShadow: `
              0 0 10px ${colors.cyan},
              0 0 20px ${colors.cyan},
              0 0 40px ${colors.cyan}
            `,
          }}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          CYBER
          <br />
          <span style={{ color: colors.cyan }}>AIR HOCKEY</span>
        </motion.h1>

        {/* Subtitle with typewriter effect */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <TypewriterText text="The ultimate futuristic competition" />
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Link href="/game">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CyberButton variant="primary" size="lg" glow>
                <span
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.1em',
                  }}
                >
                  ENTER THE ARENA
                </span>
              </CyberButton>
            </motion.div>
          </Link>

          <Link href="/designs">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CyberButton variant="secondary" size="lg">
                <span
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    letterSpacing: '0.1em',
                  }}
                >
                  WATCH GAMEPLAY
                </span>
              </CyberButton>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats Counter */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <StatCounter
            value={statsValues.matches.toLocaleString()}
            label="MATCHES"
            delay={0}
          />
          <StatCounter
            value={statsValues.players.toLocaleString()}
            label="PLAYERS"
            delay={0.1}
          />
          <StatCounter value={statsValues.ranks} label="RANKS" delay={0.2} />
        </motion.div>

        {/* 3D Puck (floating) */}
        <motion.div
          className="mt-20 relative mx-auto"
          style={{
            width: 200,
            height: 200,
            perspective: 1000,
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <FloatingPuck />
        </motion.div>
      </div>
    </motion.section>
  );
};

// Typewriter Text Component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div
      className="text-xl md:text-2xl"
      style={{
        fontFamily: 'Inter, sans-serif',
        color: cyberTheme.colors.text.secondary,
        minHeight: '2em',
      }}
    >
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        style={{ color: colors.cyan }}
      >
        |
      </motion.span>
    </div>
  );
};

// Stat Counter Component
const StatCounter = ({
  value,
  label,
  delay,
}: {
  value: string | number;
  label: string;
  delay: number;
}) => (
  <motion.div
    className="text-center"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.5 + delay, duration: 0.5, type: 'spring' }}
  >
    <motion.div
      className="text-5xl md:text-6xl font-black mb-2"
      style={{
        fontFamily: 'Orbitron, sans-serif',
        color: colors.cyan,
        textShadow: `0 0 20px ${colors.cyan}`,
      }}
      animate={{
        textShadow: [
          `0 0 20px ${colors.cyan}`,
          `0 0 30px ${colors.cyan}`,
          `0 0 20px ${colors.cyan}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {value}+
    </motion.div>
    <div
      className="text-sm uppercase tracking-widest"
      style={{
        color: cyberTheme.colors.text.secondary,
        fontFamily: 'Orbitron, sans-serif',
      }}
    >
      {label}
    </div>
  </motion.div>
);

// Floating Puck Component with GSAP for organic motion
const FloatingPuck = () => {
  const puckRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!puckRef.current) return;

    // Complex 3D rotation with GSAP
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(puckRef.current, {
      rotateY: 360,
      rotateZ: 360,
      duration: 12,
      ease: 'none',
    });

    // Pulsing glow effect
    gsap.to(puckRef.current, {
      filter: 'brightness(1.3) drop-shadow(0 0 30px #00f0ff)',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Animate rings with staggered organic motion
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return;

      gsap.to(ring, {
        rotateX: 120,
        rotateZ: 360,
        duration: 4 + i * 1.5,
        repeat: -1,
        ease: 'none',
      });

      gsap.to(ring, {
        opacity: 0.6,
        duration: 1.5 + i * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(puckRef.current);
      ringsRef.current.forEach((ring) => {
        if (ring) gsap.killTweensOf(ring);
      });
    };
  }, []);

  return (
    <motion.div
      ref={puckRef}
      className="relative w-full h-full"
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main puck with enhanced glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle at 30% 30%, ${colors.white}, ${colors.cyan} 70%, #0088cc)`,
          boxShadow: `
            0 0 40px ${colors.cyan},
            0 0 80px ${colors.cyan},
            0 0 120px ${colors.cyan}40,
            inset 0 0 30px rgba(255, 255, 255, 0.5),
            inset -10px -10px 30px rgba(0, 0, 0, 0.3)
          `,
        }}
      />

      {/* Energy core pulse */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 80,
          height: 80,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: colors.white,
          filter: `blur(20px)`,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orbiting rings with GSAP */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            ringsRef.current[i] = el;
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 140 + i * 20,
            height: 140 + i * 20,
            borderRadius: '50%',
            border: `2px solid ${colors.cyan}`,
            opacity: 0.3,
            transform: 'translate(-50%, -50%)',
            transformStyle: 'preserve-3d',
            boxShadow: `0 0 10px ${colors.cyan}40`,
          }}
        />
      ))}

      {/* Particle orbiters */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.cyan,
            boxShadow: `0 0 10px ${colors.cyan}`,
          }}
          animate={{
            x: [0, 100 * Math.cos((i * Math.PI) / 2), 0],
            y: [0, 100 * Math.sin((i * Math.PI) / 2), 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
};
