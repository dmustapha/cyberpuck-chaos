'use client';

/**
 * Cyber Esports Home Page - Theme-aware with scroll animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';
import {
  HeroSection,
  ArenaShowcase,
  ProfilePreview,
  LeaderboardTeaser,
  SeasonBanner,
  ParticleBackground,
} from '@/components/cyber/home';

// Animation variants for scroll-triggered content
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function CyberHomePage() {
  const theme = useThemedStyles();

  return (
    <div className="min-h-screen relative">
      {/* Global Particle Background */}
      <ParticleBackground particleCount={50} />

      {/* Hero Section */}
      <HeroSection />

      {/* Arena Showcase Section */}
      <ArenaShowcase />

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Season Banner - with scroll animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <SeasonBanner />
        </motion.div>

        {/* Two column layout - staggered animation */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={staggerContainer}
        >
          {/* Profile Preview */}
          <motion.div variants={staggerItem} transition={{ duration: 0.6 }}>
            <ProfilePreview />
          </motion.div>

          {/* Leaderboard Teaser */}
          <motion.div variants={staggerItem} transition={{ duration: 0.6 }}>
            <LeaderboardTeaser />
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="mt-16">
          <motion.h2
            className="text-2xl font-bold text-center mb-8 uppercase tracking-wider"
            style={{
              color: theme.colors.text.primary,
              fontFamily: theme.fonts.heading,
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.5 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            Features
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={staggerContainer}
          >
            {/* Feature cards */}
            {[
              {
                icon: '🏆',
                title: 'Ranked Matches',
                description:
                  'Compete in ranked matches to climb the ELO ladder and prove your skills.',
              },
              {
                icon: '🎖️',
                title: 'Achievements',
                description:
                  'Unlock 25+ achievements and earn exclusive titles to show off.',
              },
              {
                icon: '📊',
                title: 'Detailed Stats',
                description:
                  'Track your performance with comprehensive match history and statistics.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-lg text-center"
                style={{
                  backgroundColor: theme.colors.bg.panel,
                  border: `1px solid ${theme.colors.border.default}`,
                }}
                variants={staggerItem}
                transition={{ duration: 0.5 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: theme.fonts.heading,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
