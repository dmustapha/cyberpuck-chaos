'use client';

/**
 * useDynamicWallet Hook
 *
 * A React hook for wallet UI components using wagmi/RainbowKit.
 * Provides wallet-related state and actions.
 *
 * Note: The "Dynamic" in the name is historical - it no longer uses Dynamic Labs.
 */

import { useCallback, useMemo } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
interface StakeAmount {
  value: string;
  bigint: bigint;
  formatted: string;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Wallet connection status
 */
export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected';

/**
 * Return type for useDynamicWallet hook
 */
export interface UseDynamicWalletReturn {
  // Connection State
  isConnected: boolean;
  isConnecting: boolean;
  status: WalletConnectionStatus;

  // Address Info
  address: string | null;
  shortAddress: string | null;

  // Balance Info
  balance: StakeAmount | null;
  formattedBalance: string | null;

  // Chain Status
  isChainConnected: boolean;
  chainId: string | null;
  isApplicationReady: boolean;
  isMockMode: boolean;

  // Actions
  connect: () => void;
  disconnect: () => void;

  // Error Handling
  error: Error | null;
  clearError: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Shorten address for display
 */
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDynamicWallet(): UseDynamicWalletReturn {
  // Wagmi hooks
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  // Compute connection status
  const status = useMemo<WalletConnectionStatus>(() => {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  }, [isConnecting, isConnected]);

  // Compute short address
  const shortAddress = useMemo(() => {
    if (!address) return null;
    return shortenAddress(address);
  }, [address]);

  // Convert balance to StakeAmount format
  const balance = useMemo<StakeAmount | null>(() => {
    if (!balanceData) return null;
    return {
      value: balanceData.value.toString(),
      bigint: balanceData.value,
      formatted: `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`,
    };
  }, [balanceData]);

  // Formatted balance string
  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    return balance.formatted;
  }, [balance]);

  // Connect action - opens RainbowKit modal
  const connect = useCallback(() => {
    openConnectModal?.();
  }, [openConnectModal]);

  // Disconnect action
  const disconnect = useCallback(() => {
    wagmiDisconnect();
  }, [wagmiDisconnect]);

  // Clear error action (no-op for now)
  const clearError = useCallback(() => {
    // RainbowKit handles errors internally
  }, []);

  return {
    // Connection State
    isConnected,
    isConnecting,
    status,

    // Address Info
    address: address ?? null,
    shortAddress,

    // Balance Info
    balance,
    formattedBalance,

    // Chain Status
    isChainConnected: isConnected,
    chainId: chain?.id?.toString() ?? null,
    isApplicationReady: true, // Always ready with RainbowKit
    isMockMode: false,

    // Actions
    connect,
    disconnect,

    // Error Handling
    error: null, // RainbowKit handles errors
    clearError,
  };
}

/**
 * useWalletAddress - Returns just the wallet address
 */
export function useWalletAddress(): string | null {
  const { address } = useDynamicWallet();
  return address;
}

/**
 * useWalletConnected - Returns just whether the wallet is connected
 */
export function useWalletConnected(): boolean {
  const { isConnected } = useDynamicWallet();
  return isConnected;
}

/**
 * useWalletBalance - Returns just the wallet balance
 */
export function useWalletBalance(): StakeAmount | null {
  const { balance } = useDynamicWallet();
  return balance;
}

export default useDynamicWallet;
