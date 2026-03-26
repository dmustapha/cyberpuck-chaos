'use client';

/**
 * Onboard Page — Connect wallet + create on-chain profile.
 * Two-step flow:
 *   1. Connect wallet (ConnectButton from @onelabs/dapp-kit)
 *   2. Create profile (on-chain transaction)
 * Redirects to /game once both are complete.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton, useCurrentAccount, useAutoConnectWallet } from '@onelabs/dapp-kit';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { useThemedStyles } from '@/lib/cyber/useThemedStyles';
import { motion } from 'framer-motion';

export default function OnboardPage() {
  const account = useCurrentAccount();
  const autoConnect = useAutoConnectWallet();
  const { profile, isLoading: isProfileLoading, createProfile } = usePlayerProfile();
  const router = useRouter();
  const theme = useThemedStyles();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = !!account;
  const hasProfile = !!profile;
  const isAutoConnectDone = autoConnect === 'attempted' || autoConnect === 'disabled';

  // Redirect to game once wallet + profile are ready (after autoConnect settles)
  useEffect(() => {
    if (!isAutoConnectDone || isProfileLoading) return;

    if (isConnected && hasProfile) {
      router.replace('/game');
    }
  }, [isConnected, hasProfile, isAutoConnectDone, isProfileLoading, router]);

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

  // Determine current step
  const step = !isConnected ? 1 : !hasProfile ? 2 : 3;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
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
            Connect your wallet and create your player profile to start playing.
          </p>
        </div>

        {/* Steps */}
        <div
          className="rounded-xl p-6 space-y-6"
          style={{
            backgroundColor: theme.colors.bg.panel,
            border: `1px solid ${theme.colors.border.default}`,
          }}
        >
          {/* Step 1: Connect Wallet */}
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: isConnected ? theme.colors.primary : `${theme.colors.primary}30`,
                color: isConnected ? theme.colors.bg.primary : theme.colors.primary,
                fontFamily: theme.fonts.heading,
              }}
            >
              {isConnected ? '✓' : '1'}
            </div>
            <div className="flex-1">
              <h3
                className="font-bold text-sm uppercase tracking-wider mb-2"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                Connect Wallet
              </h3>
              {!isConnected ? (
                <div>
                  <p
                    className="text-xs mb-3"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Connect your OneChain wallet to get started.
                  </p>
                  <ConnectButton connectText="Connect Wallet" />
                </div>
              ) : (
                <p
                  className="text-xs font-mono"
                  style={{ color: theme.colors.primary }}
                >
                  {account!.address.slice(0, 8)}...{account!.address.slice(-6)}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            className="border-t"
            style={{ borderColor: theme.colors.border.default }}
          />

          {/* Step 2: Create Profile */}
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: hasProfile ? theme.colors.primary : `${theme.colors.primary}30`,
                color: hasProfile ? theme.colors.bg.primary : theme.colors.primary,
                fontFamily: theme.fonts.heading,
                opacity: step >= 2 ? 1 : 0.4,
              }}
            >
              {hasProfile ? '✓' : '2'}
            </div>
            <div className="flex-1" style={{ opacity: step >= 2 ? 1 : 0.4 }}>
              <h3
                className="font-bold text-sm uppercase tracking-wider mb-2"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                Create Profile
              </h3>
              {step === 2 && !hasProfile && (
                <div>
                  <p
                    className="text-xs mb-3"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Create your on-chain player profile. This is a one-time transaction.
                  </p>
                  {isProfileLoading ? (
                    <p
                      className="text-xs animate-pulse"
                      style={{ color: theme.colors.text.muted }}
                    >
                      Checking for existing profile...
                    </p>
                  ) : (
                    <>
                      <button
                        onClick={handleCreateProfile}
                        disabled={isCreating}
                        className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: theme.colors.primary,
                          color: theme.colors.bg.primary,
                          boxShadow: `0 0 20px ${theme.colors.primary}40`,
                          fontFamily: theme.fonts.heading,
                        }}
                      >
                        {isCreating ? 'Creating...' : 'Create Profile'}
                      </button>
                      {error && (
                        <p
                          className="text-xs mt-2"
                          style={{ color: theme.colors.error }}
                        >
                          {error}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
              {hasProfile && (
                <p
                  className="text-xs"
                  style={{ color: theme.colors.primary }}
                >
                  Profile created!
                </p>
              )}
              {step < 2 && (
                <p
                  className="text-xs"
                  style={{ color: theme.colors.text.muted }}
                >
                  Connect wallet first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Play as Guest */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/game')}
            className="px-6 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              border: `1px solid ${theme.colors.primary}40`,
              color: theme.colors.primary,
              fontFamily: theme.fonts.heading,
            }}
          >
            Play as Guest
          </button>
          <p
            className="text-xs mt-2"
            style={{ color: theme.colors.text.muted }}
          >
            Skip wallet setup — your scores won&apos;t be recorded on-chain.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
