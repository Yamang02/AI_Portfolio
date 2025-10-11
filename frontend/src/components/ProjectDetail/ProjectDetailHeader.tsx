import React from 'react';
import { Project } from '../../entities/project/types';

interface ProjectDetailHeaderProps {
  project: Project;
  onBack: () => void;
  isScreenshotVisible?: boolean;
  onScreenshotToggle?: () => void;
}

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  project,
  onBack,
  isScreenshotVisible = true,
  onScreenshotToggle
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-6">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          프로젝트 목록으로 돌아가기
        </button>

        {/* 제목 - 가운데 정렬 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 break-words leading-tight">
            {project.title}
          </h1>
        </div>

        {/* 구분선 */}
        <div className="border-b border-gray-200 mb-6"></div>

        {/* 메인 이미지 */}
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
            {onScreenshotToggle && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={onScreenshotToggle}
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
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default ProjectDetailHeader;





