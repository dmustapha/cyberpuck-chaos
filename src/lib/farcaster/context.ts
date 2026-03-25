'use client';

import { useState, useEffect } from 'react';
import { getFarcasterUser, isMiniApp } from './sdk';

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export function useFarcasterUser() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isInMiniApp, setIsInMiniApp] = useState(false);

  useEffect(() => {
    setIsInMiniApp(isMiniApp());

    getFarcasterUser().then((u) => {
      if (u) setUser(u);
    });
  }, []);

  return { user, isInMiniApp };
}
