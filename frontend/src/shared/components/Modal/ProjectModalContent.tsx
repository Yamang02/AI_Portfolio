import React, { useState } from 'react';
import { MarkdownRenderer } from '../Markdown';
import { Project } from '../../../features/projects/types';

interface ProjectModalContentProps {
  content: string;
  project: Project;
  className?: string;
}

const ProjectModalContent: React.FC<ProjectModalContentProps> = ({
  content,
  project,
  className = ''
}) => {
  const [isScreenshotVisible, setIsScreenshotVisible] = useState(true);
  // 마크다운 컨텐츠가 있는지 확인
  const hasMarkdown = content && content.trim().length > 0;
  
  if (!hasMarkdown) {
    return (
      <div className={`flex-1 px-6 py-4 ${className}`}>
        <div className="text-center text-gray-500 py-8">
          <div className="text-lg mb-2">📝</div>
          <p>프로젝트 상세 내용이 없습니다.</p>
          <p className="text-sm mt-2">곧 추가될 예정입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      <div className="px-6 py-4">
        {/* 메인 스크린샷 섹션 */}
        {project.imageUrl && project.imageUrl !== '#' && (
          <div className="mb-6 relative group">
            {isScreenshotVisible && (
              <img
                src={project.imageUrl}
                alt={`${project.title} 메인 이미지`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            
            {/* Hover 시 나타나는 미니멀한 토글 버튼 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setIsScreenshotVisible(!isScreenshotVisible)}
                className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                title={isScreenshotVisible ? '스크린샷 숨기기' : '스크린샷 보기'}
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
              </button>
            </div>
          </div>
        )}

        {/* 마크다운 컨텐츠 */}
        <MarkdownRenderer 
          content={content}
          className="max-w-none"
        />
      </div>
    </div>
  );
};

export default ProjectModalContent;
