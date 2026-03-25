'use client';

/**
 * Cyber Esports Profile Page
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { usePlayerStore } from '@/stores/playerStore';
import {
  ProfileHeader,
  RankCard,
  StatsGrid,
  MatchHistoryList,
  AchievementsSection,
} from '@/components/cyber/profile';
import { CyberButton } from '@/components/cyber/ui';
import Link from 'next/link';

export default function CyberProfilePage() {
  const profile = usePlayerStore((state) => state.profile);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="text-center p-8 rounded-lg"
          style={{
            backgroundColor: cyberTheme.colors.bg.panel,
            border: `1px solid ${cyberTheme.colors.border.default}`,
          }}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            No Profile Found
          </h2>
          <p
            className="mb-6"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Start playing to create your profile!
          </p>
          <Link href="/game">
            <CyberButton variant="primary" glow>
              Play Now
            </CyberButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile header */}
        <ProfileHeader className="mb-8" />

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Rank card */}
          <RankCard />

          {/* Stats grid */}
          <div className="lg:col-span-2">
            <StatsGrid />
          </div>
        </div>

        {/* Match history */}
        <MatchHistoryList className="mb-8" />

        {/* Achievements */}
        <AchievementsSection />
      </div>
    </div>
  );
}
