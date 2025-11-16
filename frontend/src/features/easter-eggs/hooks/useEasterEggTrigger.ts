import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '../lib/debounce';
import { findMatchingTriggers } from '../lib/trigger-matcher';
import { useEasterEggStore } from '../store/easterEggStore';
import { easterEggRegistry } from '../registry/easterEggRegistry';
import { triggerEasterEggs } from '../lib/easter-egg-utils';

interface UseEasterEggTriggerOptions {
  debounceMs?: number;
  inputValue: string;
  onInputChange?: (value: string) => void;
}

export function useEasterEggTrigger({
  debounceMs = 300,
  inputValue,
  onInputChange,
}: UseEasterEggTriggerOptions): void {
  const { triggerEasterEgg, isEnabled, isEasterEggMode } = useEasterEggStore();
  const previousValueRef = useRef<string>('');
  const debouncedCheckRef = useRef<ReturnType<typeof debounce> | null>(null);

  const createDebouncedCheck = useCallback(() => {
    return debounce(() => {
      if (!isEasterEggMode) {
        return;
      }

      const triggers = easterEggRegistry.getEnabledTriggers();
      const matchingTriggers = findMatchingTriggers(inputValue, triggers);
      
      if (matchingTriggers.length > 0) {
        triggerEasterEggs(matchingTriggers, inputValue, triggerEasterEgg);
      }
    }, debounceMs);
  }, [inputValue, debounceMs, triggerEasterEgg, isEasterEggMode]);

  useEffect(() => {
    if (!isEnabled || !inputValue.trim()) {
      previousValueRef.current = inputValue;
      return;
    }

    if (!isEasterEggMode) {
      previousValueRef.current = inputValue;
      return;
    }

    if (inputValue === previousValueRef.current) {
      return;
    }

    if (debouncedCheckRef.current) {
    }

    debouncedCheckRef.current = createDebouncedCheck();
    debouncedCheckRef.current();
    previousValueRef.current = inputValue;
  }, [inputValue, isEnabled, isEasterEggMode, createDebouncedCheck]);

  useEffect(() => {
    onInputChange?.(inputValue);
  }, [inputValue, onInputChange]);
}

export function useEasterEggEscapeKey(): void {
  const { dismissAll, activeEffects } = useEasterEggStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      // 이스터에그가 동작 중일 때만 ESC로 중단
      if (e.key === 'Escape' && activeEffects.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        dismissAll();
      }
    };

    window.addEventListener('keydown', handleEscape, true); // capture phase에서 처리하여 다른 핸들러보다 먼저 실행
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [dismissAll, activeEffects]);
}

