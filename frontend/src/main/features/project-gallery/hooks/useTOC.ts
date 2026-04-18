import { useMemo } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { generateHeadingId, resetHeadingIdCounters } from '@/shared/lib/markdown/generateHeadingId';
import type { TOCItem } from './types';

interface HeadingNode {
  type: 'heading';
  depth: number;
  children: Array<{
    type: string;
    value: string;
  }>;
}

/**
 * 마크다운 컨텐츠에서 헤딩을 파싱하여 목차(TOC)를 생성하는 훅
 * 
 * @param markdown - 파싱할 마크다운 문자열
 * @returns TOCItem[] - 계층 구조를 가진 목차 아이템 배열
 */
export const useTOC = (markdown: string): TOCItem[] => {
  return useMemo(() => {
    if (!markdown || markdown.trim() === '') {
      return [];
    }

    try {
      // 마크다운을 AST로 파싱
      const ast = unified()
        .use(remarkParse)
        .parse(markdown);

      // ID 카운터 초기화 (마크다운 렌더러와 동일한 카운터 사용)
      resetHeadingIdCounters();

      // 헤딩 노드만 추출
      const headings: TOCItem[] = [];
      
      visit(ast, 'heading', (node: HeadingNode) => {
        // 헤딩 텍스트 추출
        const text = node.children
          .filter(child => child.type === 'text')
          .map(child => child.value)
          .join('')
          .trim();

        if (text) {
          // 공유 ID 생성 함수 사용 (중복 ID 처리 포함)
          const id = generateHeadingId(text, headings.length);

          headings.push({
            id,
            text,
            level: node.depth
          });
        }
      });

      // 계층 구조로 변환
      return buildHierarchy(headings);
    } catch (error) {
      console.error('TOC 파싱 중 오류 발생:', error);
      return [];
    }
  }, [markdown]);
};

/**
 * 평면적인 헤딩 배열을 계층 구조로 변환
 * 
 * @param headings - 평면적인 헤딩 배열
 * @returns 계층 구조를 가진 TOCItem 배열
 */
function buildHierarchy(headings: TOCItem[]): TOCItem[] {
  if (headings.length === 0) {
    return [];
  }

  const result: TOCItem[] = [];
  const stack: TOCItem[] = [];

  for (const heading of headings) {
    // 스택에서 현재 레벨보다 높은 레벨의 아이템들을 제거
    while (stack.length > 0 && stack.at(-1)!.level >= heading.level) {
      stack.pop();
    }

    // 현재 아이템을 복사하여 subItems 배열 추가
    const itemWithSubItems: TOCItem = {
      ...heading,
      subItems: []
    };

    if (stack.length === 0) {
      // 최상위 레벨 아이템
      result.push(itemWithSubItems);
    } else {
      // 하위 레벨 아이템 - 부모의 subItems에 추가
      const parent = stack.at(-1)!;
      parent.subItems ??= [];
      parent.subItems.push(itemWithSubItems);
    }

    // 현재 아이템을 스택에 추가
    stack.push(itemWithSubItems);
  }

  return result;
}

/**
 * TOC 아이템의 총 개수를 계산 (중첩된 subItems 포함)
 * 
 * @param items - TOC 아이템 배열
 * @returns 총 아이템 개수
 */
export const getTOCItemCount = (items: TOCItem[]): number => {
  let count = 0;
  
  const countRecursive = (items: TOCItem[]) => {
    for (const item of items) {
      count++;
      if (item.subItems && item.subItems.length > 0) {
        countRecursive(item.subItems);
      }
    }
  };
  
  countRecursive(items);
  return count;
};

/**
 * TOC 아이템을 평면 배열로 변환 (렌더링용)
 * 
 * @param items - 계층 구조 TOC 아이템 배열
 * @returns 평면 배열 (level 정보로 들여쓰기 표현)
 */
export const flattenTOCItems = (items: TOCItem[]): TOCItem[] => {
  const result: TOCItem[] = [];
  
  const flattenRecursive = (items: TOCItem[], parentLevel: number = 0) => {
    for (const item of items) {
      result.push({
        ...item,
        level: parentLevel + item.level
      });
      
      if (item.subItems && item.subItems.length > 0) {
        flattenRecursive(item.subItems, parentLevel);
      }
    }
  };
  
  flattenRecursive(items);
  return result;
};
