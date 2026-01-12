import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { remarkCustomHeadingId } from '@/shared/lib/markdown/remarkCustomHeadingId';
import { Modal } from '@design-system/components/Modal';
import styles from './MarkdownRenderer.module.css';
import 'highlight.js/styles/github.css'; // 라이트 모드용
// 다크 모드는 CSS에서 처리

// Mermaid 동적 import 및 초기화 관리 (모범 사례 적용)
type MermaidAPI = {
  initialize: (config: {
    startOnLoad?: boolean;
    theme?: string;
    securityLevel?: string;
    fontFamily?: string;
  }) => void;
  render: (id: string, diagram: string) => Promise<{ svg: string }>;
};

let mermaidApi: MermaidAPI | null = null;
let mermaidInitPromise: Promise<MermaidAPI> | null = null;

/**
 * Mermaid 라이브러리를 동적으로 로드하고 초기화
 * 모범 사례: 한 번만 초기화하고, 초기화 완료 후에만 사용
 */
const loadMermaid = async (): Promise<MermaidAPI> => {
  // 이미 로드되었으면 바로 반환
  if (mermaidApi) {
    return mermaidApi;
  }

  // 이미 초기화 중이면 기다림
  if (mermaidInitPromise) {
    return mermaidInitPromise;
  }

  // 초기화 시작
  mermaidInitPromise = (async () => {
    try {
      // 동적 import로 mermaid 모듈 로드
      const mermaidModule = await import('mermaid');
      
      // mermaid.default를 변수에 저장 (모범 사례)
      mermaidApi = mermaidModule.default as MermaidAPI;
      
      // 초기화는 한 번만 수행 (startOnLoad: false로 자동 렌더링 비활성화)
      mermaidApi.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
      });
      
      return mermaidApi;
    } catch (error) {
      console.error('Mermaid 로드 오류:', error);
      mermaidInitPromise = null;
      throw error;
    }
  })();

  return mermaidInitPromise;
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 이미지 모달 컴포넌트
const MarkdownImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // 이미지 로드 시 크기 측정
  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };
  
  if (!src) return null;
  
  // 모달 크기 계산 (뷰포트의 90%를 넘지 않도록)
  const getModalSize = () => {
    if (!imageSize) return { width: 'auto', height: 'auto' };
    
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    
    const aspectRatio = imageSize.width / imageSize.height;
    
    let width = imageSize.width;
    let height = imageSize.height;
    
    // 뷰포트 크기에 맞춰 조정
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return {
      width: `${width}px`,
      height: `${height}px`,
    };
  };
  
  const modalSize = getModalSize();
  
  return (
    <>
      <div 
        className="mb-4 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90" 
        style={{ 
          aspectRatio: '16 / 9', 
          backgroundColor: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        aria-label="이미지 확대 보기"
      >
        <img 
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          loading="lazy"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width={modalSize.width}
        className={styles.imageModal}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '0',
          margin: '-24px', // Modal의 content padding 제거
          width: 'calc(100% + 48px)', // padding 양쪽 제거
          height: modalSize.height !== 'auto' ? `calc(${modalSize.height} + 48px)` : 'auto',
          minHeight: modalSize.height !== 'auto' ? `calc(${modalSize.height} + 48px)` : 'auto',
          overflow: 'hidden', // 스크롤 제거
          boxSizing: 'border-box',
        }}>
          <img 
            ref={imgRef}
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </Modal>
    </>
  );
};

