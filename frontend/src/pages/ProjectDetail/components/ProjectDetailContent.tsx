import React, { useState } from 'react';
import { MarkdownRenderer } from '../../../shared/components/Markdown';
import { Project } from '../../../features/projects/types';

interface ProjectDetailContentProps {
  content: string;
  project: Project;
  className?: string;
}

// 지연 로딩 이미지 컴포넌트
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height: '200px' }}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">이미지를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isInView && (
        <div className="bg-gray-200 animate-pulse rounded-lg" style={{ height: '200px' }} />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-64 object-cover rounded-lg shadow-md transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({
  content,
  project,
  className = ''
}) => {
  const [isScreenshotVisible, setIsScreenshotVisible] = useState(true);
  
  // 마크다운 컨텐츠가 있는지 확인
  const hasMarkdown = content && content.trim().length > 0;
  
  if (!hasMarkdown) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">프로젝트 상세 내용이 없습니다</h3>
          <p className="text-sm">곧 추가될 예정입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* 메인 스크린샷 섹션 */}
      {project.imageUrl && project.imageUrl !== '#' && (
        <div className="mb-8 relative group">
          {isScreenshotVisible && (
            <LazyImage
              src={project.imageUrl}
              alt={`${project.title} 메인 이미지`}
              className="mb-4"
            />
          )}
          
          {/* 스크린샷 토글 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={() => setIsScreenshotVisible(!isScreenshotVisible)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              aria-label={isScreenshotVisible ? '스크린샷 숨기기' : '스크린샷 보기'}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isScreenshotVisible ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isScreenshotVisible ? '스크린샷 숨기기' : '스크린샷 보기'}
            </button>
          </div>
        </div>
      )}

      {/* 마크다운 컨텐츠 */}
      <div className="prose prose-lg max-w-none">
        <MarkdownRenderer 
          content={content}
          className="max-w-none"
        />
      </div>
    </div>
  );
};

export default ProjectDetailContent;
