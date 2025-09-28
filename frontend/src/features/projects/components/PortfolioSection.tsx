import React from 'react';
import { Project, Experience, Education, Certification } from '../types';
import ProjectCard from './ProjectCard';
import ExperienceCard from './ExperienceCard';
import EducationCard from './EducationCard';
import CertificationCard from './CertificationCard';
import HistoryPanel from './HistoryPanel';
import PanelToggle from './PanelToggle';
import ProjectFilter from './ProjectFilter';
import { ProjectModal } from '../../../shared/components/Modal';
import { SkeletonSection } from '../../../shared/components/SkeletonCard';

interface PortfolioSectionProps {
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  loadingStates: {
    projects: boolean;
    experiences: boolean;
    educations: boolean;
    certifications: boolean;
  };
  isHistoryPanelOpen: boolean;
  onHistoryPanelToggle: () => void;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  projects,
  experiences,
  educations,
  certifications,
  loadingStates,
  isHistoryPanelOpen,
  onHistoryPanelToggle
}) => {
  const [highlightedItemId, setHighlightedItemId] = React.useState<string | undefined>();
  const [longHoveredItemId, setLongHoveredItemId] = React.useState<string | undefined>();
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [filteredProjects, setFilteredProjects] = React.useState<Project[]>(projects);

  // projects가 변경될 때 filteredProjects 초기화
  React.useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  // 아이템 하이라이트 처리
  const handleItemHover = (itemId?: string) => {
    setHighlightedItemId(itemId);
  };

  // 카드에서 1초 이상 hover 시 호출
  const handleLongHover = (itemId: string) => {
    setLongHoveredItemId(itemId);
  };

  // 프로젝트 카드 클릭 시
  const handleProjectCardClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  // 모달 닫기
  const handleProjectModalClose = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
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
        {loadingStates.projects ? (
          <SkeletonSection title="" count={3} />
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <p className="text-gray-500 text-lg">프로젝트가 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 필터링 컴포넌트 */}
            <ProjectFilter
              projects={projects}
              onFilteredProjectsChange={setFilteredProjects}
            />

            {/* 프로젝트 그리드 */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">필터 조건에 맞는 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onMouseEnter={() => handleItemHover(project.id)}
                onMouseLeave={() => handleItemHover(undefined)}
                isHighlighted={highlightedItemId === project.id}
                onLongHover={handleLongHover}
                onClick={handleProjectCardClick}
              />
            ))}
          </div>
            )}
          </>
        )}
      </div>

      {/* 경력 영역 */}
      <div id="experience" className="mt-6 mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-black mb-[2.25rem]">경력</h3>
        {loadingStates.experiences ? (
          <SkeletonSection title="" count={2} />
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💼</div>
            <p className="text-gray-500 text-lg">경력 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map(experience => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onMouseEnter={() => handleItemHover(experience.id)}
                onMouseLeave={() => handleItemHover(undefined)}
                isHighlighted={highlightedItemId === experience.id}
                onLongHover={handleLongHover}
              />
            ))}
          </div>
        )}
      </div>

      {/* 교육 영역 */}
      <div id="education" className="mt-6 mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-black mb-[2.25rem]">교육</h3>
        {loadingStates.educations ? (
          <SkeletonSection title="" count={2} />
        ) : educations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎓</div>
            <p className="text-gray-500 text-lg">교육 정보가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {educations.map(education => (
              <EducationCard
                key={education.id}
                education={education}
                onMouseEnter={() => handleItemHover(education.id)}
                onMouseLeave={() => handleItemHover(undefined)}
                isHighlighted={highlightedItemId === education.id}
                onLongHover={handleLongHover}
              />
            ))}
          </div>
        )}
      </div>

      {/* 자격증 영역 */}
      <div id="certification" className="mt-6 mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-black mb-[2.25rem]">자격증</h3>
        {loadingStates.certifications ? (
          <SkeletonSection title="" count={2} />
        ) : certifications.length === 0 ? (
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
        educations={educations}
        highlightedItemId={highlightedItemId}
        onToggle={onHistoryPanelToggle}
        onItemHover={handleItemHover}
        scrollToItemId={longHoveredItemId}
      />

      {/* 패널 토글 버튼 */}
      <PanelToggle
        isOpen={isHistoryPanelOpen}
        onToggle={onHistoryPanelToggle}
      />
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={handleProjectModalClose}
        project={selectedProject}
      />
    </section>
  );
};

export default PortfolioSection; 