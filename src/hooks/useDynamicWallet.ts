'use client';

/**
 * useDynamicWallet Hook — STUB (Phase 1)
 * Will be replaced with OneChain wallet integration in Phase 4.
 */

import { useCallback, useMemo } from 'react';

interface StakeAmount {
  value: string;
  bigint: bigint;
  formatted: string;
}

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface UseDynamicWalletReturn {
  isConnected: boolean;
  isConnecting: boolean;
  status: WalletConnectionStatus;
  address: string | null;
  shortAddress: string | null;
  balance: StakeAmount | null;
  formattedBalance: string | null;
  isChainConnected: boolean;
  chainId: string | null;
  isApplicationReady: boolean;
  isMockMode: boolean;
  connect: () => void;
  disconnect: () => void;
  error: Error | null;
  clearError: () => void;
}

export function useDynamicWallet(): UseDynamicWalletReturn {
  const connect = useCallback(() => {}, []);
  const disconnect = useCallback(() => {}, []);
  const clearError = useCallback(() => {}, []);

  return {
    isConnected: false,
    isConnecting: false,
    status: 'disconnected',
    address: null,
    shortAddress: null,
    balance: null,
    formattedBalance: null,
    isChainConnected: false,
    chainId: null,
    isApplicationReady: true,
    isMockMode: true,
    connect,
    disconnect,
    error: null,
    clearError,
  };
}

export function useWalletAddress(): string | null {
  return null;
}

export function useWalletConnected(): boolean {
  return false;
}

export function useWalletBalance(): StakeAmount | null {
  return null;
}

export default useDynamicWallet;
