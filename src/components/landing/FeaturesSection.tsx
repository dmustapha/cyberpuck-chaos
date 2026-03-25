'use client';

/**
 * FeaturesSection - Scroll-triggered feature cards
 * Cards fly in from different angles with glowing borders
 */

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

const colors = {
  cyan: '#00f0ff',
  amber: '#f59e0b',
  deepSpace: '#030308',
};

interface Feature {
  title: string;
  subtitle: string;
  description: string;
  stats: string[];
  icon: string;
  direction: 'left' | 'right' | 'top';
}

const features: Feature[] = [
  {
    title: 'RANKED BATTLES',
    subtitle: 'COMPETITIVE ARENA',
    description:
      'Climb the ranks from Bronze to Master. Every match counts. Every victory matters. Prove your skills against the best.',
    stats: ['ELO TRACKING', 'TIER SYSTEM', 'LIVE RANKINGS'],
    icon: '⚔️',
    direction: 'left',
  },
  {
    title: 'ACHIEVEMENT HUNTER',
    subtitle: 'UNLOCK GLORY',
    description:
      '25+ achievements waiting to be claimed. Rare badges, special effects, and legendary titles for the most dedicated players.',
    stats: ['CHALLENGES', 'RARE UNLOCKS', 'PROGRESSION'],
    icon: '🏆',
    direction: 'top',
  },
  {
    title: 'PERFORMANCE ANALYTICS',
    subtitle: 'DATA INSIGHTS',
    description:
      'Deep dive into your stats. Track accuracy, reaction time, and strategic patterns. AI-powered insights to elevate your game.',
    stats: ['REAL-TIME STATS', 'MATCH HISTORY', 'AI ANALYSIS'],
    icon: '📊',
    direction: 'right',
  },
];

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative px-4 py-32">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-center mb-20 uppercase"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: colors.cyan,
            textShadow: `0 0 20px ${colors.cyan}`,
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          DOMINATE THE ARENA
        </motion.h2>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              feature={feature}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  feature,
  index,
  isInView,
}: {
  feature: Feature;
  index: number;
  isInView: boolean;
}) => {
  const ref = useRef(null);
  const cardInView = useInView(ref, { once: true });
  const [isHovered, setIsHovered] = useState(false);

  // Direction-based initial position
  const getInitialPosition = () => {
    switch (feature.direction) {
      case 'left':
        return { x: -100, y: 0, rotate: -15 };
      case 'right':
        return { x: 100, y: 0, rotate: 15 };
      case 'top':
        return { x: 0, y: -100, rotate: 0 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className="group relative p-8 rounded-lg overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(0, 255, 255, 0.02) 100%)',
        border: `1px solid ${colors.cyan}40`,
      }}
      initial={{
        ...getInitialPosition(),
        opacity: 0,
      }}
      animate={
        isInView && cardInView
          ? {
              x: 0,
              y: 0,
              rotate: 0,
              opacity: 1,
            }
          : {}
      }
      transition={{
        delay: index * 0.2,
        duration: 0.8,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.03,
        y: -10,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Glowing border on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          border: `2px solid ${colors.cyan}`,
          opacity: 0,
        }}
        whileHover={{
          opacity: 1,
          boxShadow: `0 0 20px ${colors.cyan}, inset 0 0 20px ${colors.cyan}20`,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent, ${colors.cyan}20, transparent)`,
          height: '100%',
        }}
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          delay: index * 0.5,
        }}
      />

      {/* Data stream effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute right-4 top-0 bottom-0 flex flex-col justify-center gap-1 pointer-events-none opacity-30"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.3, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: Math.random() * 40 + 20,
                backgroundColor: i % 3 === 0 ? colors.amber : colors.cyan,
                boxShadow: `0 0 5px ${i % 3 === 0 ? colors.amber : colors.cyan}`,
              }}
              animate={{
                width: [
                  Math.random() * 40 + 20,
                  Math.random() * 60 + 10,
                  Math.random() * 40 + 20,
                ],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Corner brackets */}
      <CornerBrackets />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          className="text-6xl mb-4"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          {feature.icon}
        </motion.div>

        {/* Subtitle */}
        <div
          className="text-xs uppercase tracking-widest mb-2 opacity-60"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: colors.amber,
          }}
        >
          {feature.subtitle}
        </div>

        {/* Title */}
        <h3
          className="text-2xl font-bold mb-4 uppercase"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: colors.cyan,
          }}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p
          className="mb-6 leading-relaxed"
          style={{ color: cyberTheme.colors.text.secondary }}
        >
          {feature.description}
        </p>

        {/* Stats */}
        <div className="space-y-2">
          {feature.stats.map((stat, j) => (
            <motion.div
              key={j}
              className="flex items-center gap-2"
              initial={{ x: -20, opacity: 0 }}
              animate={cardInView ? { x: 0, opacity: 1 } : {}}
              transition={{ delay: 0.5 + j * 0.1 }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: colors.cyan,
                  boxShadow: `0 0 5px ${colors.cyan}`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: j * 0.2,
                }}
              />
              <span
                className="text-sm"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: cyberTheme.colors.text.secondary,
                }}
              >
                {stat}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CornerBrackets = () => {
  const bracketStyle = {
    position: 'absolute' as const,
    width: 20,
    height: 20,
    border: `2px solid ${colors.cyan}`,
  };

  return (
    <>
      <div
        style={{
          ...bracketStyle,
          top: -1,
          left: -1,
          borderRight: 'none',
          borderBottom: 'none',
        }}
      />
      <div
        style={{
          ...bracketStyle,
          top: -1,
          right: -1,
          borderLeft: 'none',
          borderBottom: 'none',
        }}
      />
      <div
        style={{
          ...bracketStyle,
          bottom: -1,
          left: -1,
          borderRight: 'none',
          borderTop: 'none',
        }}
      />
      <div
        style={{
          ...bracketStyle,
          bottom: -1,
          right: -1,
          borderLeft: 'none',
          borderTop: 'none',
        }}
      />
    </>
  );
};
