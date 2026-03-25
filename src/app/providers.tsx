'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@onelabs/dapp-kit';
// TRAP: This CSS import is REQUIRED — ConnectButton is unstyled without it
import '@onelabs/dapp-kit/dist/index.css';
import { DesignProvider } from '@/designs';
import { AudioProvider } from '@/contexts/AudioContext';

const networks = {
  testnet: { url: 'https://rpc-testnet.onelabs.cc:443' },
};

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <DesignProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </DesignProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
