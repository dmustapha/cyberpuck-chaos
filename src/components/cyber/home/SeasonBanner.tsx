'use client';

/**
 * SeasonBanner - Current season info card
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { HUDPanel } from '../ui/HUDPanel';
import { ProgressBar } from '../ui/ProgressBar';

interface SeasonBannerProps {
  className?: string;
}

export function SeasonBanner({ className = '' }: SeasonBannerProps) {
  // Mock season data
  const seasonNumber = 1;
  const seasonName = 'Genesis';
  const daysRemaining = 45;
  const totalDays = 90;
  const progressPercent = ((totalDays - daysRemaining) / totalDays) * 100;

  return (
    <HUDPanel className={className} variant="glow" padding="lg">
      <div className="flex items-center gap-4">
        {/* Season icon */}
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl"
          style={{
            backgroundColor: `${cyberTheme.colors.primary}20`,
            border: `2px solid ${cyberTheme.colors.primary}`,
            boxShadow: `0 0 15px ${cyberTheme.colors.primary}40`,
          }}
        >
          ⚡
        </div>

        {/* Season info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Current Season
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold uppercase"
              style={{
                backgroundColor: `${cyberTheme.colors.primary}20`,
                color: cyberTheme.colors.primary,
              }}
            >
              LIVE
            </span>
          </div>

          <h3
            className="text-xl font-bold mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Season {seasonNumber}: {seasonName}
          </h3>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <ProgressBar
              value={progressPercent}
              height="xs"
              color={cyberTheme.colors.primary}
            />
            <span
              className="text-sm whitespace-nowrap"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              {daysRemaining} days left
            </span>
          </div>
        </div>
      </div>
    </HUDPanel>
  );
}

export default SeasonBanner;
