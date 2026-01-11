import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { remarkCustomHeadingId } from '@/shared/lib/markdown/remarkCustomHeadingId';
import 'highlight.js/styles/github.css'; // 라이트 모드용
// 다크 모드는 CSS에서 처리

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
      className="text-3xl font-bold mb-6 mt-8 scroll-mt-20 first:mt-0"
    >
      {children}
    </h1>
  ),
  h2: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h2 
      id={id} 
      className="text-2xl font-semibold mb-4 mt-8 scroll-mt-20"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h3 
      id={id} 
      className="text-xl font-semibold mb-3 mt-6 scroll-mt-20"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h4 
      id={id} 
      className="text-lg font-semibold mb-2 mt-4 scroll-mt-20"
    >
      {children}
    </h4>
  ),
  h5: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h5 
      id={id} 
      className="text-base font-semibold mb-2 mt-4 scroll-mt-20"
    >
      {children}
    </h5>
  ),
  h6: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <h6 
      id={id} 
      className="text-sm font-semibold mb-2 mt-4 scroll-mt-20"
    >
      {children}
    </h6>
  ),
  
  // 문단 스타일링
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 text-text-secondary leading-relaxed">
      {children}
    </p>
  ),
  
  // 리스트 스타일링
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mb-4 ml-6 list-disc text-text-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mb-4 ml-6 list-decimal text-text-secondary">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-1">
      {children}
    </li>
  ),
  
  // 코드 블록 스타일링
  code: ({ children, className, ...props }: any) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-surface-elevated dark:bg-surface text-text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-border">
          {children}
        </code>
      );
    }
    // 코드 블록의 경우 highlight.js가 추가한 클래스를 유지
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-6 rounded-lg overflow-x-auto bg-gray-50 dark:bg-gray-900 p-4 border border-border">
      {children}
    </pre>
  ),
  
  // 인용문 스타일링
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-4 pl-4 border-l-4 border-primary-500 dark:border-primary-400 italic text-text-secondary">
      {children}
    </blockquote>
  ),
  
  // 링크 스타일링
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a 
      href={href}
      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  
  // 이미지 스타일링
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <img 
      src={src}
      alt={alt}
      className="mb-4 rounded-lg max-w-full h-auto"
    />
  ),
  
  // 테이블 스타일링
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-border">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-surface-elevated">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody>
      {children}
    </tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="border-b border-border">
      {children}
    </tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left font-semibold text-text-primary border border-border">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-2 text-text-secondary border border-border">
      {children}
    </td>
  ),
  
  // 구분선 스타일링
  hr: () => (
    <hr className="my-8 border-border" />
  ),
  
  // 강조 스타일링
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

// rehype-sanitize 스키마 커스터마이징
// highlight.js가 추가하는 클래스들을 허용하도록 설정
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      // highlight.js가 추가하는 클래스 허용
      ['className', 'hljs', 'language-*', /^language-./, /^hljs-./]
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      // highlight.js가 span에 추가하는 클래스 허용
      ['className', /^hljs-./]
    ]
  }
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  // 이스케이프된 백틱을 원래대로 복원
  // 백엔드에서 \`\`\` 형태로 저장된 경우를 처리
  const processedContent = React.useMemo(() => {
    if (!content || typeof content !== 'string') return '';

    // 이스케이프된 백틱 복원
    let processed = content.replace(/\\`/g, '`');

    // 기타 이스케이프 문자 복원 (필요한 경우)
    processed = processed.replace(/\\n/g, '\n');
    processed = processed.replace(/\\r/g, '\r');
    processed = processed.replace(/\\t/g, '\t');

    return processed;
  }, [content]);

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[
          remarkGfm, // GitHub Flavored Markdown 지원
          remarkCustomHeadingId, // 헤딩에 일관된 ID 생성 (TOC와 동일)
        ]}
        rehypePlugins={[
          rehypeHighlight, // 코드 하이라이팅 (먼저 실행)
          [rehypeSanitize, sanitizeSchema], // XSS 방지 (나중에 실행, 커스텀 스키마)
        ]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export { MarkdownRenderer };

