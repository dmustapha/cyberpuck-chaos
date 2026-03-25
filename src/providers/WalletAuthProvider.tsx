'use client';

/**
 * WalletAuthProvider - MetaMask Authentication Provider
 *
 * Handles real MetaMask wallet connection and serves as the identity provider.
 * All user data is tied to the connected wallet address.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  isMetaMaskInstalled,
  connectMetaMask,
  signMessage,
  onAccountsChanged,
  onChainChanged,
  onDisconnect,
  MetaMaskError,
  METAMASK_ERROR_CODES,
} from '@/lib/wallet/metamask';
import {
  setCurrentWallet,
  migrateGlobalDataToWallet,
  hasWalletData,
} from '@/lib/cyber/walletStorage';

// Wallet connection state
export type WalletConnectionStatus =
  | 'initializing'
  | 'not_installed'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface WalletAuthState {
  status: WalletConnectionStatus;
  address: string | null;
  shortAddress: string | null;
  chainId: string | null;
  error: string | null;
  isNewUser: boolean;
}

export interface WalletAuthContextValue extends WalletAuthState {
  // State checks
  isMetaMaskInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;

  // Actions
  connect: () => Promise<string>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  clearError: () => void;

  // Data
  hasExistingData: boolean;
}

// Create context
const WalletAuthContext = createContext<WalletAuthContextValue | null>(null);

// Provider props
interface WalletAuthProviderProps {
  children: ReactNode;
}

// Helper to shorten address
function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * WalletAuthProvider Component
 */
export function WalletAuthProvider({ children }: WalletAuthProviderProps) {
  const [state, setState] = useState<WalletAuthState>({
    status: 'initializing',
    address: null,
    shortAddress: null,
    chainId: null,
    error: null,
    isNewUser: false,
  });
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Initialize - check MetaMask and existing connection
  useEffect(() => {
    const init = async () => {
      // Check if MetaMask is installed
      const installed = isMetaMaskInstalled();
      setMetamaskInstalled(installed);

      if (!installed) {
        setState((prev) => ({
          ...prev,
          status: 'not_installed',
        }));
        return;
      }

      // Check if already connected
      try {
        const accounts = await window.ethereum!.request<string[]>({
          method: 'eth_accounts',
        });

        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          const chainId = window.ethereum!.chainId;
          const isNew = !hasWalletData(address);

          // Set current wallet for storage
          setCurrentWallet(address);

          // Check for migration
          migrateGlobalDataToWallet(address);

          setHasExistingData(hasWalletData(address));

          setState({
            status: 'connected',
            address,
            shortAddress: shortenAddress(address),
            chainId,
            error: null,
            isNewUser: isNew,
          });
        } else {
          setState((prev) => ({
            ...prev,
            status: 'disconnected',
          }));
        }
      } catch (error) {
        console.error('[WalletAuth] Init error:', error);
        setState((prev) => ({
          ...prev,
          status: 'disconnected',
        }));
      }
    };

    init();
  }, []);

  // Subscribe to MetaMask events
  useEffect(() => {
    if (!metamaskInstalled) return;

    // Handle account changes
    const unsubAccounts = onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        setCurrentWallet(null);
        setState({
          status: 'disconnected',
          address: null,
          shortAddress: null,
          chainId: null,
          error: null,
          isNewUser: false,
        });
        setHasExistingData(false);
      } else {
        // User switched accounts
        const address = accounts[0];
        const isNew = !hasWalletData(address);

        setCurrentWallet(address);
        migrateGlobalDataToWallet(address);
        setHasExistingData(hasWalletData(address));

        setState((prev) => ({
          ...prev,
          status: 'connected',
          address,
          shortAddress: shortenAddress(address),
          error: null,
          isNewUser: isNew,
        }));

        // Force page reload to reinitialize stores with new wallet
        window.location.reload();
      }
    });

    // Handle chain changes
    const unsubChain = onChainChanged((chainId) => {
      setState((prev) => ({
        ...prev,
        chainId,
      }));
    });

    // Handle disconnect
    const unsubDisconnect = onDisconnect(() => {
      setCurrentWallet(null);
      setState({
        status: 'disconnected',
        address: null,
        shortAddress: null,
        chainId: null,
        error: null,
        isNewUser: false,
      });
    });

    return () => {
      unsubAccounts();
      unsubChain();
      unsubDisconnect();
    };
  }, [metamaskInstalled]);

  // Connect wallet
  const connect = useCallback(async (): Promise<string> => {
    if (!metamaskInstalled) {
      throw new Error('MetaMask is not installed');
    }

    setState((prev) => ({
      ...prev,
      status: 'connecting',
      error: null,
    }));

    try {
      const address = await connectMetaMask();
      const chainId = window.ethereum!.chainId;
      const isNew = !hasWalletData(address);

      // Set current wallet for storage
      setCurrentWallet(address);

      // Migrate old data if exists
      migrateGlobalDataToWallet(address);

      setHasExistingData(hasWalletData(address));

      setState({
        status: 'connected',
        address,
        shortAddress: shortenAddress(address),
        chainId,
        error: null,
        isNewUser: isNew,
      });

      return address;
    } catch (error) {
      let errorMessage = 'Failed to connect wallet';

      if (error instanceof MetaMaskError) {
        if (error.code === METAMASK_ERROR_CODES.USER_REJECTED) {
          errorMessage = 'Connection rejected. Please try again.';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      throw new Error(errorMessage);
    }
  }, [metamaskInstalled]);

  // Disconnect wallet (client-side only, MetaMask doesn't have programmatic disconnect)
  const disconnect = useCallback(() => {
    setCurrentWallet(null);
    setState({
      status: 'disconnected',
      address: null,
      shortAddress: null,
      chainId: null,
      error: null,
      isNewUser: false,
    });
    setHasExistingData(false);
  }, []);

  // Sign message
  const sign = useCallback(
    async (message: string): Promise<string> => {
      if (!state.address) {
        throw new Error('Wallet not connected');
      }
      return signMessage(message, state.address);
    },
    [state.address]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: prev.status === 'error' ? 'disconnected' : prev.status,
      error: null,
    }));
  }, []);

  // Derived state
  const isConnected = state.status === 'connected';
  const isConnecting = state.status === 'connecting';

  // Context value
  const contextValue: WalletAuthContextValue = {
    ...state,
    isMetaMaskInstalled: metamaskInstalled,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    signMessage: sign,
    clearError,
    hasExistingData,
  };

  return (
    <WalletAuthContext.Provider value={contextValue}>
      {children}
    </WalletAuthContext.Provider>
  );
}

/**
 * Hook to access wallet auth context
 */
export function useWalletAuth(): WalletAuthContextValue {
  const context = useContext(WalletAuthContext);
  if (!context) {
    throw new Error('useWalletAuth must be used within a WalletAuthProvider');
  }
  return context;
}

/**
 * Hook to check if within wallet auth provider
 */
export function useIsInWalletAuthProvider(): boolean {
  const context = useContext(WalletAuthContext);
  return context !== null;
}

export default WalletAuthProvider;
