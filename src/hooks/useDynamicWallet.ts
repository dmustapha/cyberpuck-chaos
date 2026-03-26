'use client';

/**
 * useDynamicWallet — Real OneChain wallet integration via @onelabs/dapp-kit.
 * Wraps useCurrentAccount() to provide wallet state to game components.
 * Wallet is optional — generates a guest address for multiplayer identity when not connected.
 */

import { useMemo } from 'react';
import { useCurrentAccount } from '@onelabs/dapp-kit';

export type WalletConnectionStatus = 'disconnected' | 'connected';

export interface UseDynamicWalletReturn {
  isConnected: boolean;
  address: string;
  shortAddress: string;
  status: WalletConnectionStatus;
}

// Generate a stable guest address for the session
let guestAddress: string | null = null;
function getGuestAddress(): string {
  if (!guestAddress) {
    guestAddress = `guest-${Math.random().toString(36).slice(2, 10)}`;
  }
  return guestAddress;
}

export function useDynamicWallet(): UseDynamicWalletReturn {
  const account = useCurrentAccount();

  const address = useMemo(
    () => account?.address ?? getGuestAddress(),
    [account],
  );

  const shortAddress = useMemo(
    () =>
      account
        ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
        : 'Guest',
    [account],
  );

  return {
    isConnected: !!account,
    address,
    shortAddress,
    status: account ? 'connected' : 'disconnected',
  };
}

export function useWalletAddress(): string | null {
  const account = useCurrentAccount();
  return account?.address ?? null;
}

export function useWalletConnected(): boolean {
  const account = useCurrentAccount();
  return !!account;
}

export default useDynamicWallet;
