'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useOnChainRecording() {
  const status = useGameStore((s) => s.status);
  const mode = useGameStore((s) => s.mode);
  const setTxResult = useGameStore((s) => s.setTxResult);
  const getMatchResult = useGameStore((s) => s.getMatchResult);
  const { address } = useDynamicWallet();
  const firedRef = useRef(false);

  useEffect(() => {
    if (status !== 'gameover' || mode !== 'ai') {
      firedRef.current = false;
      return;
    }
    if (firedRef.current) return;
    firedRef.current = true;

    const result = getMatchResult();

    fetch(`${API_URL}/api/record-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerWallet: address,
        score1: result.scores.player1,
        score2: result.scores.player2,
        durationSeconds: result.duration,
        modifiersDeployed: 0,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.digest) {
          setTxResult(data.digest, data.explorerUrl);
        }
      })
      .catch((err) => console.error('[OnChainRecording] Failed:', err));
  }, [status, mode, address, setTxResult, getMatchResult]);
}
