import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 페이지 스크롤 정책 타입
 */
export type ScrollPolicy = 'window' | 'internal' | 'preserve' | 'top';

/**
 * 페이지 라이프사이클 설정
 */
export interface PageLifecycleConfig {
  /**
   * 스크롤 정책
   * - 'window': 페이지 전환 시 윈도우 스크롤을 상단으로 이동
   * - 'internal': 내부 스크롤 컨테이너 사용 (스크롤 위치 변경 없음)
   * - 'preserve': 스크롤 위치 보존
   * - 'top': 항상 상단으로 이동
   */
  scrollPolicy?: ScrollPolicy;
  
  /**
   * 스크롤 위치 복원 여부
   */
  restoreScroll?: boolean;
  
  /**
   * 페이지 마운트 시 실행할 콜백
   */
  onMount?: () => void | (() => void);
  
  /**
   * 페이지 언마운트 시 실행할 콜백
   */
  onUnmount?: () => void;
  
  /**
   * 페이지 키 (스크롤 위치 저장/복원 시 사용)
   */
  pageKey?: string;
}

/**
 * 페이지 라이프사이클 관리 훅
 * 
 * 페이지 전환 시 공통 로직(스크롤 관리, 초기화 등)을 처리합니다.
 * 
 * @example
 * ```tsx
 * // 기본 사용: 상단으로 스크롤
 * usePageLifecycle({ scrollPolicy: 'top' });
 * 
 * // 스크롤 위치 보존
 * usePageLifecycle({ 
 *   scrollPolicy: 'preserve',
 *   restoreScroll: true,
 *   pageKey: 'home'
 * });
 * 
 * // 내부 스크롤 컨테이너 사용
 * usePageLifecycle({ scrollPolicy: 'internal' });
 * ```
 */
export const usePageLifecycle = (config: PageLifecycleConfig = {}) => {
  const location = useLocation();
  const {
    scrollPolicy = 'top',
    restoreScroll = false,
    onMount,
    onUnmount,
    pageKey,
  } = config;

  // 페이지 마운트 시 처리
  useEffect(() => {
    // 마운트 콜백 실행
    let unmountCallback: (() => void) | void;
    if (onMount) {
      unmountCallback = onMount();
    }

    // 스크롤 정책에 따른 처리
    if (scrollPolicy === 'preserve') {
      // preserve 정책: 스크롤 위치 복원은 onMount 콜백에서 처리하도록 함
      // (CSS Scroll-Driven Animations와의 충돌 방지를 위해)
      // 여기서는 스크롤 위치 변경 없음
    } else if (scrollPolicy === 'top' || scrollPolicy === 'window') {
      // top/window 정책: 스크롤 위치 복원이 활성화되어 있고 pageKey가 있으면 복원
      if (restoreScroll && pageKey) {
        const savedScroll = sessionStorage.getItem(`scroll_${pageKey}`);
        if (savedScroll) {
          const scrollY = parseInt(savedScroll, 10);
          // 약간의 지연을 두어 DOM 렌더링 완료 후 스크롤
          setTimeout(() => {
            window.scrollTo({ top: scrollY, behavior: 'auto' });
          }, 100);
          return () => {
            if (typeof unmountCallback === 'function') {
              unmountCallback();
            }
            if (onUnmount) {
              onUnmount();
            }
          };
        }
      }
      
      // 스크롤 위치 복원이 없거나 실패한 경우 상단으로 이동
      if (!restoreScroll || !pageKey) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    // 'internal' 정책은 스크롤 위치 변경 없음

    return () => {
      // 스크롤 위치 저장
      if (restoreScroll && pageKey && scrollPolicy !== 'internal') {
        const scrollY = window.scrollY;
        sessionStorage.setItem(`scroll_${pageKey}`, scrollY.toString());
      }

      // 언마운트 콜백 실행
      if (typeof unmountCallback === 'function') {
        unmountCallback();
      }
      if (onUnmount) {
        onUnmount();
      }
    };
  }, [location.pathname, scrollPolicy, restoreScroll, pageKey, onMount, onUnmount]);
};
