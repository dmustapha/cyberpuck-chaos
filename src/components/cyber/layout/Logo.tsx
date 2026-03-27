'use client';

/**
 * Logo - Theme-aware logo
 */

import React from 'react';
import Link from 'next/link';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  linkTo?: string;
  className?: string;
}

const sizeConfig = {
  sm: { text: 'text-lg', icon: 'text-xl' },
  md: { text: 'text-xl', icon: 'text-2xl' },
  lg: { text: 'text-3xl', icon: 'text-4xl' },
};

export function Logo({
  size = 'md',
  animated = true,
  linkTo = '/',
  className = '',
}: LogoProps) {
  const theme = useThemedStyles();
  const sizes = sizeConfig[size];

  const content = (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ fontFamily: theme.fonts.heading }}
    >
      {/* Icon */}
      <span
        className={`${animated ? 'animate-pulse' : ''}`}
        style={{
          filter: `drop-shadow(0 0 6px ${theme.colors.primary})`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8" />
        </svg>
      </span>

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <span
          className={`${sizes.text} font-black tracking-wider uppercase`}
          style={{
            color: theme.colors.text.primary,
            textShadow: `0 0 10px ${theme.colors.primary}40`,
          }}
        >
          CYBER
          <span style={{ color: theme.colors.primary }}>PUCK</span>
        </span>
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: theme.colors.text.muted }}
        >
          CHAOS
        </span>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
