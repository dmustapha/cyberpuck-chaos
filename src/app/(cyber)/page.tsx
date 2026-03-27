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
          viewport={{ once: true, amount: 0.1 }}
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
          viewport={{ once: true, amount: 0.1 }}
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
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            Features
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {/* Feature cards */}
            {[
              {
                title: 'Ranked Matches',
                description:
                  'Compete in ranked matches to climb the ELO ladder and prove your skills.',
                iconPath: 'M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7M4 22h16M10 22V2h4v20M6 22V10h12v12',
              },
              {
                title: 'Chaos Modifiers',
                description:
                  'AI-driven chaos modifiers shake up every match — speed boosts, giant paddles, invisible pucks.',
                iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8',
              },
              {
                title: 'On-Chain Proof',
                description:
                  'Every match is recorded on-chain. Your wins are permanent and verifiable.',
                iconPath: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
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
                <div className="flex justify-center mb-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.iconPath} />
                  </svg>
                </div>
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
