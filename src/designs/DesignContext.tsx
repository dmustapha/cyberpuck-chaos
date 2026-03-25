'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DesignId, DesignConfig } from './types';

// Import all design configs
import { neonArcadeConfig } from './neon-arcade/config';
import { minimalistConfig } from './minimalist/config';
import { retroPixelConfig } from './retro-pixel/config';
import { iceStadiumConfig } from './ice-stadium/config';
import { cyberEsportsConfig } from './cyber-esports/config';
import { tokyoDriftConfig } from './tokyo-drift/config';
import { arcticFrostConfig } from './arctic-frost/config';
import { moltenCoreConfig } from './molten-core/config';
import { synthwaveSunsetConfig } from './synthwave-sunset/config';
import { midnightClubConfig } from './midnight-club/config';

const designConfigs: Record<DesignId, DesignConfig> = {
  'neon-arcade': neonArcadeConfig,
  'minimalist': minimalistConfig,
  'retro-pixel': retroPixelConfig,
  'ice-stadium': iceStadiumConfig,
  'cyber-esports': cyberEsportsConfig,
  'tokyo-drift': tokyoDriftConfig,
  'arctic-frost': arcticFrostConfig,
  'molten-core': moltenCoreConfig,
  'synthwave-sunset': synthwaveSunsetConfig,
  'midnight-club': midnightClubConfig,
};

interface DesignContextType {
  designId: DesignId;
  config: DesignConfig;
  setDesign: (id: DesignId) => void;
  allDesigns: DesignConfig[];
}

const DesignContext = createContext<DesignContextType | null>(null);

interface DesignProviderProps {
  children: ReactNode;
  initialDesign?: DesignId;
}

// Validate if a string is a valid DesignId
function isValidDesignId(id: string): id is DesignId {
  return id in designConfigs;
}

const DEFAULT_DESIGN: DesignId = 'cyber-esports';

export function DesignProvider({ children, initialDesign }: DesignProviderProps) {
  // Validate initialDesign, fall back to default if invalid
  const validInitialDesign = initialDesign && isValidDesignId(initialDesign)
    ? initialDesign
    : DEFAULT_DESIGN;

  const [designId, setDesignId] = useState<DesignId>(validInitialDesign);

  // Load saved preference only if no initial design is provided
  useEffect(() => {
    if (initialDesign && isValidDesignId(initialDesign)) {
      setDesignId(initialDesign);
      return;
    }
    const saved = localStorage.getItem('air-hockey-design');
    if (saved && isValidDesignId(saved)) {
      setDesignId(saved);
    }
  }, [initialDesign]);

  const setDesign = (id: DesignId) => {
    if (!isValidDesignId(id)) return;
    setDesignId(id);
    localStorage.setItem('air-hockey-design', id);
  };

  const config = designConfigs[designId];
  const allDesigns = Object.values(designConfigs);

  return (
    <DesignContext.Provider value={{ designId, config, setDesign, allDesigns }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
