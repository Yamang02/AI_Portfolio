import { useState, useRef, useCallback } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';
import type { EasterEggContext } from '../model/easter-egg.types';

interface UseClickCounterOptions {
  easterEggId: string;
  targetCount: number;
  timeWindow?: number;
  onCountChange?: (count: number) => void;
}

export function useClickCounter({
  easterEggId,
  targetCount,
  timeWindow = 3000,
  onCountChange,
}: UseClickCounterOptions) {
  const { triggerEasterEgg } = useEasterEggStore();
  const [clickCount, setClickCount] = useState(0);
  const lastClickTimeRef = useRef<number>(0);

  const handleClick = useCallback(() => {
    const currentTime = Date.now();
    
    if (currentTime - lastClickTimeRef.current > timeWindow) {
      setClickCount(1);
      lastClickTimeRef.current = currentTime;
      onCountChange?.(1);
      return;
    }
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    lastClickTimeRef.current = currentTime;
    onCountChange?.(newCount);
    
    if (newCount >= targetCount) {
      triggerEasterEgg(easterEggId, {
        message: `이름 클릭 ${targetCount}회`,
        timestamp: new Date(),
        metadata: {
          clickCount: newCount,
          targetCount,
        },
      });
      
      setClickCount(0);
      onCountChange?.(0);
    }
  }, [clickCount, targetCount, timeWindow, easterEggId, triggerEasterEgg, onCountChange]);

  return {
    clickCount,
    handleClick,
  };
}

