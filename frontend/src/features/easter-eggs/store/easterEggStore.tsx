/**
 * 이스터에그 상태 관리 (Context API)
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { ActiveEasterEgg, EasterEggState, EasterEggContext } from '../model/easter-egg.types';

interface EasterEggStoreValue extends EasterEggState {
  /** 이스터에그 트리거 */
  triggerEasterEgg: (id: string, context: EasterEggContext) => void;
  /** 이스터에그 종료 */
  dismissEasterEgg: (id: string) => void;
  /** 모든 이스터에그 종료 */
  dismissAll: () => void;
  /** 활성화 상태 토글 */
  toggleEnabled: () => void;
  /** 최대 동시 실행 수 설정 */
  setMaxConcurrent: (max: number) => void;
}

const EasterEggContext = createContext<EasterEggStoreValue | undefined>(undefined);

interface EasterEggProviderProps {
  children: ReactNode;
  /** 최대 동시 실행 가능한 이스터에그 수 (기본값: 1) */
  maxConcurrent?: number;
  /** 초기 활성화 상태 (기본값: true) */
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

  const triggerEasterEgg = useCallback(
    (id: string, context: EasterEggContext) => {
      if (!isEnabled) return;

      setActiveEffects(prev => {
        // 이미 활성화된 이스터에그인지 확인
        if (prev.some(effect => effect.id === id)) {
          return prev;
        }

        // 최대 동시 실행 수 확인
        const effectsToKeep = prev.length >= maxConcurrent 
          ? prev.slice(1) // 가장 오래된 이스터에그 제거 (FIFO)
          : prev;

        const newEffect: ActiveEasterEgg = {
          id,
          context,
          startTime: new Date(),
          zIndex: 1000 + effectsToKeep.length, // z-index 자동 할당
        };

        return [...effectsToKeep, newEffect];
      });
    },
    [isEnabled, maxConcurrent]
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
      // 비활성화 시 모든 이스터에그 종료
      dismissAll();
    }
  }, [isEnabled, dismissAll]);

  const setMaxConcurrent = useCallback((max: number) => {
    setMaxConcurrentState(max);
    // 현재 활성화된 이스터에그가 새로운 최대값을 초과하면 제거
    setActiveEffects(prev => {
      if (prev.length > max) {
        return prev.slice(0, max);
      }
      return prev;
    });
  }, []);

  const value: EasterEggStoreValue = {
    activeEffects,
    maxConcurrent,
    isEnabled,
    triggerEasterEgg,
    dismissEasterEgg,
    dismissAll,
    toggleEnabled,
    setMaxConcurrent,
  };

  return <EasterEggContext.Provider value={value}>{children}</EasterEggContext.Provider>;
};

/**
 * 이스터에그 스토어 훅
 */
export function useEasterEggStore(): EasterEggStoreValue {
  const context = useContext(EasterEggContext);
  if (context === undefined) {
    throw new Error('useEasterEggStore must be used within EasterEggProvider');
  }
  return context;
}

