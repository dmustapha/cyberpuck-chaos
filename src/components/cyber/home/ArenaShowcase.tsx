'use client';

/**
 * ArenaShowcase - "YOUR ARENA AWAITS" section with scroll-triggered animations
 * Displays the cyber arena table with staggered fly-in animations
 */

import { motion } from 'framer-motion';
import { cyberTheme } from '@/lib/cyber/theme';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const colors = {
  cyan: cyberTheme.colors.primary,
  white: '#ffffff',
  amber: '#f59e0b',
  deepSpace: cyberTheme.colors.bg.primary,
};

export function ArenaShowcase() {
  const arenaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!arenaRef.current) return;

    // Create a holographic shimmer effect using brightness pulsing
    gsap.to(arenaRef.current, {
      filter: 'brightness(1.2)',
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <section
      className="relative px-4 py-32"
      style={{ backgroundColor: cyberTheme.colors.bg.primary }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title - Flies in first */}
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-center mb-8 uppercase"
          style={{
            fontFamily: cyberTheme.fonts.heading,
            color: cyberTheme.colors.primary,
            textShadow: `0 0 20px ${cyberTheme.colors.primary}`,
          }}
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.8, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          YOUR ARENA AWAITS
        </motion.h2>

        {/* Subtitle - Flies in second */}
        <motion.p
          className="text-center mb-16 text-xl"
          style={{
            color: cyberTheme.colors.text.secondary,
            fontFamily: cyberTheme.fonts.body,
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.8, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Step into the cyber arena where legends are born
        </motion.p>

        {/* Arena Table - Flies in third */}
        <motion.div
          className="relative mx-auto"
          style={{
            maxWidth: 800,
            aspectRatio: '16/9',
            perspective: 1000,
          }}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.5, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            ref={arenaRef}
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.deepSpace} 0%, #0a0a15 100%)`,
              border: `2px solid ${cyberTheme.colors.primary}`,
              boxShadow: `
                0 0 40px ${cyberTheme.colors.primary}40,
                inset 0 0 60px ${cyberTheme.colors.primary}10
              `,
              transform: 'rotateX(30deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Holographic scan lines */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  ${cyberTheme.colors.primary}05 2px,
                  ${cyberTheme.colors.primary}05 4px
                )`,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '0% 100%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Animated Match - Paddles and Puck */}
            <AnimatedMatch />

            {/* Center line */}
            <div
              className="absolute top-0 bottom-0 left-1/2 w-0.5"
              style={{
                background: cyberTheme.colors.primary,
                boxShadow: `0 0 10px ${cyberTheme.colors.primary}`,
                transform: 'translateX(-50%)',
              }}
            />

            {/* Center circle */}
            <motion.div
              className="absolute top-1/2 left-1/2"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `2px solid ${cyberTheme.colors.primary}`,
                boxShadow: `0 0 20px ${cyberTheme.colors.primary}`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${cyberTheme.colors.primary}`,
                  `0 0 30px ${cyberTheme.colors.primary}`,
                  `0 0 20px ${cyberTheme.colors.primary}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Goal areas */}
            <div
              className="absolute top-1/2 left-4 w-16 h-32"
              style={{
                transform: 'translateY(-50%)',
                border: `2px solid ${colors.amber}`,
                borderLeft: 'none',
                boxShadow: `0 0 15px ${colors.amber}40`,
              }}
            />
            <div
              className="absolute top-1/2 right-4 w-16 h-32"
              style={{
                transform: 'translateY(-50%)',
                border: `2px solid ${colors.amber}`,
                borderRight: 'none',
                boxShadow: `0 0 15px ${colors.amber}40`,
              }}
            />

            {/* Corner markers */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(
              (position) => {
                const [vertical, horizontal] = position.split('-');
                return (
                  <div
                    key={position}
                    className="absolute w-8 h-8"
                    style={{
                      [vertical]: 8,
                      [horizontal]: 8,
                      border: `2px solid ${cyberTheme.colors.primary}`,
                      borderBottom:
                        vertical === 'top' ? 'none' : `2px solid ${cyberTheme.colors.primary}`,
                      borderTop:
                        vertical === 'bottom'
                          ? 'none'
                          : `2px solid ${cyberTheme.colors.primary}`,
                      borderRight:
                        horizontal === 'left'
                          ? 'none'
                          : `2px solid ${cyberTheme.colors.primary}`,
                      borderLeft:
                        horizontal === 'right'
                          ? 'none'
                          : `2px solid ${cyberTheme.colors.primary}`,
                      opacity: 0.6,
                    }}
                  />
                );
              }
            )}

            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(${cyberTheme.colors.primary}40 1px, transparent 1px),
                  linear-gradient(90deg, ${cyberTheme.colors.primary}40 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${cyberTheme.colors.primary}10, transparent 70%)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.8, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}10`,
              border: `1px solid ${cyberTheme.colors.primary}`,
            }}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: cyberTheme.colors.primary,
                boxShadow: `0 0 10px ${cyberTheme.colors.primary}`,
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
                fontFamily: cyberTheme.fonts.heading,
                color: cyberTheme.colors.primary,
              }}
            >
              ARENA STATUS: ACTIVE
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated Match Component - Paddles make contact with puck
const AnimatedMatch = () => {
  const puckRef = useRef<HTMLDivElement>(null);
  const leftPaddleRef = useRef<HTMLDivElement>(null);
  const rightPaddleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!puckRef.current || !leftPaddleRef.current || !rightPaddleRef.current) return;

    // Create the match timeline - paddles drive puck movement
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.8,
    });

    // All positions are in percentages - paddles are 36px, puck is 22px
    // Paddle radius ~18px, puck radius ~11px, so contact at ~29px offset in %

    tl
      // === INITIAL SETUP ===
      .set(puckRef.current, { left: '50%', top: '50%' })
      .set(leftPaddleRef.current, { left: '25%', top: '50%' })
      .set(rightPaddleRef.current, { left: '75%', top: '50%' })

      // === RALLY 1: Left paddle approaches and hits puck ===
      // Left paddle moves TO the puck position
      .to(leftPaddleRef.current, {
        left: '46%',  // Move close to puck at 50%
        top: '50%',
        duration: 0.3,
        ease: 'power2.in'
      }, 0.2)
      // Puck moves AFTER paddle contact
      .to(puckRef.current, {
        left: '72%',
        top: '35%',
        duration: 0.4,
        ease: 'power2.out'
      }, 0.5)
      // Left paddle follows through slightly then retreats
      .to(leftPaddleRef.current, {
        left: '48%',
        top: '48%',
        duration: 0.1,
        ease: 'power1.out'
      }, 0.5)
      .to(leftPaddleRef.current, {
        left: '30%',
        top: '45%',
        duration: 0.3,
        ease: 'power1.inOut'
      }, 0.7)

      // === RALLY 2: Right paddle intercepts ===
      // Right paddle moves to where puck will be
      .to(rightPaddleRef.current, {
        left: '68%',
        top: '35%',
        duration: 0.35,
        ease: 'power2.out'
      }, 0.6)
      // Puck bounces back after right paddle contact
      .to(puckRef.current, {
        left: '35%',
        top: '60%',
        duration: 0.45,
        ease: 'power2.out'
      }, 0.95)
      // Right paddle follow through
      .to(rightPaddleRef.current, {
        left: '70%',
        top: '40%',
        duration: 0.2,
        ease: 'power1.out'
      }, 1.0)

      // === RALLY 3: Left paddle defends and counters ===
      // Left paddle moves down to intercept
      .to(leftPaddleRef.current, {
        left: '31%',
        top: '60%',
        duration: 0.3,
        ease: 'power2.out'
      }, 1.1)
      // Puck bounces after contact
      .to(puckRef.current, {
        left: '65%',
        top: '45%',
        duration: 0.4,
        ease: 'power2.out'
      }, 1.45)
      // Left paddle follow through
      .to(leftPaddleRef.current, {
        left: '38%',
        top: '55%',
        duration: 0.15,
        ease: 'power1.out'
      }, 1.45)

      // === RALLY 4: Right paddle returns ===
      .to(rightPaddleRef.current, {
        left: '61%',
        top: '45%',
        duration: 0.25,
        ease: 'power2.out'
      }, 1.6)
      .to(puckRef.current, {
        left: '40%',
        top: '50%',
        duration: 0.4,
        ease: 'power2.out'
      }, 1.9)

      // === FINAL: Left paddle SCORES! ===
      // Left paddle winds up
      .to(leftPaddleRef.current, {
        left: '32%',
        top: '50%',
        duration: 0.2,
        ease: 'power1.in'
      }, 2.1)
      // Left paddle strikes hard
      .to(leftPaddleRef.current, {
        left: '38%',
        top: '50%',
        duration: 0.1,
        ease: 'power4.out'
      }, 2.35)
      // Puck rockets into goal!
      .to(puckRef.current, {
        left: '94%',
        top: '50%',
        duration: 0.35,
        ease: 'power2.in'
      }, 2.4)
      // Right paddle tries to save but too late
      .to(rightPaddleRef.current, {
        left: '82%',
        top: '50%',
        duration: 0.25,
        ease: 'power3.out'
      }, 2.5)

      // === RESET: Smooth transition back to start ===
      .to([leftPaddleRef.current, rightPaddleRef.current], {
        left: (i) => i === 0 ? '25%' : '75%',
        top: '50%',
        duration: 0.5,
        ease: 'power1.inOut'
      }, 3.0)
      .to(puckRef.current, {
        left: '50%',
        top: '50%',
        duration: 0.5,
        ease: 'power1.inOut'
      }, 3.0);

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* Left Paddle - Player (Cyan) */}
      <div
        ref={leftPaddleRef}
        className="absolute"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${colors.cyan}, ${colors.cyan}80)`,
          boxShadow: `
            0 0 15px ${colors.cyan},
            0 0 25px ${colors.cyan}80,
            inset 0 0 8px rgba(255,255,255,0.3)
          `,
          border: `2px solid ${colors.cyan}`,
          zIndex: 10,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Right Paddle - Opponent (Amber/Red) */}
      <div
        ref={rightPaddleRef}
        className="absolute"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, #ff6b6b, ${colors.amber})`,
          boxShadow: `
            0 0 15px ${colors.amber},
            0 0 25px ${colors.amber}80,
            inset 0 0 8px rgba(255,255,255,0.3)
          `,
          border: `2px solid ${colors.amber}`,
          zIndex: 10,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Puck */}
      <div
        ref={puckRef}
        className="absolute"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 40%, ${colors.white}, ${cyberTheme.colors.primary})`,
          boxShadow: `
            0 0 15px ${cyberTheme.colors.primary},
            0 0 30px ${cyberTheme.colors.primary}80
          `,
          zIndex: 11,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Puck glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${cyberTheme.colors.primary}60, transparent)`,
          }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </div>
    </>
  );
};

export default ArenaShowcase;
