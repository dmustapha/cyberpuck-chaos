// File: server/src/services/on-chain.ts
// Copied from ARCHITECTURE.md Section 8 (lines 1271-1439)
import { SuiClient } from '@onelabs/sui/client';
import { Transaction } from '@onelabs/sui/transactions';
import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import { MODIFIER_TYPE_ENCODING, TARGET_ENCODING } from '../types/shared';

const RECORDING_TIMEOUT_MS = 15_000;

// NOTE: These are functions, not constants, because dotenv.config() runs AFTER
// ESM imports evaluate their top-level code. Reading process.env at call time
// ensures the values are available.
function getRpcUrl(): string {
  return process.env.ONECHAIN_RPC_URL ?? 'https://rpc-testnet.onelabs.cc:443';
}
function getPackageId(): string {
  return process.env.CHAOS_PUCK_PACKAGE_ID ?? 'DEPLOY_AND_RECORD_ADDRESS_HERE';
}

export class OnChainService {
  private client: SuiClient;
  private keypair: Ed25519Keypair | null = null;

  constructor() {
    this.client = new SuiClient({ url: getRpcUrl() });

    const privKey = process.env.SERVER_PRIVATE_KEY;
    if (privKey) {
      try {
        // suiprivkey1q... bech32 format — fromSecretKey decodes it internally
        this.keypair = Ed25519Keypair.fromSecretKey(privKey);
        console.log(
          '[OnChain] Server wallet:',
          this.keypair.getPublicKey().toSuiAddress(),
        );
      } catch (err) {
        console.error('[OnChain] Invalid SERVER_PRIVATE_KEY:', (err as Error).message);
        console.error('[OnChain] Full error:', err);
      }
    } else {
      console.warn(
        '[OnChain] No SERVER_PRIVATE_KEY — on-chain recording disabled',
      );
    }
  }

  get enabled(): boolean {
    return (
      this.keypair !== null &&
      getPackageId() !== 'DEPLOY_AND_RECORD_ADDRESS_HERE'
    );
  }

  async recordMatch(data: {
    player1: string;
    player2: string;
    score1: number;
    score2: number;
    durationSeconds: number;
    modifiersDeployed: number;
    timestamp: number;
  }): Promise<{ digest: string; matchObjectId: string } | null> {
    if (!this.enabled || !this.keypair) return null;

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${getPackageId()}::chaos_puck::record_match`,
        arguments: [
          tx.pure.address(data.player1),
          tx.pure.address(data.player2),
          tx.pure.u8(data.score1),
          tx.pure.u8(data.score2),
          tx.pure.u64(data.durationSeconds),
          tx.pure.u8(data.modifiersDeployed),
          tx.pure.u64(data.timestamp),
        ],
      });

      const result = await Promise.race([
        this.client.signAndExecuteTransaction({
          transaction: tx,
          signer: this.keypair,
          options: { showEvents: true, showEffects: true },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('signAndExecuteTransaction timeout')), RECORDING_TIMEOUT_MS)
        ),
      ]);

      // Extract MatchRecord object ID from events
      const matchEvent = result.events?.find((e) =>
        e.type.includes('MatchRecorded'),
      );
      const matchObjectId =
        (matchEvent?.parsedJson as Record<string, string>)?.match_id ?? '';

      console.log('[OnChain] Match recorded:', result.digest);
      return { digest: result.digest, matchObjectId };
    } catch (err) {
      console.error('[OnChain] recordMatch failed:', err);
      return null;
    }
  }

  async recordDecision(data: {
    matchObjectId: string;
    modifierType: string;
    target: string;
    reason: string;
    timestamp: number;
  }): Promise<string | null> {
    if (!this.enabled || !this.keypair) return null;

    try {
      const tx = new Transaction();
      const reasonBytes = Array.from(new TextEncoder().encode(data.reason));

      tx.moveCall({
        target: `${getPackageId()}::chaos_puck::record_decision`,
        // WARNING: match_id is type ID in Move. Passing as address since ID wraps address.
        // [UNVERIFIED] — ID serialization via tx.pure.address() may need BCS approach
        arguments: [
          tx.pure.address(data.matchObjectId),
          tx.pure.u8(
            MODIFIER_TYPE_ENCODING[
              data.modifierType as keyof typeof MODIFIER_TYPE_ENCODING
            ] ?? 0,
          ),
          tx.pure.u8(
            TARGET_ENCODING[
              data.target as keyof typeof TARGET_ENCODING
            ] ?? 0,
          ),
          tx.pure.vector('u8', reasonBytes),
          tx.pure.u64(data.timestamp),
        ],
      });

      const result = await Promise.race([
        this.client.signAndExecuteTransaction({
          transaction: tx,
          signer: this.keypair,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('signAndExecuteTransaction timeout')), RECORDING_TIMEOUT_MS)
        ),
      ]);

      console.log('[OnChain] Decision recorded:', result.digest);
      return result.digest;
    } catch (err) {
      console.error('[OnChain] recordDecision failed:', err);
      return null;
    }
  }

  async recordMatchWithDecisions(
    matchData: {
      player1: string;
      player2: string;
      score1: number;
      score2: number;
      durationSeconds: number;
      modifiersDeployed: number;
      timestamp: number;
    },
    decisions: Array<{
      modifierType: string;
      target: string;
      reason: string;
      timestamp: number;
    }>,
  ): Promise<{ digest: string; matchObjectId: string } | null> {
    const matchResult = await this.recordMatch(matchData);
    if (!matchResult) return null;

    // Record each AI decision with the match ID
    for (const decision of decisions) {
      await this.recordDecision({
        matchObjectId: matchResult.matchObjectId,
        ...decision,
      });
    }

    return matchResult;
  }
}
