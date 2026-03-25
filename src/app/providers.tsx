'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi/config';
import { DesignProvider } from '@/designs';
import { AudioProvider } from '@/contexts/AudioContext';
import { FarcasterProvider } from '@/providers/FarcasterProvider';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

/**
 * Root Providers
 *
 * Uses RainbowKit + wagmi for wallet connection:
 * - MetaMask, WalletConnect, Coinbase Wallet support
 * - Beautiful wallet selection UI
 * - Account management
 *
 * RainbowKit + wagmi for wallet connection.
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient once per component instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <FarcasterProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#00f0ff', // Cyan accent matching cyber theme
              accentColorForeground: '#0a0a0f',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
            modalSize="compact"
          >
            <DesignProvider>
              <AudioProvider>
                {children}
              </AudioProvider>
            </DesignProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </FarcasterProvider>
  );
}
