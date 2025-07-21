import React, { useState } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import HistoryPanel from './HistoryPanel';
import PanelToggle from './PanelToggle';

interface PortfolioSectionProps {
  projects: Project[];
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ projects }) => {
  const [filter, setFilter] = useState<'all' | 'project' | 'experience'>('all');
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<number | undefined>();

  // 필터링된 프로젝트 목록
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.type === filter;
  });

  // 프로젝트 타입별 개수 계산
  const projectCount = projects.filter(p => p.type === 'project').length;
  const experienceCount = projects.filter(p => p.type === 'experience').length;

  // 히스토리 패널 토글
  const toggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
    if (isHistoryPanelOpen) {
      setHighlightedItemId(undefined);
    }
  };

  // 아이템 하이라이트 처리
  const handleItemHover = (itemId?: number) => {
    setHighlightedItemId(itemId);
  };

  return (
    <section id="portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">포트폴리오</h2>
        <p className="mt-2 text-gray-500">
          제가 참여했던 프로젝트와 경험들입니다. 우측 하단의 AI 비서에게 프로젝트에 대해 무엇이든 물어보세요!
        </p>
        
        {/* 필터 버튼 */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({projects.length})
          </button>
          <button
            onClick={() => setFilter('project')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === 'project'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            프로젝트 ({projectCount})
          </button>
          <button
            onClick={() => setFilter('experience')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === 'experience'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            경험 ({experienceCount})
          </button>
        </div>
      </div>
      
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <p className="text-gray-500 text-lg">
            {filter === 'project' ? '프로젝트가 없습니다.' : 
             filter === 'experience' ? '경험이 없습니다.' : 
             '프로젝트가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onMouseEnter={() => handleItemHover(project.id)}
              onMouseLeave={() => handleItemHover(undefined)}
            />
          ))}
        </div>
      )}

      {/* 히스토리 패널 토글 버튼 */}
      <PanelToggle 
        isOpen={isHistoryPanelOpen} 
        onToggle={toggleHistoryPanel} 
      />

      {/* 히스토리 패널 */}
      <HistoryPanel
        projects={projects}
        isOpen={isHistoryPanelOpen}
        onToggle={toggleHistoryPanel}
        highlightedItemId={highlightedItemId}
        onItemHover={handleItemHover}
      />
    </section>
  );
};

export default PortfolioSection; 