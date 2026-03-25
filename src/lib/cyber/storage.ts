/**
 * localStorage Wrapper for Cyber Esports Air Hockey
 * Provides versioned storage with migration support
 */

// Storage version for migrations
const STORAGE_VERSION = 1;
const VERSION_KEY = 'cyber_hockey_version';

// Storage keys
export const STORAGE_KEYS = {
  player: 'cyber_hockey_player',
  matches: 'cyber_hockey_matches',
  achievements: 'cyber_hockey_achievements',
  settings: 'cyber_hockey_settings',
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Check if localStorage is available
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get stored version
 */
function getStoredVersion(): number {
  if (!isStorageAvailable()) return 0;
  const version = localStorage.getItem(VERSION_KEY);
  return version ? parseInt(version, 10) : 0;
}

/**
 * Set storage version
 */
function setStoredVersion(version: number): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(VERSION_KEY, version.toString());
}

/**
 * Run migrations if needed
 */
export function runMigrations(): void {
  const storedVersion = getStoredVersion();

  if (storedVersion < STORAGE_VERSION) {
    // Add migrations here as needed
    // For version 1, no migrations needed (initial version)

    setStoredVersion(STORAGE_VERSION);
  }
}

/**
 * Save data to localStorage
 */
export function saveToStorage<T>(key: StorageKey, data: T): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error);
    return false;
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: StorageKey): T | null {
  if (!isStorageAvailable()) return null;

  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return null;
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error);
    return null;
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: StorageKey): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem(VERSION_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
}

/**
 * Get storage usage in bytes (approximate)
 */
export function getStorageUsage(): number {
  if (!isStorageAvailable()) return 0;

  let total = 0;
  Object.values(STORAGE_KEYS).forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      total += key.length + value.length;
    }
  });
  return total * 2; // UTF-16 encoding
}

/**
 * Check if storage is near limit (5MB default)
 */
export function isStorageNearLimit(threshold = 0.9): boolean {
  const usage = getStorageUsage();
  const limit = 5 * 1024 * 1024; // 5MB
  return usage > limit * threshold;
}

/**
 * Export all data for backup
 */
export function exportAllData(): Record<string, unknown> | null {
  if (!isStorageAvailable()) return null;

  const data: Record<string, unknown> = {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
  };

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = loadFromStorage(key);
    if (value) {
      data[name] = value;
    }
  });

  return data;
}

/**
 * Import data from backup
 */
export function importData(data: Record<string, unknown>): boolean {
  if (!isStorageAvailable()) return false;

  try {
    // Validate data has expected structure
    if (typeof data !== 'object' || !data.version) {
      throw new Error('Invalid backup data format');
    }

    // Import each key
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name]) {
        saveToStorage(key, data[name]);
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
