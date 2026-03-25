// File: src/hooks/usePlayerProfile.ts
'use client';

import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ONECHAIN_CONFIG } from '../lib/onechain/config';

interface PlayerProfile {
  objectId: string;
  elo: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  modifiersSurvived: number;
}

export function usePlayerProfile() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const packageId = ONECHAIN_CONFIG.packageId;

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['playerProfile', account?.address],
    queryFn: async (): Promise<PlayerProfile | null> => {
      if (!account) return null;

      const objects = await client.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${packageId}::chaos_puck::PlayerProfile`,
        },
        options: { showContent: true },
      });

      if (objects.data.length === 0) return null;

      const obj = objects.data[0];
      const content = obj.data?.content;
      if (content?.dataType !== 'moveObject') return null;

      const fields = content.fields as Record<string, string>;
      return {
        objectId: obj.data!.objectId,
        elo: Number(fields.elo),
        wins: Number(fields.wins),
        losses: Number(fields.losses),
        matchesPlayed: Number(fields.matches_played),
        modifiersSurvived: Number(fields.modifiers_survived),
      };
    },
    enabled: !!account && packageId !== 'DEPLOY_AND_RECORD_ADDRESS_HERE',
    staleTime: 30_000,
  });

  const createProfile = async (): Promise<void> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::chaos_puck::create_profile`,
    });
    await signAndExecute({ transaction: tx });
    await queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
  };

  const updateProfileWin = async (
    eloGain: number,
    modifiersSurvived: number,
  ): Promise<void> => {
    if (!profile) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::chaos_puck::update_profile_win`,
      arguments: [
        tx.object(profile.objectId),
        tx.pure.u64(eloGain),
        tx.pure.u64(modifiersSurvived),
      ],
    });
    await signAndExecute({ transaction: tx });
    await refetch();
  };

  const updateProfileLoss = async (
    eloLoss: number,
    modifiersSurvived: number,
  ): Promise<void> => {
    if (!profile) return;
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::chaos_puck::update_profile_loss`,
      arguments: [
        tx.object(profile.objectId),
        tx.pure.u64(eloLoss),
        tx.pure.u64(modifiersSurvived),
      ],
    });
    await signAndExecute({ transaction: tx });
    await refetch();
  };

  return {
    profile,
    isLoading,
    isConnected: !!account,
    createProfile,
    updateProfileWin,
    updateProfileLoss,
    refetch,
  };
}
