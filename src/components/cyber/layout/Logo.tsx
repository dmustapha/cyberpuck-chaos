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
        className={`${sizes.icon} ${animated ? 'animate-pulse' : ''}`}
        style={{
          color: theme.colors.primary,
          textShadow: `0 0 10px ${theme.colors.primary}`,
        }}
      >
        ⚡
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
          AIR
          <span style={{ color: theme.colors.primary }}> HOCKEY</span>
        </span>
        <span
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: theme.colors.text.muted }}
        >
          {theme._theme.name.toUpperCase()}
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
