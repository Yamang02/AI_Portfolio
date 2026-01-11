import { useEffect, useRef, useCallback } from 'react';

/**
 * API 로딩 후 페이지 높이 재계산을 위한 훅
 * 
 * 문제: API 결과가 도착하기 전에 페이지 높이가 계산되어 
 * 스크롤을 내려도 모든 콘텐츠를 못 보는 경우가 있음
 * 
 * 해결 방법:
 * 1. ResizeObserver로 DOM 크기 변경 감지
 * 2. 스크롤이 하단에 도달했을 때 컨텐츠가 모두 보이는지 체크
 * 3. API 로딩 완료 후 강제로 스크롤 재계산
 * 
 * @param isLoading - API 로딩 상태
 * @param dependencies - 재계산을 트리거할 의존성 배열 (예: 데이터)
 * @param options - 옵션 설정
 */
export function useContentHeightRecalc(
  isLoading: boolean,
  dependencies: unknown[] = [],
  options: {
    /** 스크롤 하단 감지 임계값 (px) */
    scrollThreshold?: number;
    /** 재계산 딜레이 (ms) */
    recalcDelay?: number;
    /** ResizeObserver 사용 여부 */
    useResizeObserver?: boolean;
  } = {}
) {
  const {
    scrollThreshold = 100,
    recalcDelay = 100,
    useResizeObserver = true,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastHeightRef = useRef<number>(0);
  const recalcTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 페이지 높이 재계산
   * 브라우저에게 레이아웃을 다시 계산하도록 강제
   */
  const recalculateHeight = useCallback(() => {
    // 강제 리플로우 트리거
    if (document.body) {
      void document.body.offsetHeight;
    }
    
    // 스크롤 위치 재계산
    if (window.scrollY !== undefined) {
      const currentScroll = window.scrollY;
      window.scrollTo(0, currentScroll);
    }
  }, []);

  /**
   * 스크롤이 하단에 도달했는지 확인하고, 
   * 컨텐츠가 모두 보이지 않으면 재계산
   */
  const checkScrollBottom = useCallback(() => {
    if (isLoading) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // 하단에 근접했는지 확인
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
    
    if (distanceFromBottom <= scrollThreshold) {
      // 현재 문서 높이 확인
      const currentHeight = document.documentElement.scrollHeight;
      
      // 높이가 변경되었으면 재계산
      if (currentHeight !== lastHeightRef.current) {
        lastHeightRef.current = currentHeight;
        recalculateHeight();
      }
    }
  }, [isLoading, scrollThreshold, recalculateHeight]);

  /**
   * ResizeObserver 콜백
   * DOM 크기 변경 시 재계산
   */
  const handleResize = useCallback(() => {
    if (isLoading) return;

    // 디바운스 처리
    if (recalcTimeoutRef.current) {
      clearTimeout(recalcTimeoutRef.current);
    }

    recalcTimeoutRef.current = setTimeout(() => {
      const currentHeight = document.documentElement.scrollHeight;
      
      if (currentHeight !== lastHeightRef.current) {
        lastHeightRef.current = currentHeight;
        recalculateHeight();
      }
    }, recalcDelay);
  }, [isLoading, recalcDelay, recalculateHeight]);

  // ResizeObserver 설정
  useEffect(() => {
    if (!useResizeObserver || typeof ResizeObserver === 'undefined') {
      return;
    }

    // body 요소 관찰
    resizeObserverRef.current = new ResizeObserver(handleResize);
    resizeObserverRef.current.observe(document.body);

    return () => {
      if (recalcTimeoutRef.current) {
        clearTimeout(recalcTimeoutRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [useResizeObserver, handleResize]);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      checkScrollBottom();
    };

    // 스크롤 이벤트는 throttle 처리
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

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [isLoading, checkScrollBottom]);

  // API 로딩 완료 후 재계산
  useEffect(() => {
    if (isLoading) return;

    // 로딩 완료 후 약간의 지연을 두고 재계산
    // (이미지 로딩 등 비동기 작업 고려)
    const timeoutId = setTimeout(() => {
      recalculateHeight();
      lastHeightRef.current = document.documentElement.scrollHeight;
    }, recalcDelay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading, recalculateHeight, recalcDelay, ...dependencies]);

  // 초기 높이 저장
  useEffect(() => {
    lastHeightRef.current = document.documentElement.scrollHeight;
  }, []);

  return {
    containerRef,
    recalculateHeight,
  };
}
