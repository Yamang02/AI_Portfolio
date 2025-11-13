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
}

const EasterEggContext = createContext<EasterEggStoreValue | undefined>(undefined);

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

  const triggerEasterEgg = useCallback(
    (id: string, context: EasterEggContext) => {
      if (!isEnabled) return;

      if (!isEasterEggMode && id !== 'name-click-5') {
        return;
      }

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

