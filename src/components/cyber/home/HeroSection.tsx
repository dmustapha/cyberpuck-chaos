'use client';

/**
 * HeroSection - Hero with cinematic entry animations
 * Features: Glitch text reveal, staggered animations, line drawing effects
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, Variants } from 'framer-motion';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';

const TAGLINES = ['COMPETE', 'DOMINATE', 'WIN'];

interface HeroSectionProps {
  className?: string;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const titleVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const glitchVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -100,
    skewX: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const lineVariants: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const puckVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
      delay: 0.2,
    },
  },
};

const buttonVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
};

export function HeroSection({ className = '' }: HeroSectionProps) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [showGlitch, setShowGlitch] = useState(false);
  const router = useRouter();
  const controls = useAnimation();

  const goToModeSelection = useGameStore((state) => state.goToModeSelection);

  // Start animations on mount
  useEffect(() => {
    controls.start('visible');

    // Trigger glitch effect after initial animation
    const glitchTimeout = setTimeout(() => {
      setShowGlitch(true);
    }, 1200);

    return () => clearTimeout(glitchTimeout);
  }, [controls]);

  // Cycle through taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayNow = () => {
    goToModeSelection();
    router.push('/game');
  };

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Radial gradient overlay */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        style={{
          background: `radial-gradient(ellipse at center, ${cyberTheme.colors.primary}15 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Main heading with glitch effect */}
        <motion.div className="relative mb-12" variants={titleVariants}>
          <h1
            className="text-5xl md:text-7xl font-black uppercase tracking-wider"
            style={{
              fontFamily: cyberTheme.fonts.heading,
              color: cyberTheme.colors.text.primary,
              textShadow: `0 0 20px ${cyberTheme.colors.primary}60`,
            }}
          >
            {/* CYBER text with slide-in */}
            <motion.span
              className="inline-block"
              variants={glitchVariants}
            >
              CYBER
            </motion.span>{' '}

            {/* AIR HOCKEY with color accent */}
            <motion.span
              className="inline-block relative"
              style={{ color: cyberTheme.colors.primary }}
              variants={glitchVariants}
            >
              AIR HOCKEY

              {/* Glitch layers */}
              {showGlitch && (
                <>
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      color: '#ff0040',
                      clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                    }}
                    animate={{
                      x: [0, -3, 3, -1, 1, 0],
                      opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    AIR HOCKEY
                  </motion.span>
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      color: '#00ffff',
                      clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
                    }}
                    animate={{
                      x: [0, 3, -3, 1, -1, 0],
                      opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      repeatDelay: 3,
                      delay: 0.05,
                    }}
                  >
                    AIR HOCKEY
                  </motion.span>
                </>
              )}
            </motion.span>
          </h1>
        </motion.div>

        {/* Animated puck divider */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-10"
          variants={titleVariants}
        >
          {/* Left line - draws from center */}
          <motion.div
            className="h-[2px] w-20 md:w-32 origin-right"
            style={{
              background: `linear-gradient(to right, transparent, ${cyberTheme.colors.primary})`,
            }}
            variants={lineVariants}
          />

          {/* Puck with pulse - Gaming enhanced */}
          <motion.div
            className="relative"
            variants={puckVariants}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: cyberTheme.colors.text.primary,
                boxShadow: `0 0 16px ${cyberTheme.colors.primary}, 0 0 32px ${cyberTheme.colors.primary}60`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                boxShadow: [
                  `0 0 16px ${cyberTheme.colors.primary}, 0 0 32px ${cyberTheme.colors.primary}60`,
                  `0 0 28px ${cyberTheme.colors.primary}, 0 0 56px ${cyberTheme.colors.primary}90`,
                  `0 0 16px ${cyberTheme.colors.primary}, 0 0 32px ${cyberTheme.colors.primary}60`,
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Ripple effect - more vibrant */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${cyberTheme.colors.primary}`,
              }}
              animate={{
                scale: [1, 3.5],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </motion.div>

          {/* Right line - draws from center */}
          <motion.div
            className="h-[2px] w-20 md:w-32 origin-left"
            style={{
              background: `linear-gradient(to left, transparent, ${cyberTheme.colors.primary})`,
            }}
            variants={lineVariants}
          />
        </motion.div>

        {/* Cycling tagline with typewriter effect */}
        <motion.div
          className="h-8 mb-16 overflow-hidden"
          variants={titleVariants}
        >
          <motion.p
            key={taglineIndex}
            className="text-lg md:text-xl font-bold uppercase tracking-[0.3em]"
            style={{
              color: cyberTheme.colors.text.muted,
              fontFamily: cyberTheme.fonts.heading,
            }}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.5 }}
          >
            {TAGLINES[taglineIndex]}
          </motion.p>
        </motion.div>

        {/* Centered CTA button with dramatic entrance */}
        <motion.div
          className="flex justify-center"
          variants={buttonVariants}
        >
          <motion.button
            onClick={handlePlayNow}
            className="relative group overflow-hidden"
            style={{
              fontFamily: cyberTheme.fonts.heading,
              padding: '18px 48px',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#ffffff',
              background: `linear-gradient(135deg, ${cyberTheme.colors.primary} 0%, #3B82F6 50%, ${cyberTheme.colors.primary} 100%)`,
              backgroundSize: '200% 200%',
              border: `2px solid ${cyberTheme.colors.primary}`,
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: `
                0 0 20px ${cyberTheme.colors.primary}60,
                0 4px 15px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
            whileHover={{
              scale: 1.05,
              backgroundPosition: '100% 100%',
              boxShadow: `
                0 0 30px ${cyberTheme.colors.primary}80,
                0 6px 20px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated gradient shine */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Button text */}
            <span className="relative z-10">PLAY NOW</span>

            {/* Corner accents */}
            <div
              className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2"
              style={{ borderColor: 'rgba(255,255,255,0.5)' }}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2"
              style={{ borderColor: 'rgba(255,255,255,0.5)' }}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2"
              style={{ borderColor: 'rgba(255,255,255,0.5)' }}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2"
              style={{ borderColor: 'rgba(255,255,255,0.5)' }}
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to top, ${cyberTheme.colors.bg.primary}, transparent)`,
        }}
      />
    </section>
  );
}

export default HeroSection;
