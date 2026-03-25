// File: src/components/ui/WalletConnect.tsx
'use client';

import { ConnectButton, useCurrentAccount } from '@onelabs/dapp-kit';

export function WalletConnect() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center gap-3">
      <ConnectButton />
      {account && (
        <span className="text-xs text-cyan-400 font-mono opacity-70">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
      )}
    </div>
  );
}
