'use client';

import { PaddleCursor } from '@/components/landing/PaddleCursor';
import { ReactiveElement } from '@/components/landing/ReactiveElement';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LandingV7() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#050510] overflow-hidden relative">
      {/* Custom paddle cursor */}
      <PaddleCursor />

      {/* Cyber grid background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: 'center center'
          }}
        />
      </div>

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%,
              rgba(34, 211, 238, 0.1) 0%,
              transparent 50%),
            radial-gradient(circle at 80% 20%,
              rgba(147, 51, 234, 0.08) 0%,
              transparent 40%)
          `
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <ReactiveElement intensity="high" type="shake">
            <h1
              className="text-7xl md:text-9xl font-bold tracking-wider mb-4"
              style={{
                fontFamily: 'var(--font-orbitron)',
                background: 'linear-gradient(135deg, #22D3EE 0%, #A78BFA 50%, #F472B6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px rgba(34, 211, 238, 0.5)',
                filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))'
              }}
            >
              CYBER
            </h1>
          </ReactiveElement>

          <ReactiveElement intensity="high" type="shake">
            <h2
              className="text-5xl md:text-7xl font-bold tracking-widest"
              style={{
                fontFamily: 'var(--font-orbitron)',
                color: '#22D3EE',
                textShadow: `
                  0 0 10px rgba(34, 211, 238, 0.8),
                  0 0 20px rgba(34, 211, 238, 0.5),
                  0 0 30px rgba(34, 211, 238, 0.3)
                `
              }}
            >
              AIR HOCKEY
            </h2>
          </ReactiveElement>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <ReactiveElement intensity="medium" type="ripple">
            <p
              className="text-cyan-300/70 text-lg md:text-xl tracking-wide"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              Take control. Every element responds to your power.
            </p>
          </ReactiveElement>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <ReactiveElement intensity="high" type="bounce">
            <button
              className="group relative px-12 py-6 overflow-hidden"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              {/* Button background */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-90 transition-opacity group-hover:opacity-100"
                style={{
                  boxShadow: `
                    0 0 20px rgba(34, 211, 238, 0.6),
                    0 0 40px rgba(34, 211, 238, 0.3),
                    inset 0 0 20px rgba(255, 255, 255, 0.2)
                  `
                }}
              />

              {/* Animated border */}
              <div className="absolute inset-0 border-2 border-white/50" />

              {/* Shimmer effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  animation: 'shimmer 2s infinite'
                }}
              />

              {/* Button text */}
              <span className="relative text-white text-2xl font-bold tracking-widest uppercase flex items-center gap-3">
                Enter Arena
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </button>
          </ReactiveElement>
        </motion.div>

        {/* Reactive feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
        >
          {[
            { title: 'Feel The Impact', desc: 'Every interaction has weight' },
            { title: 'Physics-Based', desc: 'Real-time reactive elements' },
            { title: 'Arena Ready', desc: 'Built for competition' }
          ].map((feature, i) => (
            <ReactiveElement key={i} intensity="medium" type="bounce">
              <div
                className="p-6 border border-cyan-400/30 bg-cyan-400/5 backdrop-blur-sm"
                style={{
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.1)'
                }}
              >
                <h3
                  className="text-cyan-300 text-xl font-bold mb-2 tracking-wide"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-cyan-200/50 text-sm">{feature.desc}</p>
              </div>
            </ReactiveElement>
          ))}
        </motion.div>
      </div>

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)',
          height: '200px'
        }}
      />
    </main>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            boxShadow: `0 0 ${particle.size * 2}px rgba(34, 211, 238, 0.6)`
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}
