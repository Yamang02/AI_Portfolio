/**
 * 이스터에그 트리거 감지 훅
 */

import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '../lib/debounce';
import { findMatchingTriggers } from '../lib/trigger-matcher';
import { useEasterEggStore } from '../store/easterEggStore';
import { easterEggRegistry } from '../registry/easterEggRegistry';
import { triggerEasterEggs } from '../lib/easter-egg-utils';

interface UseEasterEggTriggerOptions {
  /** 디바운스 지연 시간 (ms, 기본값: 300) */
  debounceMs?: number;
  /** 채팅 입력 값 */
  inputValue: string;
  /** 입력 값이 변경될 때마다 호출되는 콜백 */
  onInputChange?: (value: string) => void;
}

/**
 * 채팅 입력에서 이스터에그 트리거를 감지하는 훅
 */
export function useEasterEggTrigger({
  debounceMs = 300,
  inputValue,
  onInputChange,
}: UseEasterEggTriggerOptions): void {
  const { triggerEasterEgg, isEnabled } = useEasterEggStore();
  const previousValueRef = useRef<string>('');
  const debouncedCheckRef = useRef<ReturnType<typeof debounce> | null>(null);

  // 디바운스된 체크 함수 생성
  const createDebouncedCheck = useCallback(() => {
    return debounce(() => {
      const triggers = easterEggRegistry.getEnabledTriggers();
      const matchingTriggers = findMatchingTriggers(inputValue, triggers);
      
      if (matchingTriggers.length > 0) {
        triggerEasterEggs(matchingTriggers, inputValue, triggerEasterEgg);
      }
    }, debounceMs);
  }, [inputValue, debounceMs, triggerEasterEgg]);

  useEffect(() => {
    if (!isEnabled || !inputValue.trim()) {
      previousValueRef.current = inputValue;
      return;
    }

    // 입력 값이 변경되지 않았으면 스킵
    if (inputValue === previousValueRef.current) {
      return;
    }

    // 기존 디바운스 함수 정리
    if (debouncedCheckRef.current) {
      // 디바운스 함수는 클린업할 수 없으므로, 새로운 함수를 생성
    }

    // 새로운 디바운스 함수 생성 및 실행
    debouncedCheckRef.current = createDebouncedCheck();
    debouncedCheckRef.current();
    previousValueRef.current = inputValue;

    // 클린업은 debounce 함수의 특성상 불가능하지만, 
    // 컴포넌트 언마운트 시에는 자동으로 정리됨
  }, [inputValue, isEnabled, createDebouncedCheck]);

  // 입력 값 변경 시 콜백 호출
  useEffect(() => {
    onInputChange?.(inputValue);
  }, [inputValue, onInputChange]);
}

/**
 * ESC 키로 모든 이스터에그 종료
 */
export function useEasterEggEscapeKey(): void {
  const { dismissAll } = useEasterEggStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissAll();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [dismissAll]);
}

