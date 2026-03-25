// File: src/lib/onechain/config.ts
// NEXT_PUBLIC_ prefix required for client-side env vars (TRAP: undefined without it)
export const ONECHAIN_CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_ONECHAIN_RPC_URL ?? 'https://rpc-testnet.onelabs.cc:443',
  packageId: process.env.NEXT_PUBLIC_CHAOS_PUCK_PACKAGE_ID ?? 'DEPLOY_AND_RECORD_ADDRESS_HERE',
  explorerUrl: 'https://onescan.cc/testnet',
  network: 'testnet' as const,
} as const;
