// File: src/hooks/useAudio.ts
'use client';

import { useEffect, useCallback, useState } from 'react';
import { audioManager } from '../lib/audio/AudioManager';

type SoundName =
  | 'wallHit'
  | 'paddleHit'
  | 'goalScored'
  | 'countdown'
  | 'matchStart'
  | 'modifierActivate'
  | 'modifierExpire'
  | 'victory';

export function useAudio() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    audioManager.init();
  }, []);

  const play = useCallback((name: SoundName) => {
    audioManager.play(name);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = audioManager.toggleMute();
    setMuted(newMuted);
  }, []);

  return { play, muted, toggleMute };
}
