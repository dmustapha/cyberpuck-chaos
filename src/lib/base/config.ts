import { baseSepolia, base } from 'wagmi/chains';

export const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const SUPPORTED_CHAINS = [baseSepolia, base] as const;

export const DEFAULT_CHAIN = baseSepolia;

export const BLOCK_EXPLORER_URL = {
  [baseSepolia.id]: 'https://sepolia.basescan.org',
  [base.id]: 'https://basescan.org',
} as const;

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const baseUrl =
    BLOCK_EXPLORER_URL[chainId as keyof typeof BLOCK_EXPLORER_URL];
  return baseUrl ? `${baseUrl}/tx/${txHash}` : '#';
}
