'use client';

/**
 * ConnectWalletScreen - Full page wallet connection screen
 *
 * Shown when user hasn't connected their wallet yet.
 * Provides connection button and MetaMask installation link.
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { CyberButton } from './CyberButton';
import { HUDPanel } from './HUDPanel';

interface ConnectWalletScreenProps {
  isMetaMaskInstalled: boolean;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => Promise<void>;
  onClearError: () => void;
}

export function ConnectWalletScreen({
  isMetaMaskInstalled,
  isConnecting,
  error,
  onConnect,
  onClearError,
}: ConnectWalletScreenProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLocalError(null);
    try {
      await onConnect();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Connection failed');
    }
  };

  const displayError = error || localError;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: cyberTheme.colors.bg.primary,
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, ${cyberTheme.colors.primary}15 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${cyberTheme.colors.secondary}10 0%, transparent 40%)
        `,
      }}
    >
      {/* Animated background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${cyberTheme.colors.border.subtle} 1px, transparent 1px),
            linear-gradient(90deg, ${cyberTheme.colors.border.subtle} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <HUDPanel className="relative z-10 max-w-md w-full" variant="glow">
        <div className="text-center p-8">
          {/* Logo/Icon */}
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}20`,
              border: `2px solid ${cyberTheme.colors.primary}`,
              boxShadow: cyberTheme.shadows.glow(cyberTheme.colors.primary),
            }}
          >
            <svg
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={cyberTheme.colors.primary}
              strokeWidth="2"
            >
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
              <path d="M3 21h18" />
              <path d="M9 9h1" />
              <path d="M9 13h1" />
              <path d="M9 17h1" />
              <path d="M14 9h1" />
              <path d="M14 13h1" />
              <path d="M14 17h1" />
            </svg>
          </div>

          {/* Title */}
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
              textShadow: cyberTheme.shadows.glowText(cyberTheme.colors.primary),
            }}
          >
            CYBER HOCKEY
          </h1>

          <p
            className="text-sm mb-8"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Connect your wallet to start playing
          </p>

          {/* Error display */}
          {displayError && (
            <div
              className="mb-6 p-4 rounded-lg text-sm"
              style={{
                backgroundColor: `${cyberTheme.colors.error}20`,
                border: `1px solid ${cyberTheme.colors.error}`,
                color: cyberTheme.colors.error,
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">!</span>
                <div className="flex-1 text-left">
                  <p>{displayError}</p>
                </div>
                <button
                  onClick={() => {
                    setLocalError(null);
                    onClearError();
                  }}
                  className="opacity-70 hover:opacity-100"
                >
                  x
                </button>
              </div>
            </div>
          )}

          {/* MetaMask not installed */}
          {!isMetaMaskInstalled && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-lg text-sm"
                style={{
                  backgroundColor: `${cyberTheme.colors.warning}15`,
                  border: `1px solid ${cyberTheme.colors.warning}40`,
                  color: cyberTheme.colors.text.secondary,
                }}
              >
                <p className="mb-2">
                  <span style={{ color: cyberTheme.colors.warning }}>
                    MetaMask Required
                  </span>
                </p>
                <p>
                  Install MetaMask to connect your wallet and start playing.
                  Your progress will be saved to your wallet address.
                </p>
              </div>

              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <CyberButton variant="primary" size="lg" glow className="w-full">
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Install MetaMask
                  </span>
                </CyberButton>
              </a>
            </div>
          )}

          {/* MetaMask installed - show connect */}
          {isMetaMaskInstalled && (
            <div className="space-y-4">
              {/* Info box */}
              <div
                className="p-4 rounded-lg text-sm text-left"
                style={{
                  backgroundColor: `${cyberTheme.colors.primary}10`,
                  border: `1px solid ${cyberTheme.colors.border.subtle}`,
                  color: cyberTheme.colors.text.secondary,
                }}
              >
                <p className="mb-2 flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cyberTheme.colors.success }}
                  />
                  <span style={{ color: cyberTheme.colors.success }}>
                    MetaMask Detected
                  </span>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>- Your wallet is your identity</li>
                  <li>- Stats & achievements saved to your address</li>
                  <li>- Sign transactions for multiplayer matches</li>
                </ul>
              </div>

              {/* Connect button */}
              <CyberButton
                variant="primary"
                size="lg"
                glow
                className="w-full"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{
                        borderColor: `currentColor transparent currentColor currentColor`,
                      }}
                    />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Connect Wallet
                  </span>
                )}
              </CyberButton>
            </div>
          )}

          {/* Footer info */}
          <p
            className="mt-8 text-xs"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            By connecting, you agree to use this app responsibly.
            <br />
            We never store your private keys.
          </p>
        </div>
      </HUDPanel>
    </div>
  );
}

export default ConnectWalletScreen;
