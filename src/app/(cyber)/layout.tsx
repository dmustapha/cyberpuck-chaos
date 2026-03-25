'use client';

/**
 * Cyber Layout - Clean, theme-aware layout
 * No AI slop - no floating particles, no shimmer, no grid overlays
 */

import React from 'react';
import { TopNavBar } from '@/components/cyber/layout';
import { useThemeStore } from '@/stores/themeStore';
import { MultiplayerProvider } from '@/contexts/MultiplayerContext';

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* Navigation */}
      <TopNavBar />

      {/* Main content with top padding for fixed navbar */}
      <main className="pt-16">
        <MultiplayerProvider>
          {children}
        </MultiplayerProvider>
      </main>

      {/* Scanline effect for retro theme only */}
      {theme.effects.scanlines && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      )}
    </div>
  );
}
