import React, { useState } from 'react';
import { Project } from '../../../features/projects/types';
import { useTOC, useActiveSection } from '../../../features/projects/hooks';
import ProjectModalTOC from './ProjectModalTOC';
import ProjectModalHeader from './ProjectModalHeader';
import ProjectModalContent from './ProjectModalContent';
import ProjectModalInfoSidebar from './ProjectModalInfoSidebar';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const [isTOCOpen, setIsTOCOpen] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // 마크다운 컨텐츠 결정 (readme 우선, 없으면 description)
  const markdownContent = project?.readme || project?.description || '';
  
  // TOC 생성 (항상 호출되어야 함)
  const tocItems = useTOC(markdownContent);
  
  // 현재 활성 섹션 추적 (항상 호출되어야 함)
  const activeSection = useActiveSection(tocItems);
  
  if (!isOpen || !project) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTOCClose = () => {
    setIsTOCOpen(false);
  };

  const handleTOCOpen = () => {
    setIsTOCOpen(true);
  };

  const handleInfoClose = () => {
    setIsInfoOpen(false);
  };

  const handleInfoOpen = () => {
    setIsInfoOpen(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" 
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full min-w-[320px] max-w-7xl mx-4 h-[90vh] relative animate-fadeIn flex overflow-hidden border-2 border-gray-200 p-4">
        {/* 내부 컨테이너 - 패딩된 영역에 테두리 적용 */}
        <div className="flex-1 flex border border-gray-200 rounded-lg overflow-hidden">
          {/* TOC 사이드바 (데스크톱) */}
          {isTOCOpen && (
            <div className="hidden lg:block">
              <ProjectModalTOC
                items={tocItems}
                activeId={activeSection}
                onClose={handleTOCClose}
              />
            </div>
          )}

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 헤더 */}
            <ProjectModalHeader 
              project={project} 
              onClose={onClose}
              className="flex-shrink-0"
            />
            
            {/* 컨텐츠 */}
            <ProjectModalContent 
              content={markdownContent}
              className="flex-1"
            />
          </div>

          {/* 오른쪽 정보 사이드바 (데스크톱) */}
          <div className="hidden xl:block">
            <ProjectModalInfoSidebar 
              project={project}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* TOC 오버레이 (모바일/태블릿) */}
        {isTOCOpen && (
          <div className="lg:hidden fixed inset-0 z-60 bg-black bg-opacity-50">
            <div className="absolute left-0 top-0 h-full w-80 max-w-[80vw]">
              <ProjectModalTOC
                items={tocItems}
                activeId={activeSection}
                onClose={handleTOCClose}
              />
            </div>
          </div>
        )}

        {/* 정보 오버레이 (모바일/태블릿) */}
        {isInfoOpen && (
          <div className="xl:hidden fixed inset-0 z-60 bg-black bg-opacity-50">
            <div className="absolute right-0 top-0 h-full w-80 max-w-[80vw]">
              <div className="relative h-full">
                <ProjectModalInfoSidebar 
                  project={project}
                  className="h-full"
                />
                <button
                  onClick={handleInfoClose}
                  className="absolute top-4 right-4 z-10 bg-white shadow-lg rounded-full p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="정보 패널 닫기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOC 토글 버튼 (모바일/태블릿) */}
        {!isTOCOpen && (
          <button
            onClick={handleTOCOpen}
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg rounded-full p-3 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="목차 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* 정보 토글 버튼 (모바일/태블릿) */}
        {!isInfoOpen && (
          <button
            onClick={handleInfoOpen}
            className="xl:hidden fixed top-4 right-4 z-50 bg-white shadow-lg rounded-full p-3 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="프로젝트 정보 열기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectModal; 