/**
 * Wallet-Aware Storage Utilities
 *
 * Provides localStorage utilities that key data by wallet address.
 * This ensures each wallet has its own isolated data.
 */

// Storage key prefixes
export const STORAGE_KEYS = {
  player: 'cyber_hockey_player',
  matches: 'cyber_hockey_matches',
  achievements: 'cyber_hockey_achievements',
  settings: 'cyber_hockey_settings',
} as const;

// Current connected wallet address (set by WalletAuthProvider)
let currentWalletAddress: string | null = null;

/**
 * Set the current wallet address for storage operations
 */
export function setCurrentWallet(address: string | null): void {
  currentWalletAddress = address?.toLowerCase() || null;
}

/**
 * Get the current wallet address
 */
export function getCurrentWallet(): string | null {
  return currentWalletAddress;
}

/**
 * Generate a wallet-specific storage key
 */
export function getWalletStorageKey(baseKey: string, address?: string): string {
  const wallet = address?.toLowerCase() || currentWalletAddress;
  if (!wallet) {
    // Fallback to base key if no wallet (should not happen in normal flow)
    console.warn('[WalletStorage] No wallet address set, using base key');
    return baseKey;
  }
  // Use first 10 and last 8 chars of address for shorter key
  const shortAddr = `${wallet.slice(0, 10)}${wallet.slice(-8)}`;
  return `${baseKey}_${shortAddr}`;
}

/**
 * Get storage key for player data
 */
export function getPlayerStorageKey(address?: string): string {
  return getWalletStorageKey(STORAGE_KEYS.player, address);
}

/**
 * Get storage key for match history
 */
export function getMatchesStorageKey(address?: string): string {
  return getWalletStorageKey(STORAGE_KEYS.matches, address);
}

/**
 * Get storage key for achievements
 */
export function getAchievementsStorageKey(address?: string): string {
  return getWalletStorageKey(STORAGE_KEYS.achievements, address);
}

/**
 * Get storage key for settings (global, not wallet-specific)
 */
export function getSettingsStorageKey(): string {
  // Settings are global, not per-wallet
  return STORAGE_KEYS.settings;
}

/**
 * Check if data exists for a wallet
 */
export function hasWalletData(address: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = getPlayerStorageKey(address);
  return localStorage.getItem(key) !== null;
}

/**
 * Clear all data for a wallet
 */
export function clearWalletData(address: string): void {
  if (typeof window === 'undefined') return;
  const keys = [
    getPlayerStorageKey(address),
    getMatchesStorageKey(address),
    getAchievementsStorageKey(address),
  ];
  keys.forEach((key) => localStorage.removeItem(key));
}

/**
 * Get all wallet addresses that have data stored
 */
export function getStoredWallets(): string[] {
  if (typeof window === 'undefined') return [];

  const wallets: string[] = [];
  const prefix = STORAGE_KEYS.player + '_';

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      // Extract the wallet identifier from key
      const walletPart = key.slice(prefix.length);
      if (walletPart && !wallets.includes(walletPart)) {
        wallets.push(walletPart);
      }
    }
  }

  return wallets;
}

/**
 * Create a Zustand persist storage adapter that uses wallet-specific keys
 */
export function createWalletStorage(baseKey: string) {
  return {
    getItem: (name: string): string | null => {
      if (typeof window === 'undefined') return null;
      // Use wallet-specific key
      const key = getWalletStorageKey(baseKey);
      return localStorage.getItem(key);
    },
    setItem: (name: string, value: string): void => {
      if (typeof window === 'undefined') return;
      const key = getWalletStorageKey(baseKey);
      localStorage.setItem(key, value);
    },
    removeItem: (name: string): void => {
      if (typeof window === 'undefined') return;
      const key = getWalletStorageKey(baseKey);
      localStorage.removeItem(key);
    },
  };
}

/**
 * Migrate old global data to wallet-specific storage
 * Call this after wallet connection if user had existing data
 */
export function migrateGlobalDataToWallet(address: string): boolean {
  if (typeof window === 'undefined') return false;

  const walletKey = getPlayerStorageKey(address);

  // Check if wallet already has data
  if (localStorage.getItem(walletKey)) {
    return false; // Already has wallet-specific data
  }

  // Check if old global data exists
  const oldData = localStorage.getItem(STORAGE_KEYS.player);
  if (!oldData) {
    return false; // No old data to migrate
  }

  // Migrate player data
  localStorage.setItem(walletKey, oldData);

  // Migrate matches
  const oldMatches = localStorage.getItem(STORAGE_KEYS.matches);
  if (oldMatches) {
    localStorage.setItem(getMatchesStorageKey(address), oldMatches);
  }

  // Migrate achievements
  const oldAchievements = localStorage.getItem(STORAGE_KEYS.achievements);
  if (oldAchievements) {
    localStorage.setItem(getAchievementsStorageKey(address), oldAchievements);
  }

  console.log('[WalletStorage] Migrated global data to wallet:', address.slice(0, 10));
  return true;
}
