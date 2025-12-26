/**
 * DOM 기반 TOC 생성 훅
 * 
 * 마크다운 렌더링 후 실제 DOM에서 헤딩을 읽어 TOC를 생성합니다.
 * 이 방식은 템플릿의 기존 헤딩과 동적 마크다운 블록이 섞여도
 * 실제 렌더된 헤딩 기준으로 TOC를 만들 수 있어 ID 불일치 문제를 해결합니다.
 */

import { useState, useEffect, useRef } from 'react';
import { TOCItem } from './types';

interface UseTOCFromDOMOptions {
  /**
   * 헤딩을 찾을 컨테이너 선택자
   * @default 'article'
   */
  containerSelector?: string;
  
  /**
   * 헤딩 레벨 범위 (예: [1, 2, 3]은 h1, h2, h3만 포함)
   * @default [1, 2, 3, 4, 5, 6]
   */
  headingLevels?: number[];
  
  /**
   * DOM 변경 감지 대기 시간 (ms)
   * MutationObserver가 너무 자주 트리거되는 것을 방지
   * @default 100
   */
  debounceDelay?: number;
}

/**
 * DOM에서 헤딩을 추출하여 TOC를 생성하는 훅
 * 
 * @param containerRef - 마크다운이 렌더된 컨테이너의 ref
 * @param options - 옵션 설정
 * @returns TOCItem[] - 계층 구조를 가진 목차 아이템 배열
 */
export const useTOCFromDOM = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseTOCFromDOMOptions = {}
): TOCItem[] => {
  const {
    containerSelector = 'article',
    headingLevels = [1, 2, 3, 4, 5, 6],
    debounceDelay = 100
  } = options;

  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // DOM에서 헤딩 추출
  const extractHeadings = (): TOCItem[] => {
    if (!containerRef.current) {
      return [];
    }

    // 컨테이너 내부에서 헤딩 찾기
    const container = containerRef.current.querySelector(containerSelector) || containerRef.current;
    if (!container) {
      return [];
    }

    // 헤딩 선택자 생성 (예: 'h1, h2, h3')
    const headingSelector = headingLevels.map(level => `h${level}`).join(', ');
    const headingElements = Array.from(container.querySelectorAll(headingSelector)) as HTMLHeadingElement[];

    // 헤딩을 순서대로 변환
    const headings: TOCItem[] = headingElements.map((element, index) => {
      const text = element.textContent?.trim() || '';
      const id = element.id || `heading-${index}`;
      const level = parseInt(element.tagName.charAt(1)) || 1;

      return {
        id,
        text,
        level
      };
    });

    // 계층 구조로 변환
    return buildHierarchy(headings);
  };

  // 계층 구조로 변환
  const buildHierarchy = (headings: TOCItem[]): TOCItem[] => {
    if (headings.length === 0) {
      return [];
    }

    const result: TOCItem[] = [];
    const stack: TOCItem[] = [];

    for (const heading of headings) {
      // 스택에서 현재 레벨보다 높은 레벨의 아이템들을 제거
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop();
      }

      // 현재 아이템을 복사하여 children 배열 추가
      const itemWithChildren: TOCItem = {
        ...heading,
        children: []
      };

      if (stack.length === 0) {
        // 최상위 레벨 아이템
        result.push(itemWithChildren);
      } else {
        // 하위 레벨 아이템 - 부모의 children에 추가
        const parent = stack[stack.length - 1];
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(itemWithChildren);
      }

      // 현재 아이템을 스택에 추가
      stack.push(itemWithChildren);
    }

    return result;
  };

  // 디바운스된 TOC 업데이트
  const updateTOC = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const newTOC = extractHeadings();
      setTocItems(newTOC);
    }, debounceDelay);
  };

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // 초기 TOC 생성
    updateTOC();

    // DOM 변경 감지 (MutationObserver)
    const container = containerRef.current.querySelector(containerSelector) || containerRef.current;
    
    observerRef.current = new MutationObserver(() => {
      updateTOC();
    });

    observerRef.current.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id']
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [containerRef, containerSelector, debounceDelay, headingLevels]);

  return tocItems;
};

