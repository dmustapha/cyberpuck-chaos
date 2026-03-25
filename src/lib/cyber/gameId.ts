/**
 * Game ID Utilities
 *
 * Generates and validates unique game IDs for multiplayer matches.
 * Format: XXXX-XXXX (8 alphanumeric characters with dash)
 */

// Characters used for game ID (excluding confusing chars like 0/O, 1/I/L)
const GAME_ID_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique game ID
 * Format: XXXX-XXXX
 */
export function generateGameId(): string {
  const part1 = generatePart(4);
  const part2 = generatePart(4);
  return `${part1}-${part2}`;
}

/**
 * Generate a random string of specified length
 */
function generatePart(length: number): string {
  let result = '';
  const randomValues = new Uint32Array(length);

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback for SSR
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * GAME_ID_CHARS.length);
    }
  }

  for (let i = 0; i < length; i++) {
    result += GAME_ID_CHARS[randomValues[i] % GAME_ID_CHARS.length];
  }

  return result;
}

/**
 * Validate game ID format
 */
export function isValidGameId(id: string): boolean {
  if (!id) return false;

  // Normalize and check format
  const normalized = normalizeGameId(id);
  const pattern = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/;

  return pattern.test(normalized);
}

/**
 * Normalize game ID (uppercase, add dash if missing)
 */
export function normalizeGameId(id: string): string {
  // Remove all non-alphanumeric characters and uppercase
  const clean = id.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // If 8 characters, add dash in middle
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }

  // Return as-is if already has dash in correct position
  return id.toUpperCase();
}

/**
 * Format game ID for display (with dash)
 */
export function formatGameId(id: string): string {
  return normalizeGameId(id);
}

/**
 * Get short display version of game ID
 */
export function shortGameId(id: string): string {
  return normalizeGameId(id);
}

/**
 * Parse game ID from URL or input
 */
export function parseGameId(input: string): string | null {
  const normalized = normalizeGameId(input.trim());
  return isValidGameId(normalized) ? normalized : null;
}
