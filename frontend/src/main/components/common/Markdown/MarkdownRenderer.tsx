import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHeadingId from 'remark-heading-id';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import { scrollToSection } from '@features/project-gallery/hooks/useActiveSection';
import { generateHeadingId, resetHeadingIdCounters } from '@shared/lib/markdown/generateHeadingId';
import 'highlight.js/styles/github-dark.css'; // 코드 블록 스타일

// 노드에서 텍스트 추출 헬퍼 함수
const extractTextFromNode = (node: any): string => {
  if (node.type === 'text') {
    return node.value || '';
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('').trim();
  }
  return '';
};

// rehype 플러그인: 헤딩 ID를 useTOC와 동일한 방식으로 수정
const rehypeFixHeadingIds = () => {
  return (tree: Root) => {
    // ID 카운터 초기화 (useTOC와 동일한 카운터 사용)
    resetHeadingIdCounters();
    
    let headingIndex = 0;
    visit(tree, 'element', (node: Element) => {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) {
        // 헤딩 텍스트 추출
        const text = extractTextFromNode(node);
        if (text) {
          // useTOC와 동일한 공유 함수 사용 (중복 ID 처리 포함)
          const newId = generateHeadingId(text, headingIndex);
          if (!node.properties) {
            node.properties = {};
          }
          node.properties.id = newId;
          headingIndex++;
        }
      }
    });
  };
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 커스텀 마크다운 컴포넌트 정의
const markdownComponents = {
  // 헤딩에 자동 생성된 ID와 스크롤 마진 추가
  h1: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h1 
      id={id} 
      className="text-3xl font-bold mb-6 mt-8 scroll-mt-20 first:mt-0 text-text-primary"
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h2 
      id={id} 
      className="text-2xl font-semibold mb-4 mt-8 scroll-mt-20 text-text-primary"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h3 
      id={id} 
      className="text-xl font-medium mb-3 mt-6 scroll-mt-20 text-text-primary"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h4 
      id={id} 
      className="text-lg font-medium mb-2 mt-4 scroll-mt-20 text-text-primary"
    >
      {children}
    </h4>
  ),
  h5: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h5 
      id={id} 
      className="text-base font-medium mb-2 mt-4 scroll-mt-20 text-text-primary"
    >
      {children}
    </h5>
  ),
  h6: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h6 
      id={id} 
      className="text-sm font-medium mb-2 mt-4 scroll-mt-20 text-text-primary"
    >
      {children}
    </h6>
  ),
  
  // 단락 스타일링
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 leading-relaxed text-text-secondary">
      {children}
    </p>
  ),
  
  // 리스트 스타일링
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mb-4 ml-6 list-disc space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-text-secondary">
      {children}
    </li>
  ),
  
  // 링크 스타일링
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => {
    // 앵커 링크인지 확인 (#로 시작하는 경우)
    const isAnchorLink = href?.startsWith('#');
    
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isAnchorLink && href) {
        e.preventDefault();
        const sectionId = href.substring(1); // # 제거
        scrollToSection(sectionId, 100, 'smooth');
      }
    };

    return (
      <a 
        href={href}
        onClick={handleClick}
        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors"
        target={isAnchorLink ? undefined : '_blank'}
        rel={isAnchorLink ? undefined : 'noopener noreferrer'}
      >
        {children}
      </a>
    );
  },
  
  // 코드 스타일링
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isInlineCode = !className;
    return isInlineCode ? (
      <code className="bg-surface-elevated dark:bg-slate-700 text-text-primary px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ) : (
      <code className={className}>
        {children}
      </code>
    );
  },
  
  // 코드 블록 스타일링
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 dark:text-slate-200 p-4 rounded-lg overflow-x-auto mb-4">
      {children}
    </pre>
  ),
  
  // 인용구 스타일링
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary-500 dark:border-primary-400 pl-4 py-2 mb-4 bg-primary-50 dark:bg-primary-900/20 italic">
      {children}
    </blockquote>
  ),
  
  // 테이블 스타일링
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-surface-elevated dark:bg-slate-700">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr>
      {children}
    </tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left font-semibold text-text-primary border-b border-border">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-2 text-text-secondary border-b border-border">
      {children}
    </td>
  ),
  
  // 이미지 스타일링
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img 
      src={src} 
      alt={alt}
      className="max-w-full h-auto rounded-lg shadow-md mb-4"
      loading="lazy"
    />
  ),
  
  // 구분선
  hr: () => (
    <hr className="border-border my-8" />
  ),
  
  // 강조 텍스트
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-text-primary">
      {children}
    </strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-text-secondary">
      {children}
    </em>
  ),
};

const MarkdownRenderer = React.forwardRef<HTMLElement, MarkdownRendererProps>(({ 
  content, 
  className = '' 
}, ref) => {
  return (
    <article ref={ref} className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm, // GitHub Flavored Markdown (테이블, 체크박스 등)
          remarkHeadingId // 헤딩에 자동 ID 생성 (기본 방식)
        ]}
        rehypePlugins={[
          rehypeFixHeadingIds, // useTOC와 동일한 방식으로 ID 수정
          rehypeSanitize, // XSS 방지
          rehypeHighlight // 코드 블록 신택스 하이라이트
        ]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export { MarkdownRenderer };
