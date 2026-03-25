'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DesignProvider } from '@/designs';
import { AudioProvider } from '@/contexts/AudioContext';

/**
 * Root Providers — stub for Phase 1.
 * OneChain wallet providers will be added in Phase 4.
 */
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
      <DesignProvider>
        <AudioProvider>
          {children}
        </AudioProvider>
      </DesignProvider>
    </QueryClientProvider>
  );
}
