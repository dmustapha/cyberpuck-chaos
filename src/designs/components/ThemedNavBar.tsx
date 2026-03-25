'use client';

/**
 * ThemedNavBar - Design-aware navigation bar
 * Uses DesignConfig for theming instead of global theme store
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useDesignStyles } from '../useDesignStyles';
import { useDesign } from '../DesignContext';
import { usePlayerStore } from '@/stores/playerStore';

interface ThemedNavBarProps {
  className?: string;
}

export function ThemedNavBar({ className = '' }: ThemedNavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profile = usePlayerStore((state) => state.profile);
  const styles = useDesignStyles();
  const { config } = useDesign();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 ${className}`}
      style={{
        backgroundColor: styles.colors.bg.nav,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${styles.colors.border.subtle}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/designs/${config.id}`}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${styles.colors.primary}, ${styles.colors.secondary})`,
                }}
              >
                <span className="text-white font-bold text-sm">AH</span>
              </div>
              <span
                className="text-lg font-bold uppercase tracking-wider hidden sm:block"
                style={{
                  fontFamily: styles.fonts.heading,
                  color: styles.colors.text.primary,
                  textShadow: styles.effects.glowIntensity > 15
                    ? `0 0 ${styles.effects.glowIntensity / 2}px ${styles.colors.primary}40`
                    : 'none',
                }}
              >
                {config.name}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href={`/designs/${config.id}`} styles={styles}>
              Home
            </NavLink>
            <NavLink href={`/designs/${config.id}/play`} styles={styles}>
              Play
            </NavLink>
            <NavLink href={`/designs/${config.id}/leaderboard`} styles={styles}>
              Leaderboard
            </NavLink>
            <NavLink href={`/designs/${config.id}/achievements`} styles={styles}>
              Achievements
            </NavLink>
          </nav>

          {/* Right side: Wallet + Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wallet Button */}
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: `${styles.colors.primary}20`,
                border: `1px solid ${styles.colors.primary}40`,
                color: styles.colors.primary,
              }}
            >
              Connect Wallet
            </button>

            {/* Profile mini */}
            {profile && (
              <div
                className="flex items-center gap-3 pl-4 border-l"
                style={{ borderColor: styles.colors.border.subtle }}
              >
                <div className="text-right">
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: styles.colors.text.primary,
                      fontFamily: styles.fonts.heading,
                    }}
                  >
                    {profile.username}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: styles.colors.text.muted }}
                  >
                    Lv. {profile.level.current}
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${styles.colors.primary}40, ${styles.colors.secondary}40)`,
                    border: `2px solid ${styles.colors.primary}`,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: styles.colors.primary }}
                  >
                    {profile.rank.tier[0]}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              color: styles.colors.text.primary,
              backgroundColor: isMobileMenuOpen ? `${styles.colors.primary}20` : 'transparent',
            }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden py-4 border-t"
            style={{ borderColor: styles.colors.border.subtle }}
          >
            <nav className="flex flex-col gap-2">
              <MobileNavLink href={`/designs/${config.id}`} styles={styles}>
                Home
              </MobileNavLink>
              <MobileNavLink href={`/designs/${config.id}/play`} styles={styles}>
                Play
              </MobileNavLink>
              <MobileNavLink href={`/designs/${config.id}/leaderboard`} styles={styles}>
                Leaderboard
              </MobileNavLink>
              <MobileNavLink href={`/designs/${config.id}/achievements`} styles={styles}>
                Achievements
              </MobileNavLink>
            </nav>

            {/* Wallet Button (mobile) */}
            <div
              className="mt-4 pt-4 border-t"
              style={{ borderColor: styles.colors.border.subtle }}
            >
              <button
                className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: `${styles.colors.primary}20`,
                  border: `1px solid ${styles.colors.primary}40`,
                  color: styles.colors.primary,
                }}
              >
                Connect Wallet
              </button>
            </div>

            {/* Profile mini (mobile) */}
            {profile && (
              <div
                className="flex items-center gap-3 mt-4 pt-4 border-t"
                style={{ borderColor: styles.colors.border.subtle }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${styles.colors.primary}40, ${styles.colors.secondary}40)`,
                    border: `2px solid ${styles.colors.primary}`,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: styles.colors.primary }}
                  >
                    {profile.rank.tier[0]}
                  </span>
                </div>
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{
                      color: styles.colors.text.primary,
                      fontFamily: styles.fonts.heading,
                    }}
                  >
                    {profile.username}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: styles.colors.text.muted }}
                  >
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

function NavLink({
  href,
  children,
  styles,
}: {
  href: string;
  children: React.ReactNode;
  styles: ReturnType<typeof useDesignStyles>;
}) {
  return (
    <Link
      href={href}
      className="text-sm font-medium uppercase tracking-wider transition-colors hover:opacity-80"
      style={{
        color: styles.colors.text.secondary,
        fontFamily: styles.fonts.body,
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  styles,
}: {
  href: string;
  children: React.ReactNode;
  styles: ReturnType<typeof useDesignStyles>;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wider transition-colors"
      style={{
        color: styles.colors.text.secondary,
        fontFamily: styles.fonts.body,
      }}
    >
      {children}
    </Link>
  );
}

export default ThemedNavBar;
