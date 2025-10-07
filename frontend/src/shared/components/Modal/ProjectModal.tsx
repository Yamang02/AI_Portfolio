import React, { useState } from 'react';
import { Project } from '../../../features/projects/types';
import { useTOC, useActiveSection } from '../../../features/projects/hooks';
import ProjectModalTOC from './ProjectModalTOC';
import ProjectModalHeader from './ProjectModalHeader';
import ProjectModalContent from './ProjectModalContent';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  const [isTOCOpen, setIsTOCOpen] = useState(true);
  
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" 
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg w-full min-w-[320px] max-w-7xl mx-4 h-[90vh] relative animate-fadeIn flex overflow-hidden">
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
      </div>
    </div>
  );
};

export default ProjectModal; 