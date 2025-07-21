import React from 'react';
import { Project, Experience, Certification } from '../types';
import ProjectCard from './ProjectCard';
import ExperienceCard from './ExperienceCard';
import CertificationCard from './CertificationCard';
import HistoryPanel from './HistoryPanel';
import PanelToggle from './PanelToggle';

interface PortfolioSectionProps {
  projects: Project[];
  experiences: Experience[];
  certifications: Certification[];
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ 
  projects, 
  experiences,
  certifications
}) => {
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = React.useState(false);
  const [highlightedItemId, setHighlightedItemId] = React.useState<string | undefined>();

  // 히스토리 패널 토글
  const toggleHistoryPanel = () => {
    setIsHistoryPanelOpen(!isHistoryPanelOpen);
    if (isHistoryPanelOpen) {
      setHighlightedItemId(undefined);
    }
  };

  // 아이템 하이라이트 처리
  const handleItemHover = (itemId?: string) => {
    setHighlightedItemId(itemId);
  };

  return (
    <section id="portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-black">포트폴리오</h2>
        <p className="mt-2 text-gray-500">
          프로젝트, 경력/교육, 자격증을 한눈에 볼 수 있습니다. 우측 하단의 AI 비서에게 무엇이든 물어보세요!
        </p>
      </div>

      {/* 프로젝트 영역 */}
      <div id="project" className="mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-black mb-[2.25rem]">프로젝트</h3>
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <p className="text-gray-500 text-lg">프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onMouseEnter={() => handleItemHover(project.id)}
                onMouseLeave={() => handleItemHover(undefined)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 경력/교육 영역 */}
      <div id="experience" className="mt-6 mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-black mb-[2.25rem]">경력/교육</h3>
        {experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎓</div>
            <p className="text-gray-500 text-lg">경력/교육 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map(experience => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onMouseEnter={() => handleItemHover(experience.id)}
                onMouseLeave={() => handleItemHover(undefined)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 자격증 영역 */}
      <div id="certification" className="mt-6 mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-black mb-[2.25rem]">자격증</h3>
        {certifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <p className="text-gray-500 text-lg">자격증이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certifications.map(certification => (
              <CertificationCard
                key={certification.id}
                certification={certification}
                onMouseEnter={() => handleItemHover(certification.id)}
                onMouseLeave={() => handleItemHover(undefined)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 히스토리 패널 */}
      <HistoryPanel 
        isOpen={isHistoryPanelOpen}
        projects={projects}
        experiences={experiences}
        highlightedItemId={highlightedItemId}
        onToggle={toggleHistoryPanel}
        onItemHover={handleItemHover}
      />
      
      {/* 패널 토글 버튼 */}
      <PanelToggle 
        isOpen={isHistoryPanelOpen} 
        onToggle={toggleHistoryPanel} 
      />
    </section>
  );
};

export default PortfolioSection; 