import { useState, useEffect, useRef } from 'react';
import { TOCItem } from './useTOC';

interface UseActiveSectionOptions {
  /**
   * Intersection Observer의 root margin
   * 음수 값으로 설정하면 요소가 뷰포트에 완전히 들어왔을 때만 감지
   * @default '-100px 0px -66%'
   */
  rootMargin?: string;
  
  /**
   * Intersection Observer의 threshold
   * 1.0은 요소가 100% 보일 때만 감지
   * @default 1.0
   */
  threshold?: number;
  
  /**
   * 스크롤 이벤트를 사용할지 여부 (Intersection Observer 대신)
   * @default false
   */
  useScrollEvent?: boolean;
  
  /**
   * 스크롤 이벤트 사용 시 스로틀링 지연 시간 (ms)
   * @default 100
   */
  throttleDelay?: number;
}

/**
 * 현재 뷰포트에 보이는 섹션을 추적하는 훅
 * 
 * @param tocItems - TOC 아이템 배열
 * @param options - 옵션 설정
 * @returns 현재 활성화된 섹션의 ID
 */
export const useActiveSection = (
  tocItems: TOCItem[],
  options: UseActiveSectionOptions = {}
): string | null => {
  const {
    rootMargin = '-100px 0px -66%',
    threshold = 1.0,
    useScrollEvent = false,
    throttleDelay = 100
  } = options;

  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TOC 아이템에서 모든 ID 추출 (중첩된 children 포함)
  const allIds = extractAllIds(tocItems);

  useEffect(() => {
    if (allIds.length === 0) {
      setActiveId(null);
      return;
    }

    if (useScrollEvent) {
      // 스크롤 이벤트 방식
      const handleScroll = throttle(() => {
        const currentSection = findCurrentSection(allIds);
        setActiveId(currentSection);
      }, throttleDelay);

      window.addEventListener('scroll', handleScroll, { passive: true });
      
      // 초기 실행
      handleScroll();

      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Intersection Observer 방식
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // 가장 위에 있는 보이는 섹션 찾기
          const visibleEntries = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => {
              const aRect = a.boundingClientRect;
              const bRect = b.boundingClientRect;
              return aRect.top - bRect.top;
            });

          if (visibleEntries.length > 0) {
            const topEntry = visibleEntries[0];
            setActiveId(topEntry.target.id);
          }
        },
        {
          rootMargin,
          threshold
        }
      );

      // 모든 섹션 요소 관찰 시작
      allIds.forEach(id => {
        const element = document.getElementById(id);
        if (element && observerRef.current) {
          observerRef.current.observe(element);
        }
      });

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [allIds, rootMargin, threshold, useScrollEvent, throttleDelay]);

  return activeId;
};

/**
 * TOC 아이템에서 모든 ID를 추출 (중첩된 children 포함)
 * 
 * @param tocItems - TOC 아이템 배열
 * @returns 모든 ID 배열
 */
function extractAllIds(tocItems: TOCItem[]): string[] {
  const ids: string[] = [];
  
  const extractRecursive = (items: TOCItem[]) => {
    for (const item of items) {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        extractRecursive(item.children);
      }
    }
  };
  
  extractRecursive(tocItems);
  return ids;
}

/**
 * 스크롤 이벤트 방식에서 현재 섹션을 찾는 함수
 * 
 * @param allIds - 모든 섹션 ID 배열
 * @returns 현재 섹션 ID 또는 null
 */
function findCurrentSection(allIds: string[]): string | null {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const offset = 100; // 헤더 높이 등을 고려한 오프셋

  // 각 섹션의 위치를 확인하여 현재 보이는 섹션 찾기
  for (let i = allIds.length - 1; i >= 0; i--) {
    const element = document.getElementById(allIds[i]);
    if (element) {
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      
      // 요소가 뷰포트 상단에서 offset만큼 아래에 있을 때 활성화
      if (elementTop <= scrollTop + offset) {
        return allIds[i];
      }
    }
  }

  return allIds[0] || null; // 첫 번째 섹션을 기본값으로
}

/**
 * 함수 스로틀링 유틸리티
 * 
 * @param func - 스로틀링할 함수
 * @param delay - 지연 시간 (ms)
 * @returns 스로틀링된 함수
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return (...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * 특정 섹션으로 스크롤하는 유틸리티 함수
 * 
 * @param sectionId - 스크롤할 섹션 ID
 * @param offset - 추가 오프셋 (헤더 높이 등)
 * @param behavior - 스크롤 동작 ('smooth' | 'auto')
 */
export const scrollToSection = (
  sectionId: string,
  offset: number = 100,
  behavior: ScrollBehavior = 'smooth'
): void => {
  const element = document.getElementById(sectionId);
  if (element) {
    const elementTop = element.offsetTop;
    const scrollTop = elementTop - offset;
    
    window.scrollTo({
      top: scrollTop,
      behavior
    });
  }
};

/**
 * 모든 섹션의 위치 정보를 가져오는 유틸리티 함수
 * 
 * @param tocItems - TOC 아이템 배열
 * @returns 섹션 위치 정보 배열
 */
export const getSectionPositions = (tocItems: TOCItem[]) => {
  const allIds = extractAllIds(tocItems);
  
  return allIds.map(id => {
    const element = document.getElementById(id);
    return {
      id,
      top: element?.offsetTop || 0,
      height: element?.offsetHeight || 0,
      bottom: (element?.offsetTop || 0) + (element?.offsetHeight || 0)
    };
  });
};
