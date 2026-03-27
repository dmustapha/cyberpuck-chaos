'use client';

/**
 * WalletGate — Soft gate for game access.
 * Shows inline connect prompt if wallet not connected.
 * "Play as Guest" bypasses the gate entirely.
 * Connected users with profile pass through automatically.
 */

import { type ReactNode, useState } from 'react';
import { ConnectButton, useCurrentAccount, useAutoConnectWallet } from '@onelabs/dapp-kit';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';

interface WalletGateProps {
  children: ReactNode;
}

export function WalletGate({ children }: WalletGateProps) {
  const account = useCurrentAccount();
  const autoConnect = useAutoConnectWallet();
  const { profile, isLoading: isProfileLoading, createProfile } = usePlayerProfile();
  const theme = useThemedStyles();
  const [guestMode, setGuestMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!account;
  const hasProfile = !!profile;

  // autoConnect is 'idle' while attempting reconnect, 'attempted' when done
  const isAutoConnectDone = autoConnect === 'attempted' || autoConnect === 'disabled';
  const isReady = isAutoConnectDone && !isProfileLoading;

  // Guest mode or fully authenticated — pass through
  if (guestMode || (isReady && isConnected && hasProfile)) {
    return <>{children}</>;
  }

  // Loading while autoConnect settles
  if (!isReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.bg.primary }}
      >
        <div
          className="text-lg font-bold uppercase tracking-wider animate-pulse"
          style={{
            color: theme.colors.primary,
            fontFamily: theme.fonts.heading,
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  const handleCreateProfile = async () => {
    setIsCreating(true);
    setError(null);
    try {
      await createProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setIsCreating(false);
    }
  };

  // Determine step
  const step = !isConnected ? 1 : !hasProfile ? 2 : 3;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: theme.colors.bg.primary }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold uppercase tracking-wider mb-2"
            style={{
              color: theme.colors.text.primary,
              fontFamily: theme.fonts.heading,
              textShadow: `0 0 20px ${theme.colors.primary}60`,
            }}
          >
            Enter the Arena
          </h1>
          <p
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            Jump straight in, or connect your wallet to record scores on-chain.
          </p>
        </div>

        {/* Primary CTA: Play Now */}
        <div className="text-center mb-6">
          <button
            onClick={() => setGuestMode(true)}
            className="w-full px-8 py-4 rounded-lg font-bold text-lg uppercase tracking-wider transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #3B82F6 100%)`,
              color: '#ffffff',
              fontFamily: theme.fonts.heading,
              boxShadow: `0 0 30px ${theme.colors.primary}50, 0 4px 15px rgba(0, 0, 0, 0.4)`,
              border: `1px solid ${theme.colors.primary}`,
            }}
          >
            Play Now
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: theme.colors.border.default }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: theme.colors.text.muted, fontFamily: theme.fonts.heading }}>
            or connect wallet
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: theme.colors.border.default }} />
        </div>

        {/* Secondary: Wallet connect card */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{
            backgroundColor: theme.colors.bg.panel,
            border: `1px solid ${theme.colors.border.default}`,
          }}
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                Record scores on-chain
              </p>
              <p className="text-xs" style={{ color: theme.colors.text.muted }}>
                Connect wallet to save matches and earn rank
              </p>
            </div>
          </div>

          {!isConnected ? (
            <ConnectButton connectText="Connect Wallet" />
          ) : !hasProfile ? (
            <div>
              <p className="text-xs mb-2 font-mono" style={{ color: theme.colors.primary }}>
                {account!.address.slice(0, 8)}...{account!.address.slice(-6)}
              </p>
              <button
                onClick={handleCreateProfile}
                disabled={isCreating}
                className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.bg.primary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                {isCreating ? 'Creating...' : 'Create Profile'}
              </button>
              {error && (
                <p className="text-xs mt-2" style={{ color: theme.colors.error }}>
                  {error}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: theme.colors.primary }}>
              Profile ready!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
