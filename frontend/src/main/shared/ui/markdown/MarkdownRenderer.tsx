import React, { useEffect, useRef, useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Modal } from '@design-system/components/Modal';
import styles from './MarkdownRenderer.module.css';
import '@uiw/react-markdown-preview/markdown.css';

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

      console.log('✅ Mermaid 로드 성공');
      return mermaidApi;
    } catch (error) {
      console.error('❌ Mermaid 로드 실패:', error);
      console.error('상세 정보:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
      });
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
  const isAutoModalHeight = modalSize.height === 'auto';
  
  return (
    <>
      <button
        type="button"
        className="mb-4 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90 p-0 border-0 bg-transparent"
        style={{ 
          aspectRatio: '16 / 9', 
          backgroundColor: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setIsModalOpen(true)}
        aria-label="이미지 확대 보기"
      >
        <img 
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          loading="lazy"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </button>
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
          height: isAutoModalHeight ? 'auto' : `calc(${modalSize.height} + 48px)`,
          minHeight: isAutoModalHeight ? 'auto' : `calc(${modalSize.height} + 48px)`,
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
        console.error('❌ Mermaid 렌더링 실패 (일반 코드 블록으로 fallback):', err);
        console.error('다이어그램 내용:', diagram.substring(0, 200));
        console.error('상세 정보:', {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });

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

// 커스텀 마크다운 컴포넌트 정의 (이미지 모달, Mermaid 다이어그램 지원)
const markdownComponents = {
  // 이미지 스타일링 (클릭 시 모달로 원본 표시)
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <MarkdownImage src={src} alt={alt} />
  ),

  // 코드 블록에서 mermaid 처리
  code: ({ children, className, ...props }: any) => {
    // mermaid 다이어그램인지 확인
    const isMermaid = className?.includes('language-mermaid');
    if (isMermaid) {
      const mermaidContent = typeof children === 'string'
        ? children
        : React.Children.toArray(children)
            .map((child) => {
              if (typeof child === 'string' || typeof child === 'number') {
                return String(child);
              }
              return '';
            })
            .join('');
      const mermaidId = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
      return <MermaidDiagram diagram={mermaidContent.trim()} id={mermaidId} />;
    }

    // 일반 코드는 기본 렌더링
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
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
    let processed = content.replaceAll('\\`', '`');

    // 기타 이스케이프 문자 복원 (필요한 경우)
    processed = processed.replaceAll(String.raw`\n`, '\n');
    processed = processed.replaceAll(String.raw`\r`, '\r');
    processed = processed.replaceAll(String.raw`\t`, '\t');

    return processed;
  }, [content]);

  return (
    <MarkdownPreview
      source={processedContent}
      className={`wmde-markdown ${className}`}
      components={markdownComponents}
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export { MarkdownRenderer };
