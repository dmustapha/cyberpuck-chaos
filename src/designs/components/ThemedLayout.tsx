'use client';

/**
 * ThemedLayout - Full app layout for themed designs
 * Includes navigation, background effects, and content wrapper
 */

import React from 'react';
import { useDesignStyles } from '../useDesignStyles';
import { useDesign } from '../DesignContext';
import { ThemedNavBar } from './ThemedNavBar';

interface ThemedLayoutProps {
  children: React.ReactNode;
}

export function ThemedLayout({ children }: ThemedLayoutProps) {
  const styles = useDesignStyles();
  const { config } = useDesign();

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: styles.colors.bg.primary,
        color: styles.colors.text.primary,
        fontFamily: styles.fonts.body,
      }}
    >
      {/* Background gradient effect */}
      {config.backgroundGradient && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: config.backgroundGradient,
            zIndex: 0,
          }}
        />
      )}

      {/* Navigation */}
      <ThemedNavBar />

      {/* Main content with top padding for fixed navbar */}
      <main className="relative z-10 pt-16">
        {children}
      </main>

      {/* Scanline effect for retro themes */}
      {styles.effects.scanlines && (
        <div
          className="fixed inset-0 pointer-events-none z-50 opacity-20"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
      )}

      {/* CRT curve effect for synthwave */}
      {styles.effects.crtCurve && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3)',
            borderRadius: '5%',
          }}
        />
      )}
    </div>
  );
}

export default ThemedLayout;
