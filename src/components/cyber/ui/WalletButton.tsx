'use client';

/**
 * WalletButton - Wallet connection button with status indicator
 *
 * Displays:
 * - Connect button when disconnected
 * - Address and balance when connected
 * - Loading state during connection
 * - Error state with retry option
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { CyberButton } from './CyberButton';

interface WalletButtonProps {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  shortAddress: string | null;
  balance?: string | null;

  // Actions
  onConnect: () => void;
  onDisconnect: () => void;

  // Error
  error?: string | null;
  onClearError?: () => void;

  // Styling
  variant?: 'full' | 'compact' | 'minimal';
  className?: string;
}

export function WalletButton({
  isConnected,
  isConnecting,
  address,
  shortAddress,
  balance,
  onConnect,
  onDisconnect,
  error,
  onClearError,
  variant = 'full',
  className = '',
}: WalletButtonProps) {

  // Error state
  if (error) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: `${cyberTheme.colors.error}20`,
            border: `1px solid ${cyberTheme.colors.error}`,
            color: cyberTheme.colors.error,
          }}
        >
          <span className="text-lg">⚠️</span>
          <span className="max-w-[200px] truncate">{error}</span>
          {onClearError && (
            <button
              onClick={onClearError}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          )}
        </div>
        <CyberButton variant="secondary" size="sm" onClick={onConnect}>
          Retry
        </CyberButton>
      </div>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${cyberTheme.colors.primary}`,
          }}
        >
          <div
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: `${cyberTheme.colors.primary} transparent ${cyberTheme.colors.primary} ${cyberTheme.colors.primary}` }}
          />
          <span style={{ color: cyberTheme.colors.text.secondary }}>
            Connecting...
          </span>
        </div>
      </div>
    );
  }

  // Connected state
  if (isConnected) {
    // If no address, show a minimal connected indicator
    if (!address) {
      return (
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${className}`}
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${cyberTheme.colors.success}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: cyberTheme.colors.success }}
          />
          <span
            className="text-sm"
            style={{ color: cyberTheme.colors.success }}
          >
            Connected
          </span>
          <button
            onClick={onDisconnect}
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            ✕
          </button>
        </div>
      );
    }

    // Connected with address
    if (variant === 'minimal') {
      return (
        <button
          onClick={onDisconnect}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-mono hover:opacity-80 transition-opacity ${className}`}
          style={{
            backgroundColor: `${cyberTheme.colors.success}20`,
            color: cyberTheme.colors.success,
          }}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {shortAddress}
        </button>
      );
    }

    if (variant === 'compact') {
      return (
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${className}`}
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${cyberTheme.colors.border.default}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: cyberTheme.colors.success }}
          />
          <span
            className="font-mono text-sm"
            style={{ color: cyberTheme.colors.text.primary }}
          >
            {shortAddress}
          </span>
          {balance && (
            <span
              className="text-sm"
              style={{ color: cyberTheme.colors.warning }}
            >
              {balance}
            </span>
          )}
          <button
            onClick={onDisconnect}
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            ✕
          </button>
        </div>
      );
    }

    // Full variant
    return (
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-lg ${className}`}
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
          border: `1px solid ${cyberTheme.colors.border.default}`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: cyberTheme.colors.success }}
          />
          <div className="flex flex-col">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Connected
            </span>
            <span
              className="font-mono text-sm"
              style={{ color: cyberTheme.colors.success }}
            >
              {shortAddress}
            </span>
          </div>
        </div>

        {balance && (
          <div className="flex flex-col border-l pl-3" style={{ borderColor: cyberTheme.colors.border.default }}>
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Balance
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: cyberTheme.colors.warning }}
            >
              {balance}
            </span>
          </div>
        )}

        <button
          onClick={onDisconnect}
          className="ml-2 text-sm underline opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Disconnected state - show connect button
  return (
    <CyberButton
      variant="primary"
      size="md"
      glow
      onClick={onConnect}
      className={className}
    >
      Connect
    </CyberButton>
  );
}

export default WalletButton;
