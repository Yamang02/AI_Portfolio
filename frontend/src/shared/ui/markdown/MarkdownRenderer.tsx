import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkHeadingId from 'remark-heading-id';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // 코드 블록 스타일

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
    <p className="mb-4 text-gray-700 leading-relaxed">
      {children}
    </p>
  ),
  
  // 리스트 스타일링
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mb-4 ml-6 list-disc text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mb-4 ml-6 list-decimal text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="mb-1">
      {children}
    </li>
  ),
  
  // 코드 블록 스타일링
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <code className={className}>
        {children}
      </code>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-4 rounded-lg overflow-x-auto bg-gray-900 text-gray-100 p-4">
      {children}
    </pre>
  ),
  
  // 인용문 스타일링
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-4 pl-4 border-l-4 border-gray-300 italic text-gray-600">
      {children}
    </blockquote>
  ),
  
  // 링크 스타일링
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a 
      href={href}
      className="text-blue-600 hover:text-blue-800 underline transition-colors"
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
      <table className="min-w-full border-collapse border border-gray-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-50">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody>
      {children}
    </tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="border-b border-gray-200">
      {children}
    </tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-700 border border-gray-300">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-2 text-gray-700 border border-gray-300">
      {children}
    </td>
  ),
  
  // 구분선 스타일링
  hr: () => (
    <hr className="my-8 border-gray-300" />
  ),
  
  // 강조 스타일링
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900">
      {children}
    </strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-gray-800">
      {children}
    </em>
  ),
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[
          remarkGfm, // GitHub Flavored Markdown 지원
          remarkHeadingId, // 헤딩에 자동 ID 생성
        ]}
        rehypePlugins={[
          rehypeSanitize, // XSS 방지
          rehypeHighlight, // 코드 하이라이팅
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export { MarkdownRenderer };

