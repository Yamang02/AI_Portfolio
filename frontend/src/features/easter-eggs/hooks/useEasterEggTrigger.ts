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

