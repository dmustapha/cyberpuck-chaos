'use client';

/**
 * TopNavBar - Theme-aware navigation bar with OneChain wallet connection
 */

import React, { useState } from 'react';
import { ConnectButton } from '@onelabs/dapp-kit';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';
import { usePlayerStore } from '@/stores/playerStore';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { RankBadge } from '../ui/RankBadge';

interface TopNavBarProps {
  className?: string;
}

export function TopNavBar({ className = '' }: TopNavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profile = usePlayerStore((state) => state.profile);
  const theme = useThemedStyles();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 ${className}`}
      style={{
        backgroundColor: `${theme.colors.bg.primary}95`,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-6">
            <NavLinks />

            {/* OneChain wallet connection */}
            <ConnectButton connectText="Connect Wallet" />

            {profile && (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
                <div className="text-right">
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: theme.colors.text.primary,
                      fontFamily: theme.fonts.heading,
                    }}
                  >
                    {profile.username}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme.colors.text.muted }}
                  >
                    Lv. {profile.level.current}
                  </div>
                </div>
                <RankBadge rank={profile.rank} size="sm" showDivision={false} />
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: theme.colors.text.primary }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: theme.colors.border.subtle }}>
            <NavLinks direction="vertical" />
            <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.colors.border.subtle }}>
              <ConnectButton connectText="Connect Wallet" />
            </div>
            {profile && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t" style={{ borderColor: theme.colors.border.subtle }}>
                <RankBadge rank={profile.rank} size="sm" />
                <div>
                  <div className="text-sm font-bold" style={{ color: theme.colors.text.primary, fontFamily: theme.fonts.heading }}>
                    {profile.username}
                  </div>
                  <div className="text-xs" style={{ color: theme.colors.text.muted }}>
                    Level {profile.level.current}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default TopNavBar;
