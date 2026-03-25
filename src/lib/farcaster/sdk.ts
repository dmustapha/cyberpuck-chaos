'use client';

import sdk from '@farcaster/miniapp-sdk';

let initialized = false;

export async function initFarcasterSDK(): Promise<void> {
  if (initialized) return;

  try {
    await sdk.actions.ready();
    initialized = true;
    console.log('[Farcaster] SDK ready');
  } catch (error) {
    console.warn('[Farcaster] SDK init failed (not in Mini App context):', error);
  }
}

export function isMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !!sdk.context;
  } catch {
    return false;
  }
}

export async function shareGameResult(text: string, gameUrl: string): Promise<boolean> {
  try {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(gameUrl)}`
    );
    return true;
  } catch (error) {
    console.warn('[Farcaster] Share failed:', error);
    return false;
  }
}

export async function getFarcasterUser(): Promise<{
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
} | null> {
  try {
    const context = await sdk.context;
    if (context?.user) {
      return {
        fid: context.user.fid,
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl,
      };
    }
  } catch {
    // Not in Mini App context
  }
  return null;
}

export { sdk };
