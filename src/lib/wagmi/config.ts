import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Detect if running inside Farcaster Mini App
const isMiniApp = typeof window !== 'undefined' && (
  window.parent !== window || // iframe
  navigator.userAgent.includes('Warpcast')
);

// Use Farcaster connector inside Mini App, RainbowKit outside
export const config = isMiniApp
  ? createConfig({
      chains: [baseSepolia, base],
      transports: {
        [baseSepolia.id]: http(),
        [base.id]: http(),
      },
      connectors: [farcasterMiniApp()],
      ssr: true,
    })
  : getDefaultConfig({
      appName: 'Cyber Air Hockey',
      projectId,
      chains: [baseSepolia, base],
      ssr: true,
    });

export { projectId };
