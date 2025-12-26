/**
 * 커스텀 remark 플러그인: 헤딩에 일관된 ID를 할당
 * useTOC와 동일한 ID 생성 로직을 사용하여 앵커 링크가 정상 작동하도록 함
 */

import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { generateHeadingId, resetHeadingIdCounters } from './generateHeadingId';

interface HeadingNode {
  type: 'heading';
  depth: number;
  data?: {
    hProperties?: {
      id?: string;
    };
  };
  children: Array<{
    type: string;
    value?: string;
  }>;
}

/**
 * 헤딩에 커스텀 ID를 할당하는 remark 플러그인
 */
export const remarkCustomHeadingId = () => {
  return (tree: Root) => {
    // 카운터 초기화
    resetHeadingIdCounters();

    let headingIndex = 0;

    visit(tree, 'heading', (node: HeadingNode) => {
      // 헤딩 텍스트 추출
      const text = node.children
        .filter((child) => child.type === 'text' && child.value)
        .map((child) => child.value)
        .join('')
        .trim();

      if (text) {
        // ID 생성
        const id = generateHeadingId(text, headingIndex);
        headingIndex++;

        // hProperties에 ID 설정 (rehype에서 사용)
        if (!node.data) {
          node.data = {};
        }
        if (!node.data.hProperties) {
          node.data.hProperties = {};
        }
        node.data.hProperties.id = id;
      }
    });
  };
};
