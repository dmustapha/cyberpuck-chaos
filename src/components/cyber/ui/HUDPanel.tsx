'use client';

/**
 * HUDPanel - Cyber-themed bordered panel with corner brackets
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface HUDPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'solid';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  corners?: boolean;
  animate?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export function HUDPanel({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  corners = true,
  animate = false,
}: HUDPanelProps) {
  const baseStyles = `
    relative
    rounded-lg
    ${paddingStyles[padding]}
  `;

  const variantStyles = {
    default: `
      bg-[${cyberTheme.colors.bg.panel}]
      border border-[${cyberTheme.colors.border.default}]
    `,
    glow: `
      bg-[${cyberTheme.colors.bg.panel}]
      border border-[${cyberTheme.colors.primary}]
      shadow-[0_0_20px_${cyberTheme.colors.primary}40]
    `,
    solid: `
      bg-[${cyberTheme.colors.bg.secondary}]
      border border-[${cyberTheme.colors.border.default}]
    `,
  };

  return (
    <div
      className={`${baseStyles} ${className}`}
      style={{
        backgroundColor:
          variant === 'solid'
            ? cyberTheme.colors.bg.secondary
            : cyberTheme.colors.bg.panel,
        borderColor:
          variant === 'glow'
            ? cyberTheme.colors.primary
            : cyberTheme.colors.border.default,
        boxShadow:
          variant === 'glow'
            ? `0 0 20px ${cyberTheme.colors.primary}40`
            : cyberTheme.shadows.panel,
      }}
    >
      {corners && (
        <>
          {/* Corner brackets */}
          <div
            className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
            style={{ borderColor: cyberTheme.colors.primary }}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
            style={{ borderColor: cyberTheme.colors.primary }}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
            style={{ borderColor: cyberTheme.colors.primary }}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
            style={{ borderColor: cyberTheme.colors.primary }}
          />
        </>
      )}

      {/* Animated scan line effect */}
      {animate && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg"
          style={{ opacity: 0.1 }}
        >
          <div
            className="absolute inset-0 animate-scan"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${cyberTheme.colors.primary} 50%, transparent 100%)`,
              height: '20%',
            }}
          />
        </div>
      )}

      {children}
    </div>
  );
}

export default HUDPanel;
