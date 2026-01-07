/**
 * 개선된 섹션 스크롤 훅
 * 
 * 렌더 완료를 감지한 후 스크롤을 수행하여
 * 동적으로 추가되는 마크다운/이미지/컴포넌트가 삽입될 때도
 * 안정적으로 요소를 찾을 수 있습니다.
 */

import { useRef, useCallback } from 'react';

interface UseScrollToSectionOptions {
  /**
   * 스크롤할 컨테이너 선택자
   * @default 'article'
   */
  containerSelector?: string;
  
  /**
   * 최대 재시도 횟수
   * @default 20
   */
  maxRetries?: number;
  
  /**
   * 재시도 간격 (ms)
   * @default 100
   */
  retryInterval?: number;
  
  /**
   * 추가 오프셋 (헤더 높이 등)
   * @default 100
   */
  offset?: number;
  
  /**
   * 스크롤 동작
   * @default 'smooth'
   */
  behavior?: ScrollBehavior;
}

/**
 * 섹션으로 스크롤하는 함수를 반환하는 훅
 * 
 * @param containerRef - 마크다운이 렌더된 컨테이너의 ref
 * @param options - 옵션 설정
 * @returns 스크롤 함수
 */
export const useScrollToSection = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseScrollToSectionOptions = {}
) => {
  const {
    containerSelector = 'article',
    maxRetries = 20,
    retryInterval = 100,
    offset = 100,
    behavior = 'smooth'
  } = options;

  const retryCountRef = useRef(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const pendingScrollRef = useRef<{ sectionId: string; resolve: () => void; reject: () => void } | null>(null);

  /**
   * 특정 섹션으로 스크롤
   * 
   * @param sectionId - 스크롤할 섹션 ID
   * @returns Promise - 스크롤 완료 시 resolve
   */
  const scrollToSection = useCallback((sectionId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 기존 대기 중인 스크롤 취소
      if (pendingScrollRef.current) {
        pendingScrollRef.current.reject();
      }

      pendingScrollRef.current = { sectionId, resolve, reject };
      retryCountRef.current = 0;

      // 즉시 시도
      attemptScroll(sectionId, resolve, reject);
    });
  }, [containerSelector, maxRetries, retryInterval, offset, behavior]);

  /**
   * 스크롤 시도
   */
  const attemptScroll = (
    sectionId: string,
    resolve: () => void,
    reject: () => void
  ) => {
    if (!containerRef.current) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => attemptScroll(sectionId, resolve, reject), retryInterval);
      } else {
        console.warn(`컨테이너를 찾을 수 없습니다: ${containerSelector}`);
        reject();
        pendingScrollRef.current = null;
      }
      return;
    }

    const container = containerRef.current.querySelector(containerSelector) || containerRef.current;
    const element = container.querySelector(`#${sectionId}`) as HTMLElement;

    if (element) {
      // 요소를 찾았으면 스크롤 수행
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;

      // CSS scroll-margin-top을 고려
      const computedStyle = window.getComputedStyle(element);
      const scrollMarginTop = parseInt(computedStyle.scrollMarginTop) || 0;
      const finalOffset = offset + scrollMarginTop;

      const targetScrollTop = elementTop - finalOffset;

      window.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior
      });

      // 스크롤 완료 후 약간의 지연을 두고 resolve
      setTimeout(() => {
        resolve();
        pendingScrollRef.current = null;
      }, 100);
    } else {
      // 요소를 찾지 못했으면 재시도 또는 MutationObserver 설정
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        
        // MutationObserver가 아직 설정되지 않았으면 설정
        if (!observerRef.current) {
          observerRef.current = new MutationObserver(() => {
            if (pendingScrollRef.current) {
              const { sectionId: pendingId, resolve: pendingResolve, reject: pendingReject } = pendingScrollRef.current;
              attemptScroll(pendingId, pendingResolve, pendingReject);
            }
          });

          observerRef.current.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['id']
          });
        }

        // 재시도
        setTimeout(() => {
          if (pendingScrollRef.current?.sectionId === sectionId) {
            attemptScroll(sectionId, resolve, reject);
          }
        }, retryInterval);
      } else {
        // 최대 재시도 횟수 초과
        console.warn(`요소를 찾을 수 없습니다: #${sectionId}`);
        
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        
        reject();
        pendingScrollRef.current = null;
      }
    }
  };

  // cleanup
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (pendingScrollRef.current) {
      pendingScrollRef.current.reject();
      pendingScrollRef.current = null;
    }
  }, []);

  return { scrollToSection, cleanup };
};

