import { useCallback, useEffect, useState } from 'react';
import { useMotionValue } from 'motion/react';
import type { MotionValue } from 'motion/react';

const ROLE_DURATION_MS = 3000;

export type RolePlayState = 'playing' | 'paused';

interface UseRoleCycleOptions {
  readonly roleCount: number;
  readonly isInView: boolean;
  readonly isDocumentVisible: boolean;
  readonly isTabListFocused: boolean;
  readonly isEntryAnimationComplete: boolean;
  readonly prefersReducedMotion: boolean;
}

interface RoleCycleState {
  readonly activeIndex: number;
  readonly playState: RolePlayState;
  readonly progress: MotionValue<number>;
  readonly isRunning: boolean;
  readonly selectRole: (index: number) => void;
  readonly togglePlayback: () => void;
}

export function useRoleCycle({
  roleCount,
  isInView,
  isDocumentVisible,
  isTabListFocused,
  isEntryAnimationComplete,
  prefersReducedMotion,
}: UseRoleCycleOptions): RoleCycleState {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playState, setPlayState] = useState<RolePlayState>('playing');
  const progress = useMotionValue(0);
  const isSuspended = !isInView || !isDocumentVisible || isTabListFocused || !isEntryAnimationComplete;
  const isRunning = playState === 'playing' && !isSuspended;

  useEffect(() => {
    if (prefersReducedMotion) {
      setPlayState('paused');
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!isRunning || roleCount < 1) {
      return;
    }

    let frameId = 0;
    let previousTime: number | null = null;

    const tick = (time: number) => {
      if (previousTime === null) {
        previousTime = time;
      } else {
        const nextProgress = progress.get() + (time - previousTime) / ROLE_DURATION_MS;
        previousTime = time;

        if (nextProgress >= 1) {
          progress.set(0);
          setActiveIndex(index => (index + 1) % roleCount);
        } else {
          progress.set(nextProgress);
        }
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isRunning, progress, roleCount]);

  const selectRole = useCallback((index: number) => {
    const nextIndex = Math.min(roleCount - 1, Math.max(0, index));
    setActiveIndex(nextIndex);
    setPlayState('paused');
    progress.set(0);
  }, [progress, roleCount]);

  const togglePlayback = useCallback(() => {
    setPlayState(state => state === 'playing' ? 'paused' : 'playing');
  }, []);

  return { activeIndex, playState, progress, isRunning, selectRole, togglePlayback };
}
