import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { ActiveEasterEgg, EasterEggState, EasterEggContext, EasterEggResource } from '../model/easter-egg.types';
import { easterEggRegistry } from '../registry/easterEggRegistry';
import { resourcePreloader, type PreloadStatus } from '../lib/resourcePreloader';

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
  preloadStatus: PreloadStatus | null;
  isPreloading: boolean;
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
  const [preloadStatus, setPreloadStatus] = useState<PreloadStatus | null>(null);
  const [isPreloading, setIsPreloading] = useState(false);

  const triggerEasterEgg = useCallback(
    (id: string, context: EasterEggContext) => {
      if (!isEnabled) return;

      // 이펙트 정보 가져오기
      const effect = easterEggRegistry.getEffect(id);
      const isAlwaysEnabled = effect?.alwaysEnabled ?? false;

      // 이스터에그 모드가 아니고 항상 활성화되지 않은 경우 차단
      if (!isEasterEggMode && !isAlwaysEnabled) {
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

  const enableEasterEggMode = useCallback(async () => {
    setIsEasterEggMode(true);

    // 백그라운드에서 리소스 프리로드 시작
    setIsPreloading(true);
    try {
      const status = await resourcePreloader.preloadAll();
      setPreloadStatus(status);

      if (status.failedResources.length > 0) {
        console.warn('일부 리소스 로드 실패:', status.failedResources);
      }
    } catch (error) {
      console.error('리소스 프리로드 실패:', error);
    } finally {
      setIsPreloading(false);
    }
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
    preloadStatus,
    isPreloading,
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

