import React, { useState, useEffect, useRef } from 'react';
import { useProjectDetail } from './hooks/useProjectDetail';
import { ProjectDetailHeader } from './components/ProjectDetailHeader';
import { ProjectDetailContent } from './components/ProjectDetailContent';
import { ProjectDetailOverview } from './components/ProjectDetailOverview';
import { ProjectDetailTechStack } from './components/ProjectDetailTechStack';
import { ProjectDetailContribution } from './components/ProjectDetailContribution';
import { ProjectDetailGallery } from './components/ProjectDetailGallery';
import { ProjectDetailSidebar } from './components/ProjectDetailSidebar';
import { ProjectDetailSidebarToggle } from './components/ProjectDetailSidebarToggle';
import { useTOCFromDOM, useActiveSection } from '@features/project-gallery/hooks';
import { useApp } from '../../app/providers/AppProvider';

// 로딩 스켈레톤 컴포넌트
const ProjectDetailSkeleton: React.FC = () => (
  <div 
    className="min-h-screen"
    style={{
      backgroundColor: 'var(--color-background)',
    }}
  >
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* 헤더 스켈레톤 */}
      <div className="animate-pulse mb-8">
        <div className="h-8 bg-surface-elevated dark:bg-slate-700 rounded w-3/4 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-surface-elevated dark:bg-slate-700 rounded w-20"></div>
          <div className="h-6 bg-surface-elevated dark:bg-slate-700 rounded w-16"></div>
          <div className="h-6 bg-surface-elevated dark:bg-slate-700 rounded w-24"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-surface-elevated dark:bg-slate-700 rounded w-32"></div>
          <div className="h-10 bg-surface-elevated dark:bg-slate-700 rounded w-28"></div>
          <div className="h-10 bg-surface-elevated dark:bg-slate-700 rounded w-24"></div>
        </div>
      </div>
      
      {/* 컨텐츠 스켈레톤 */}
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-surface-elevated dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-surface-elevated dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-surface-elevated dark:bg-slate-700 rounded w-4/5"></div>
        <div className="h-64 bg-surface-elevated dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-surface-elevated dark:bg-slate-700 rounded w-full"></div>
        <div className="h-4 bg-surface-elevated dark:bg-slate-700 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

// 에러 컴포넌트
const ProjectDetailError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div 
    className="min-h-screen flex items-center justify-center"
    style={{
      backgroundColor: 'var(--color-background)',
    }}
  >
    <div className="text-center max-w-md mx-auto px-6">
      <div className="text-6xl mb-4">😕</div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">프로젝트를 불러올 수 없습니다</h1>
      <p className="text-text-secondary mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors font-medium"
      >
        다시 시도
      </button>
    </div>
  </div>
);

const ProjectDetailPage: React.FC = () => {
  const { project, loading, error, markdownContent, handleBack } = useProjectDetail();
  const { isWideScreen } = useApp();

  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // 마크다운 컨테이너 ref (DOM 기반 TOC 생성용)
  const markdownContainerRef = useRef<HTMLElement>(null);

  // 프로젝트 상세 페이지는 항상 최상단으로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // TOC 생성 (DOM 기반 - 실제 렌더된 헤딩 기준)
  const tocItems = useTOCFromDOM(markdownContainerRef);
  const activeSection = useActiveSection(tocItems);
  
  // 사이드바 토글
  const handleSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // 로딩 상태
  if (loading) {
    return <ProjectDetailSkeleton />;
  }
  
  // 에러 상태
  if (error || !project) {
    return (
      <ProjectDetailError 
        error={error || '프로젝트를 찾을 수 없습니다.'} 
        onRetry={handleBack}
      />
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* 헤더 */}
      <ProjectDetailHeader 
        project={project}
      />
      
      {/* 메인 컨텐츠 영역 - 헤더와 동일한 너비 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 썸네일 이미지 */}
        {project.imageUrl && project.imageUrl !== '#' && (
          <div className="mb-8">
            <img
              src={project.imageUrl}
              alt={`${project.title} 메인 이미지`}
              className="w-full h-64 object-cover rounded-lg shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* 개요 섹션 */}
        <section id="overview" className="mb-8">
          <ProjectDetailOverview description={project.description} />
        </section>
        
        {/* 기술 스택 섹션 */}
        {project.technologies && project.technologies.length > 0 && (
          <section id="tech-stack" className="mb-8">
            <ProjectDetailTechStack technologies={project.technologies} />
          </section>
        )}
        
        {/* 스크린샷 갤러리 */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section id="gallery" className="mb-8">
            <ProjectDetailGallery 
              screenshots={project.screenshots}
              projectTitle={project.title}
            />
          </section>
        )}
        
        {/* 기여도 섹션 (팀 프로젝트인 경우) */}
        {project.isTeam && (project.role || (project.myContributions && project.myContributions.length > 0)) && (
          <section className="mb-8">
            <ProjectDetailContribution project={project} />
          </section>
        )}
        
        {/* 프로젝트 상세설명 섹션 */}
        <section id="detail" className="mb-8">
          <ProjectDetailContent 
            content={markdownContent}
            project={project}
            containerRef={markdownContainerRef}
          />
        </section>
      </main>
      
      {/* 토글 가능한 플로팅 사이드바 - 왼쪽에서 슬라이드 */}
      <div className={`fixed left-6 top-24 z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className={`transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ProjectDetailSidebar 
            project={project}
            tocItems={tocItems}
            activeSection={activeSection}
            isOpen={isSidebarOpen}
            onToggle={handleSidebarToggle}
          />
        </div>
      </div>
      
      {/* 사이드바 토글 버튼 */}
      <ProjectDetailSidebarToggle
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
      />
    </div>
  );
};

export { ProjectDetailPage };
