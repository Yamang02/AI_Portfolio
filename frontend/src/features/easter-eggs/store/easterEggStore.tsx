import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ActiveEasterEgg, EasterEggState, EasterEggContext } from '../model/easter-egg.types';

interface EasterEggStoreValue extends EasterEggState {
  triggerEasterEgg: (id: string, context: EasterEggContext) => void;
  dismissEasterEgg: (id: string) => void;
  dismissAll: () => void;
  toggleEnabled: () => void;
  setMaxConcurrent: (max: number) => void;
  toggleEasterEggMode: () => void;
  enableEasterEggMode: () => void;
  discoveredEasterEggs: Set<string>;
  markEasterEggDiscovered: (id: string) => void;
  isEasterEggDiscovered: (id: string) => boolean;
}

const EasterEggContext = createContext<EasterEggStoreValue | undefined>(undefined);

const DISCOVERED_EASTER_EGGS_KEY = 'portfolio-discovered-easter-eggs';

// localStorage에서 발견된 이스터에그 목록 로드
const loadDiscoveredEasterEggs = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(DISCOVERED_EASTER_EGGS_KEY);
    if (stored) {
      const ids = JSON.parse(stored) as string[];
      return new Set(ids);
    }
  } catch (error) {
    console.error('Failed to load discovered easter eggs:', error);
  }
  
  return new Set();
};

// localStorage에 발견된 이스터에그 목록 저장
const saveDiscoveredEasterEggs = (discovered: Set<string>) => {
  if (typeof window === 'undefined') return;
  
  try {
    const ids = Array.from(discovered);
    localStorage.setItem(DISCOVERED_EASTER_EGGS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Failed to save discovered easter eggs:', error);
  }
};

interface EasterEggProviderProps {
  children: ReactNode;
  maxConcurrent?: number;
  initialEnabled?: boolean;
}

export const EasterEggProvider: React.FC<EasterEggProviderProps> = ({
  children,
  maxConcurrent: initialMaxConcurrent = 1,
  initialEnabled = true,
}) => {
  const [activeEffects, setActiveEffects] = useState<ActiveEasterEgg[]>([]);
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [maxConcurrent, setMaxConcurrentState] = useState(initialMaxConcurrent);
  const [isEasterEggMode, setIsEasterEggMode] = useState(false);
  const [discoveredEasterEggs, setDiscoveredEasterEggs] = useState<Set<string>>(() => 
    loadDiscoveredEasterEggs()
  );

  const triggerEasterEgg = useCallback(
    (id: string, context: EasterEggContext) => {
      if (!isEnabled) return;

      if (!isEasterEggMode && id !== 'name-click-5') {
        return;
      }

      // 이스터에그 발견 기록
      setDiscoveredEasterEggs(prev => {
        if (prev.has(id)) {
          return prev;
        }
        const newSet = new Set(prev);
        newSet.add(id);
        saveDiscoveredEasterEggs(newSet);
        return newSet;
      });

      setActiveEffects(prev => {
        if (prev.some(effect => effect.id === id)) {
          return prev;
        }

        const effectsToKeep = prev.length >= maxConcurrent 
          ? prev.slice(1)
          : prev;

        const newEffect: ActiveEasterEgg = {
          id,
          context,
          startTime: new Date(),
          zIndex: 1000 + effectsToKeep.length,
        };

        return [...effectsToKeep, newEffect];
      });
    },
    [isEnabled, isEasterEggMode, maxConcurrent]
  );

  const dismissEasterEgg = useCallback((id: string) => {
    setActiveEffects(prev => prev.filter(effect => effect.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setActiveEffects([]);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (isEnabled) {
      dismissAll();
    }
  }, [isEnabled, dismissAll]);

  const setMaxConcurrent = useCallback((max: number) => {
    setMaxConcurrentState(max);
    setActiveEffects(prev => {
      if (prev.length > max) {
        return prev.slice(0, max);
      }
      return prev;
    });
  }, []);

  const toggleEasterEggMode = useCallback(() => {
    setIsEasterEggMode(prev => !prev);
  }, []);

  const enableEasterEggMode = useCallback(() => {
    setIsEasterEggMode(true);
  }, []);

  const markEasterEggDiscovered = useCallback((id: string) => {
    setDiscoveredEasterEggs(prev => {
      if (prev.has(id)) {
        return prev;
      }
      const newSet = new Set(prev);
      newSet.add(id);
      saveDiscoveredEasterEggs(newSet);
      return newSet;
    });
  }, []);

  const isEasterEggDiscovered = useCallback((id: string) => {
    return discoveredEasterEggs.has(id);
  }, [discoveredEasterEggs]);

  const value: EasterEggStoreValue = {
    activeEffects,
    maxConcurrent,
    isEnabled,
    isEasterEggMode,
    triggerEasterEgg,
    dismissEasterEgg,
    dismissAll,
    toggleEnabled,
    setMaxConcurrent,
    toggleEasterEggMode,
    enableEasterEggMode,
    discoveredEasterEggs,
    markEasterEggDiscovered,
    isEasterEggDiscovered,
  };

  return <EasterEggContext.Provider value={value}>{children}</EasterEggContext.Provider>;
};

export function useEasterEggStore(): EasterEggStoreValue {
  const context = useContext(EasterEggContext);
  if (context === undefined) {
    throw new Error('useEasterEggStore must be used within EasterEggProvider');
  }
  return context;
}

