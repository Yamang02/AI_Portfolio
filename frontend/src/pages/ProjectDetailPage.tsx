import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '../entities/project/types';
import { useApp } from '../app/providers';
import ProjectDetailHeader from '../components/ProjectDetail/ProjectDetailHeader';
import ProjectDetailTOC from '../components/ProjectDetail/ProjectDetailTOC';
import ProjectDetailContent from '../components/ProjectDetail/ProjectDetailContent';
import ProjectDetailSidebar from '../components/ProjectDetail/ProjectDetailSidebar';
import { useTOC, useActiveSection } from '../features/projects/hooks';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useApp();
  const [isTOCOpen, setIsTOCOpen] = useState(true);
  const [isScreenshotVisible, setIsScreenshotVisible] = useState(true);

  // 프로젝트 찾기
  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="min-h-screen bg-white text-gray-700 font-sans flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프로젝트를 찾을 수 없습니다</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 마크다운 컨텐츠 결정 (readme 우선, 없으면 description)
  const markdownContent = project.readme || project.description || '';
  
  // TOC 생성
  const tocItems = useTOC(markdownContent);
  
  // 현재 활성 섹션 추적
  const activeSection = useActiveSection(tocItems);

  const handleBack = () => {
    navigate('/');
  };

  const handleScreenshotToggle = () => {
    setIsScreenshotVisible(!isScreenshotVisible);
  };

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans">
      {/* 헤더 */}
      <ProjectDetailHeader 
        project={project} 
        onBack={handleBack}
        isScreenshotVisible={isScreenshotVisible}
        onScreenshotToggle={handleScreenshotToggle}
      />

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* TOC 사이드바 (데스크톱) */}
          <div className="hidden lg:block flex-shrink-0">
            <ProjectDetailTOC
              items={tocItems}
              activeId={activeSection}
              project={project}
            />
          </div>

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 min-w-0">
            <ProjectDetailContent 
              content={markdownContent}
              project={project}
            />
          </div>

          {/* 오른쪽 정보 사이드바 (데스크톱) */}
          <div className="hidden xl:block flex-shrink-0">
            <ProjectDetailSidebar 
              project={project}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;

