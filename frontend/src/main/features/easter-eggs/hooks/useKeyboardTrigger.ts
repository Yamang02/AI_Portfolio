import { useEffect, useRef } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';
import type { EasterEggContext } from '../model/easter-egg.types';

interface UseKeyboardTriggerOptions {
  easterEggId: string;
  key: string; // 'PageDown', 'ArrowDown' 등
  targetCount: number;
  timeWindow?: number; // 밀리초 단위
}

/**
 * 특정 키를 연속으로 누르면 이스터 에그를 트리거하는 훅
 */
export function useKeyboardTrigger({
  easterEggId,
  key,
  targetCount,
  timeWindow = 3000, // 기본 3초
}: UseKeyboardTriggerOptions): void {
  const { triggerEasterEgg, isEnabled, isEasterEggMode } = useEasterEggStore();
  const countRef = useRef(0);
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 이스터에그 모드가 아니면 작동하지 않음
      if (!isEasterEggMode) return;

      // 지정된 키가 아니면 무시
      if (e.key !== key) return;

      const currentTime = Date.now();

      // 시간 윈도우를 벗어나면 카운트 리셋
      if (currentTime - lastKeyTimeRef.current > timeWindow) {
        countRef.current = 1;
        lastKeyTimeRef.current = currentTime;
      } else {
        countRef.current += 1;
        lastKeyTimeRef.current = currentTime;
      }

      // 기존 타임아웃 클리어
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 타겟 카운트에 도달하면 트리거
      if (countRef.current >= targetCount) {
        triggerEasterEgg(easterEggId, {
          message: `${key} 키 ${targetCount}회 입력`,
          timestamp: new Date(),
          metadata: {
            key,
            count: countRef.current,
            targetCount,
          },
        } as EasterEggContext);

        // 카운트 리셋
        countRef.current = 0;
        lastKeyTimeRef.current = 0;
      } else {
        // 타임아웃 설정: 시간 윈도우 내에 다음 키 입력이 없으면 리셋
        timeoutRef.current = setTimeout(() => {
          countRef.current = 0;
          lastKeyTimeRef.current = 0;
        }, timeWindow);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [easterEggId, key, targetCount, timeWindow, triggerEasterEgg, isEnabled, isEasterEggMode]);
}

