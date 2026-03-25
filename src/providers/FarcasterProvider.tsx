'use client';

import React, { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { initFarcasterSDK, isMiniApp } from '@/lib/farcaster';

interface FarcasterContextValue {
  isInMiniApp: boolean;
  isReady: boolean;
}

const FarcasterContext = createContext<FarcasterContextValue>({
  isInMiniApp: false,
  isReady: false,
});

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    const inMiniApp = isMiniApp();
    setIsInMiniApp(inMiniApp);

    if (inMiniApp) {
      initFarcasterSDK().then(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, []);

  return (
    <FarcasterContext.Provider value={{ isInMiniApp, isReady }}>
      {children}
    </FarcasterContext.Provider>
  );
}

export function useFarcaster() {
  return useContext(FarcasterContext);
}