// Mermaid 다이어그램 컴포넌트 (모범 사례 적용)
// 오류 발생 시 일반 코드 블록으로 fallback 처리
const MermaidDiagram: React.FC<{ diagram: string; id: string }> = ({ diagram, id }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!mermaidRef.current || !diagram) return;

    let isMounted = true;

    // 다이어그램 렌더링 (모범 사례: cleanup 처리 포함)
    const renderDiagram = async () => {
      try {
        setError(false);
        setIsLoading(true);
        
        // Mermaid 로드 및 초기화 (이미 초기화되었으면 바로 반환)
        const mermaid = await loadMermaid();
        
        // 컴포넌트가 언마운트되었으면 중단
        if (!isMounted || !mermaidRef.current) return;
        
        // 고유한 ID로 SVG 생성 (모범 사례: render 시마다 고유 ID 사용)
        const { svg } = await mermaid.render(id, diagram);
        
        // 다시 한 번 마운트 상태 확인
        if (!isMounted || !mermaidRef.current) return;
        
        mermaidRef.current.innerHTML = svg;
        setIsLoading(false);
      } catch (err) {
        console.error('Mermaid 렌더링 오류 (일반 코드 블록으로 fallback):', err);
        
        // 컴포넌트가 언마운트되었으면 상태 업데이트 안 함
        if (!isMounted) return;
        
        // 에러 발생 시 일반 코드 블록으로 표시
        setError(true);
        setIsLoading(false);
      }
    };

    renderDiagram();

    // Cleanup: 컴포넌트 언마운트 시 플래그 설정
    return () => {
      isMounted = false;
    };
  }, [diagram, id]);

  // 오류 발생 시 일반 코드 블록으로 fallback
  if (error) {
    return (
      <pre className="mb-6 rounded-lg overflow-x-auto bg-gray-50 dark:bg-gray-900 p-4 border border-border">
        <code className="language-mermaid">{diagram}</code>
      </pre>
    );
  }

  return (
    <div 
      ref={mermaidRef}
      className="mb-6 rounded-lg overflow-x-auto bg-white dark:bg-gray-800 p-4 border border-border flex justify-center"
      data-mermaid-id={id}
    >
      {isLoading && (
        <div className="text-text-secondary text-sm">다이어그램 로딩 중...</div>
      )}
    </div>
  );
};

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
    
    // mermaid 다이어그램인지 확인
    const isMermaid = className?.includes('language-mermaid');
    if (isMermaid) {
      // mermaid인 경우, pre 컴포넌트에서 처리하도록 data 속성 추가
      return (
        <code className={className} data-mermaid="true" {...props}>
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
  pre: ({ children }: { children: React.ReactNode }) => {
    // children이 code 요소인지 확인하고 mermaid인지 체크
    let isMermaid = false;
    let mermaidContent = '';
    let mermaidId = '';

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'code') {
        const codeProps = child.props as any;
        if (codeProps['data-mermaid'] || codeProps.className?.includes('language-mermaid')) {
          isMermaid = true;
          mermaidContent = typeof codeProps.children === 'string' 
            ? codeProps.children 
            : React.Children.toArray(codeProps.children).join('');
          // 고유 ID 생성
          mermaidId = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        }
      }
    });

    // mermaid인 경우 MermaidDiagram 렌더링
    if (isMermaid) {
      return <MermaidDiagram diagram={mermaidContent} id={mermaidId} />;
    }

    // 일반 코드 블록
    return (
      <pre className="mb-6 rounded-lg overflow-x-auto bg-gray-50 dark:bg-gray-900 p-4 border border-border">
        {children}
      </pre>
    );
  },
  
  // 인용문 스타일링
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mb-4 pl-4 border-l-4 border-primary-500 dark:border-primary-400 italic text-text-secondary">
      {children}
    </blockquote>
  ),
  
  // 링크 스타일링
  a: ({ children, href, ...props }: any) => (
    <a 
      href={href}
      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  
  // 이미지 스타일링 (클릭 시 모달로 원본 표시)
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <MarkdownImage src={src} alt={alt} />
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
// highlight.js가 추가하는 클래스들과 mermaid 속성을 허용하도록 설정
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      // highlight.js가 추가하는 클래스 허용
      ['className', 'hljs', 'language-*', /^language-./, /^hljs-./],
      // mermaid 관련 속성 허용
      ['data-mermaid']
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      // highlight.js가 span에 추가하는 클래스 허용
      ['className', /^hljs-./]
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      // mermaid 다이어그램 컨테이너 속성 허용
      ['className', 'mermaid'],
      ['data-mermaid-id']
    ]
  }
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  // Mermaid는 필요할 때 동적으로 초기화됨
  // MermaidDiagram 컴포넌트에서 loadMermaid()를 통해 로드 및 초기화됨

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

