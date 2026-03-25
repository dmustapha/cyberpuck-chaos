/**
 * useMetaMask Hook - MetaMask wallet connection management
 *
 * Provides:
 * - Connection state tracking
 * - Account and chain change handling
 * - Signing capabilities
 * - Error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isMetaMaskInstalled,
  connectMetaMask,
  getMetaMaskState,
  onAccountsChanged,
  onChainChanged,
  onDisconnect,
  signMessage,
  MetaMaskError,
  METAMASK_ERROR_CODES,
} from '@/lib/wallet/metamask';

export interface UseMetaMaskState {
  // Status
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;

  // Account info
  address: string | null;
  chainId: string | null;

  // Error
  error: string | null;
}

export interface UseMetaMaskReturn extends UseMetaMaskState {
  // Actions
  connect: () => Promise<string>;
  disconnect: () => void;
  sign: (message: string) => Promise<string>;

  // Error handling
  clearError: () => void;

  // Utilities
  shortAddress: string | null;
}

/**
 * Hook for managing MetaMask wallet connection
 */
export function useMetaMask(): UseMetaMaskReturn {
  // State
  const [state, setState] = useState<UseMetaMaskState>(() => {
    const initial = getMetaMaskState();
    return {
      isInstalled: initial.isInstalled,
      isConnected: initial.isConnected,
      isConnecting: false,
      address: initial.address,
      chainId: initial.chainId,
      error: null,
    };
  });

  // Track if component is mounted
  const isMounted = useRef(true);

  // Set up event listeners
  useEffect(() => {
    isMounted.current = true;

    // Account changes
    const unsubscribeAccounts = onAccountsChanged((accounts) => {
      if (!isMounted.current) return;

      if (accounts.length === 0) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          address: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
        }));
      }
    });

    // Chain changes
    const unsubscribeChain = onChainChanged((chainId) => {
      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        chainId,
      }));
    });

    // Disconnect events
    const unsubscribeDisconnect = onDisconnect((error) => {
      if (!isMounted.current) return;

      setState((prev) => ({
        ...prev,
        isConnected: false,
        address: null,
        chainId: null,
        error: error.message,
      }));
    });

    return () => {
      isMounted.current = false;
      unsubscribeAccounts();
      unsubscribeChain();
      unsubscribeDisconnect();
    };
  }, []);

  // Connect to MetaMask
  const connect = useCallback(async (): Promise<string> => {
    setState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const address = await connectMetaMask();

      if (!isMounted.current) return address;

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        address,
      }));

      return address;
    } catch (error) {
      if (!isMounted.current) throw error;

      let errorMessage = 'Failed to connect to MetaMask';

      if (error instanceof MetaMaskError) {
        if (error.code === METAMASK_ERROR_CODES.USER_REJECTED) {
          errorMessage = 'Connection request rejected';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));

      throw error;
    }
  }, []);

  // Disconnect (clear local state - MetaMask doesn't have a disconnect API)
  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isConnected: false,
      address: null,
      // Keep chainId as MetaMask is still installed
    }));
  }, []);

  // Sign a message
  const sign = useCallback(async (message: string): Promise<string> => {
    if (!state.address) {
      throw new MetaMaskError('Not connected to MetaMask');
    }

    try {
      return await signMessage(message, state.address);
    } catch (error) {
      let errorMessage = 'Failed to sign message';

      if (error instanceof MetaMaskError) {
        if (error.code === METAMASK_ERROR_CODES.USER_REJECTED) {
          errorMessage = 'Signing request rejected';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));

      throw error;
    }
  }, [state.address]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Computed short address
  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : null;

  return {
    // State
    isInstalled: state.isInstalled,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    address: state.address,
    chainId: state.chainId,
    error: state.error,

    // Actions
    connect,
    disconnect,
    sign,

    // Error handling
    clearError,

    // Utilities
    shortAddress,
  };
}

export default useMetaMask;
