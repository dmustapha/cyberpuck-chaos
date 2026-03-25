'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ParticleGame } from '@/components/landing/ParticleGame';

export default function ParticleGenesisLanding() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Update scroll progress
  useEffect(() => {
    return smoothProgress.on('change', (latest) => {
      setScrollProgress(latest);
    });
  }, [smoothProgress]);

  // Get stage info
  const getStageInfo = () => {
    if (scrollProgress < 0.2) {
      return { number: 1, label: 'ARENA FORMS' };
    } else if (scrollProgress < 0.4) {
      return { number: 2, label: 'PADDLES APPEAR' };
    } else if (scrollProgress < 0.6) {
      return { number: 3, label: 'PUCK APPEARS' };
    } else if (scrollProgress < 0.8) {
      return { number: 4, label: 'GAME SEQUENCE' };
    } else {
      return { number: 5, label: 'GENESIS' };
    }
  };

  const stage = getStageInfo();

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#050510]"
      style={{ height: '500vh' }}
    >
      {/* Fixed particle canvas */}
      <div className="fixed inset-0 z-0">
        <ParticleGame scrollProgress={scrollProgress} />
      </div>

      {/* Scroll stages content */}
      <div className="relative z-10 pointer-events-none">
        {/* Stage 1: Arena Forms (0-20%) */}
        <section className="h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: scrollProgress < 0.2 ? 1 : 0,
            }}
            className="text-center"
          >
            <motion.h2
              className="text-5xl font-bold text-cyan-400 tracking-widest mb-4"
              style={{
                textShadow: '0 0 30px rgba(0, 240, 255, 0.6)',
              }}
            >
              THE ARENA
            </motion.h2>
            <motion.p className="text-lg text-cyan-300/60 tracking-wide">
              Watch particles converge into your battlefield
            </motion.p>
          </motion.div>
        </section>

        {/* Stage 2: Paddles Appear (20-40%) */}
        <section className="h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: scrollProgress >= 0.2 && scrollProgress < 0.4 ? 1 : 0,
            }}
            className="text-center"
          >
            <motion.h2
              className="text-5xl font-bold text-white tracking-widest mb-4"
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.4)',
              }}
            >
              YOUR TOOLS
            </motion.h2>
            <motion.div className="flex items-center justify-center gap-12 mt-8">
              <div className="text-center">
                <div
                  className="text-4xl font-bold text-green-500 mb-2"
                  style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8)' }}
                >
                  PLAYER
                </div>
                <div className="text-sm text-green-400/60">You</div>
              </div>
              <div className="text-cyan-400/30 text-4xl">VS</div>
              <div className="text-center">
                <div
                  className="text-4xl font-bold text-red-500 mb-2"
                  style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }}
                >
                  OPPONENT
                </div>
                <div className="text-sm text-red-400/60">AI / Player</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stage 3: Puck Appears (40-60%) */}
        <section className="h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: scrollProgress >= 0.4 && scrollProgress < 0.6 ? 1 : 0,
            }}
            className="text-center"
          >
            <motion.h2
              className="text-5xl font-bold text-white tracking-widest mb-4"
              style={{
                textShadow: '0 0 30px rgba(255, 255, 255, 0.6)',
              }}
            >
              THE PUCK
            </motion.h2>
            <motion.p className="text-lg text-white/60 tracking-wide max-w-md">
              A quantum object in perpetual motion. Every collision calculated on-chain.
            </motion.p>
          </motion.div>
        </section>

        {/* Stage 4: Game Plays (60-80%) */}
        <section className="h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: scrollProgress >= 0.6 && scrollProgress < 0.8 ? 1 : 0,
            }}
            className="text-center"
          >
            <motion.h2
              className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-red-400 tracking-widest mb-6"
              style={{
                textShadow: '0 0 40px rgba(0, 240, 255, 0.5)',
              }}
            >
              WATCH THE MAGIC
            </motion.h2>
            <motion.p className="text-xl text-cyan-300/70 tracking-wide">
              Lightning-fast physics. Real-time gameplay. Pure adrenaline.
            </motion.p>
          </motion.div>
        </section>

        {/* Stage 5: Title Reveal (80-100%) */}
        <section className="h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: scrollProgress >= 0.8 ? 1 : 0,
              scale: scrollProgress >= 0.8 ? 1 : 0.9,
            }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.h1
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: scrollProgress >= 0.8 ? 1 : 0,
                y: scrollProgress >= 0.8 ? 0 : 20,
              }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="text-7xl md:text-8xl font-black text-white tracking-wider mb-2"
                style={{
                  fontFamily: 'Orbitron, Arial, sans-serif',
                  textShadow: '0 0 40px rgba(255, 255, 255, 0.5)',
                }}
              >
                CYBER
              </div>
              <div
                className="text-7xl md:text-8xl font-black text-cyan-400 tracking-wider"
                style={{
                  fontFamily: 'Orbitron, Arial, sans-serif',
                  textShadow: '0 0 60px rgba(0, 240, 255, 0.8)',
                }}
              >
                AIR HOCKEY
              </div>
            </motion.h1>

            <motion.button
              className="pointer-events-auto group relative px-16 py-6 text-2xl font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(0,240,255,0.8)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: scrollProgress >= 0.8 ? 1 : 0,
                y: scrollProgress >= 0.8 ? 0 : 20,
              }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 tracking-wider">ENTER ARENA</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </section>
      </div>

      {/* Stage indicator */}
      <motion.div
        className="fixed bottom-8 right-8 z-20 text-right pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress < 0.95 ? 1 : 0 }}
      >
        <div className="text-cyan-400/50 text-xs tracking-widest mb-2">
          STAGE {stage.number}/5
        </div>
        <div className="text-white/30 text-xs font-mono">{stage.label}</div>
        <div className="mt-4 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
            style={{
              scaleX: scrollProgress,
              transformOrigin: 'left',
            }}
          />
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        initial={{ opacity: 1, y: 0 }}
        animate={{
          opacity: scrollProgress > 0.1 ? 0 : 1,
          y: scrollProgress > 0.1 ? 20 : 0,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-cyan-400/50 text-xs tracking-widest">SCROLL TO BEGIN</div>
          <motion.div
            className="w-6 h-10 border-2 border-cyan-400/30 rounded-full p-1.5"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 bg-cyan-400/50 rounded-full mx-auto" />
          </motion.div>
        </div>
      </motion.div>

      {/* Background ambient particles at 100% */}
      {scrollProgress >= 0.95 && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
