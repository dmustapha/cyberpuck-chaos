'use client';

/**
 * Cyber Esports Home Page - Theme-aware
 */

import React from 'react';
import Link from 'next/link';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';
import {
  HeroSection,
  ProfilePreview,
  LeaderboardTeaser,
  SeasonBanner,
} from '@/components/cyber/home';

export default function CyberHomePage() {
  const theme = useThemedStyles();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {/* Theme Switcher Link */}
        <div className="flex justify-center mb-8">
          <Link
            href="/theme-preview"
            className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.primary}`,
              fontFamily: theme.fonts.heading,
            }}
          >
            Customize Theme
          </Link>
        </div>

        {/* Season Banner */}
        <SeasonBanner className="mb-8" />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Preview */}
          <ProfilePreview />

          {/* Leaderboard Teaser */}
          <LeaderboardTeaser />
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2
            className="text-2xl font-bold text-center mb-8 uppercase tracking-wider"
            style={{
              color: theme.colors.text.primary,
              fontFamily: theme.fonts.heading,
            }}
          >
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div
                key={i}
                className="p-6 rounded-lg text-center"
                style={{
                  backgroundColor: theme.colors.bg.panel,
                  border: `1px solid ${theme.colors.border.default}`,
                }}
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
