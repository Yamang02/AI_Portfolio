import React, { useState } from 'react';

interface ProjectDetailGalleryProps {
  screenshots: string[];
  projectTitle: string;
  className?: string;
}

// 갤러리 이미지 컴포넌트
const GalleryImage: React.FC<{
  src: string;
  alt: string;
  onClick: () => void;
}> = React.memo(({ src, alt, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className="bg-surface-elevated dark:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-surface dark:hover:bg-slate-600 transition-colors border border-border"
        style={{ height: '200px' }}
        onClick={onClick}
      >
        <div className="text-center text-text-muted">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">이미지 로드 실패</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative bg-surface-elevated dark:bg-slate-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group border border-border"
      style={{ height: '200px' }}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-surface dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } group-hover:scale-105 transition-transform duration-300`}
      />
      
      {/* 호버 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
    </div>
  );
});

GalleryImage.displayName = 'GalleryImage';

// 이미지 모달 컴포넌트
const ImageModal: React.FC<{
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}> = React.memo(({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 dark:bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 dark:hover:text-gray-400 transition-colors"
          aria-label="닫기"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
});

ImageModal.displayName = 'ImageModal';

const ProjectDetailGallery: React.FC<ProjectDetailGalleryProps> = React.memo(({ 
  screenshots, 
  projectTitle,
  className = '' 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6); // 처음에 6개만 표시

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const visibleScreenshots = screenshots.slice(0, visibleCount);
  const hasMore = screenshots.length > visibleCount;

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, screenshots.length));
  };

  return (
    <section id="gallery" className={`${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary">스크린샷 갤러리</h3>
        <span className="text-sm text-text-muted bg-surface-elevated dark:bg-slate-700 px-2 py-1 rounded-full border border-border">
          {screenshots.length}개 이미지
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleScreenshots.map((screenshot, index) => (
          <GalleryImage
            key={index}
            src={screenshot}
            alt={`${projectTitle} 스크린샷 ${index + 1}`}
            onClick={() => handleImageClick(screenshot)}
          />
        ))}
      </div>
      
      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-surface-elevated dark:bg-slate-700 hover:bg-surface dark:hover:bg-slate-600 text-text-primary rounded-lg transition-colors font-medium border border-border"
          >
            더 보기 ({screenshots.length - visibleCount}개 더)
          </button>
        </div>
      )}
      
      {/* 이미지 모달 */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt={`${projectTitle} 스크린샷`}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </section>
  );
});

ProjectDetailGallery.displayName = 'ProjectDetailGallery';

export { ProjectDetailGallery };
