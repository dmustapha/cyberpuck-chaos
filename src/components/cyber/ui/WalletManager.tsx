'use client';

/**
 * WalletManager - Wallet connection UI placeholder
 *
 * Stubbed out pending new wallet integration.
 * Uses the cyber/esports theme for consistent styling.
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';

interface WalletManagerProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function WalletManager({
  variant = 'full',
  className = '',
}: WalletManagerProps) {
  const padding = variant === 'compact' ? 'px-3 py-2' : 'p-6';

  return (
    <div
      className={`flex items-center justify-center ${padding} rounded-lg ${className}`}
      style={{
        backgroundColor: cyberTheme.colors.bg.secondary,
        border: `1px solid ${cyberTheme.colors.border.default}`,
      }}
    >
      <span
        className="text-sm"
        style={{
          color: cyberTheme.colors.text.secondary,
          fontFamily: cyberTheme.fonts.body,
        }}
      >
        Wallet connection coming soon
      </span>
    </div>
  );
}

export default WalletManager;
