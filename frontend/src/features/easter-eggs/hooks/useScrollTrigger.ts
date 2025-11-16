import { useEffect, useRef } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';
import type { EasterEggContext } from '../model/easter-egg.types';

interface UseScrollTriggerOptions {
  easterEggId: string;
  timeWindow?: number; // 밀리초 단위 (기본 5초)
}

/**
 * 페이지를 위에서 아래로 빠르게 스크롤하면 이스터 에그를 트리거하는 훅
 */
export function useScrollTrigger({
  easterEggId,
  timeWindow = 5000, // 기본 5초
}: UseScrollTriggerOptions): void {
  const { triggerEasterEgg, isEnabled, isEasterEggMode } = useEasterEggStore();
  const scrollStartRef = useRef<number | null>(null);
  const scrollStartTimeRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    const handleScroll = () => {
      // 이스터에그 모드가 아니면 작동하지 않음
      if (!isEasterEggMode) return;

      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentTime = Date.now();

      // 스크롤 시작 감지 (맨 위에서 시작)
      if (currentScroll <= 10 && scrollStartRef.current === null) {
        scrollStartRef.current = currentScroll;
        scrollStartTimeRef.current = currentTime;
        hasTriggeredRef.current = false;

        // 기존 타임아웃 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 시간 윈도우 내에 끝까지 스크롤하지 않으면 리셋
        timeoutRef.current = setTimeout(() => {
          scrollStartRef.current = null;
          scrollStartTimeRef.current = null;
        }, timeWindow);
        return;
      }

      // 스크롤이 시작되었고, 맨 아래에 도달했는지 확인
      if (
        scrollStartRef.current !== null &&
        scrollStartTimeRef.current !== null &&
        !hasTriggeredRef.current
      ) {
        // 맨 아래에 도달 (거의 끝까지 스크롤)
        if (currentScroll >= maxScroll - 10) {
          const elapsedTime = currentTime - scrollStartTimeRef.current;

          // 시간 윈도우 내에 도달했는지 확인
          if (elapsedTime <= timeWindow) {
            triggerEasterEgg(easterEggId, {
              message: `위에서 아래로 빠른 스크롤`,
              timestamp: new Date(),
              metadata: {
                scrollStart: scrollStartRef.current,
                scrollEnd: currentScroll,
                elapsedTime,
                timeWindow,
              },
            } as EasterEggContext);

            hasTriggeredRef.current = true;
          }

          // 리셋
          scrollStartRef.current = null;
          scrollStartTimeRef.current = null;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        }
      }
    };

    // 스크롤 이벤트 리스너 등록 (throttle 적용)
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('wheel', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('wheel', throttledHandleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [easterEggId, timeWindow, triggerEasterEgg, isEnabled, isEasterEggMode]);
}

