/**
 * MetaMask Wallet Utilities
 *
 * Handles MetaMask wallet connection, signing, and event subscriptions.
 */

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: <T = unknown>(args: { method: string; params?: unknown[] }) => Promise<T>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      selectedAddress: string | null;
      chainId: string | null;
    };
  }
}

// MetaMask connection state
export interface MetaMaskState {
  isInstalled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  chainId: string | null;
  error: string | null;
}

// MetaMask error types
export class MetaMaskError extends Error {
  constructor(
    message: string,
    public code?: number
  ) {
    super(message);
    this.name = 'MetaMaskError';
  }
}

// Error codes
export const METAMASK_ERROR_CODES = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
} as const;

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
}

/**
 * Get current MetaMask state
 */
export function getMetaMaskState(): MetaMaskState {
  if (typeof window === 'undefined' || !window.ethereum) {
    return {
      isInstalled: false,
      isConnected: false,
      isConnecting: false,
      address: null,
      chainId: null,
      error: null,
    };
  }

  return {
    isInstalled: Boolean(window.ethereum.isMetaMask),
    isConnected: Boolean(window.ethereum.selectedAddress),
    isConnecting: false,
    address: window.ethereum.selectedAddress,
    chainId: window.ethereum.chainId,
    error: null,
  };
}

/**
 * Request MetaMask account connection
 */
export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new MetaMaskError('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum!.request<string[]>({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new MetaMaskError('No accounts returned from MetaMask');
    }

    return accounts[0];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: number }).code;
      if (code === METAMASK_ERROR_CODES.USER_REJECTED) {
        throw new MetaMaskError('User rejected the connection request', code);
      }
    }
    throw new MetaMaskError(
      error instanceof Error ? error.message : 'Failed to connect to MetaMask'
    );
  }
}

/**
 * Sign a message using MetaMask
 */
export async function signMessage(message: string, address: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new MetaMaskError('MetaMask is not installed');
  }

  try {
    const signature = await window.ethereum!.request<string>({
      method: 'personal_sign',
      params: [message, address],
    });

    return signature;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: number }).code;
      if (code === METAMASK_ERROR_CODES.USER_REJECTED) {
        throw new MetaMaskError('User rejected the signing request', code);
      }
    }
    throw new MetaMaskError(
      error instanceof Error ? error.message : 'Failed to sign message'
    );
  }
}

/**
 * Sign typed data (EIP-712) using MetaMask
 * More structured signing for complex operations
 */
export async function signTypedData(
  domain: Record<string, unknown>,
  types: Record<string, Array<{ name: string; type: string }>>,
  value: Record<string, unknown>,
  address: string
): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new MetaMaskError('MetaMask is not installed');
  }

  try {
    const signature = await window.ethereum!.request<string>({
      method: 'eth_signTypedData_v4',
      params: [address, JSON.stringify({ domain, types, primaryType: 'Message', message: value })],
    });

    return signature;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code: number }).code;
      if (code === METAMASK_ERROR_CODES.USER_REJECTED) {
        throw new MetaMaskError('User rejected the signing request', code);
      }
    }
    throw new MetaMaskError(
      error instanceof Error ? error.message : 'Failed to sign typed data'
    );
  }
}

/**
 * Subscribe to MetaMask account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const handler = (accounts: unknown) => {
    callback(accounts as string[]);
  };

  window.ethereum!.on('accountsChanged', handler);
  return () => window.ethereum!.removeListener('accountsChanged', handler);
}

/**
 * Subscribe to MetaMask chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const handler = (chainId: unknown) => {
    callback(chainId as string);
  };

  window.ethereum!.on('chainChanged', handler);
  return () => window.ethereum!.removeListener('chainChanged', handler);
}

/**
 * Subscribe to MetaMask disconnect events
 */
export function onDisconnect(callback: (error: { code: number; message: string }) => void): () => void {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const handler = (error: unknown) => {
    callback(error as { code: number; message: string });
  };

  window.ethereum!.on('disconnect', handler);
  return () => window.ethereum!.removeListener('disconnect', handler);
}

/**
 * Disconnect from MetaMask (clears local state)
 * Note: MetaMask doesn't support programmatic disconnect - user must disconnect from extension
 * This function clears local application state
 */
export function disconnectMetaMask(): void {
  // Nothing to clear - MetaMask manages its own state
}
