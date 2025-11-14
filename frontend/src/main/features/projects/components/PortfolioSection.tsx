import React from 'react';
import { Project, Experience, Education, Certification } from '../types';
import { ProjectCard } from './ProjectCard';
import { ExperienceCard } from './ExperienceCard';
import { EducationCard } from './EducationCard';
import { CertificationCard } from './CertificationCard';
import { HistoryPanel } from './HistoryPanel';
import { ProjectFilter, FilterOptions } from './ProjectFilter';
import { SkeletonSection } from '../../../components/common/SkeletonCard';

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
  const [filteredProjects, setFilteredProjects] = React.useState<Project[]>(projects);
  const [isFilterSectionOpen, setIsFilterSectionOpen] = React.useState(false); // 기본값: 닫힘
  
  // 필터 상태를 상위 컴포넌트에서 관리
  const [filterOptions, setFilterOptions] = React.useState<FilterOptions>({
    searchQuery: '',
    isTeam: 'all',
    projectType: 'all',
    status: 'all',
    selectedTechs: [],
    sortBy: 'startDate',
    sortOrder: 'desc'
  });

  // 필터링 및 정렬 로직
  const applyFilters = React.useCallback((filterOptions: FilterOptions) => {
    // 자격증을 제외하고 프로젝트만 필터링
    let filtered = [...projects].filter(project => project.type !== 'certification');

    // 검색 필터 (프로젝트명 기반)
    if (filterOptions.searchQuery.trim()) {
      const query = filterOptions.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query)
      );
    }

    // 팀/개인 필터
    if (filterOptions.isTeam !== 'all') {
      filtered = filtered.filter(project =>
        filterOptions.isTeam === 'team' ? project.isTeam : !project.isTeam
      );
    }

    // 프로젝트 타입 필터
    if (filterOptions.projectType !== 'all') {
      filtered = filtered.filter(project =>
        project.type === filterOptions.projectType
      );
    }

    // 상태 필터 - 대소문자 구분 없이 비교
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(project => {
        return project.status?.toLowerCase() === filterOptions.status.toLowerCase();
      });
    }

    // 기술 스택 필터 (배열 기반)
    if (filterOptions.selectedTechs.length > 0) {
      filtered = filtered.filter(project =>
        filterOptions.selectedTechs.some(selectedTech =>
          project.technologies?.some(tech =>
            tech.toLowerCase().includes(selectedTech.toLowerCase())
          )
        )
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (filterOptions.sortBy) {
        case 'startDate':
          const startDateA = new Date(a.startDate);
          const startDateB = new Date(b.startDate);
          compareValue = startDateA.getTime() - startDateB.getTime();
          break;
        case 'endDate':
          // 종료일 기준 정렬 - null인 경우(진행중) 현재 날짜로 처리
          const endDateA = a.endDate ? new Date(a.endDate) : new Date();
          const endDateB = b.endDate ? new Date(b.endDate) : new Date();
          compareValue = endDateA.getTime() - endDateB.getTime();
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusA = a.status || 'completed';
          const statusB = b.status || 'completed';
          compareValue = statusA.localeCompare(statusB);
          break;
        case 'sortOrder':
          const orderA = a.sortOrder || 0;
          const orderB = b.sortOrder || 0;
          compareValue = orderA - orderB;
          break;
        case 'type':
          const typeA = a.type || '';
          const typeB = b.type || '';
          compareValue = typeA.localeCompare(typeB);
          break;
        default:
          compareValue = 0;
      }

      return filterOptions.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [projects]);

  // 필터 옵션이 변경될 때 필터링 적용
  React.useEffect(() => {
    const filteredProjects = applyFilters(filterOptions);
    setFilteredProjects(filteredProjects);
  }, [filterOptions, applyFilters]);

  // 아이템 하이라이트 처리
  const handleItemHover = (itemId?: string) => {
    setHighlightedItemId(itemId);
  };

  // 카드에서 1초 이상 hover 시 호출
  const handleLongHover = (itemId: string) => {
    setLongHoveredItemId(itemId);
  };


  return (
    <section id="portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-text-primary">포트폴리오</h2>
        <p className="mt-2 text-text-secondary">
          프로젝트, 경력/교육, 자격증을 한눈에 볼 수 있습니다. 우측 하단의 AI 비서에게 무엇이든 물어보세요!
        </p>
      </div>

      {/* 프로젝트 영역 */}
      <div id="project" className="mb-12 scroll-mt-20">
        <div className="flex items-center gap-3 mb-[2.25rem]">
          <h3 className="text-[1.95rem] font-semibold text-text-primary">프로젝트</h3>
          <button
            onClick={() => setIsFilterSectionOpen(!isFilterSectionOpen)}
            className={`p-2 border rounded-md transition-all duration-200 ${
              isFilterSectionOpen 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-300 shadow-sm' 
                : 'bg-surface dark:bg-slate-800 border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated dark:hover:bg-slate-700 hover:border-border'
            }`}
            title={isFilterSectionOpen ? '필터 섹션 닫기' : '필터 섹션 열기'}
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
        
        {/* 필터링 컴포넌트 - 조건부 렌더링 */}
        {isFilterSectionOpen && (
          <ProjectFilter
            projects={projects}
            filterOptions={filterOptions}
            onFilterOptionsChange={setFilterOptions}
          />
        )}

        {/* 프로젝트 그리드 - 항상 렌더링 */}
        {loadingStates.projects ? (
          <SkeletonSection title="" count={3} />
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-6xl mb-4">📁</div>
            <p className="text-text-secondary text-lg">프로젝트가 없습니다.</p>
          </div>
        ) : (
          <>

            {/* 프로젝트 그리드 */}
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-text-muted text-6xl mb-4">🔍</div>
                <p className="text-text-secondary text-lg">필터 조건에 맞는 프로젝트가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* 필터링된 프로젝트들 */}
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onMouseEnter={() => handleItemHover(project.id)}
                    onMouseLeave={() => handleItemHover(undefined)}
                    isHighlighted={highlightedItemId === project.id}
                    onLongHover={handleLongHover}
                  />
                ))}
                {/* 자격증들은 필터와 관계없이 항상 표시 */}
                {projects
                  .filter(project => project.type === 'certification')
                  .map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onMouseEnter={() => handleItemHover(project.id)}
                      onMouseLeave={() => handleItemHover(undefined)}
                      isHighlighted={highlightedItemId === project.id}
                      onLongHover={handleLongHover}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 경력 영역 */}
      <div id="experience" className="mt-6 mb-12 scroll-mt-20">
        <h3 className="text-[1.95rem] font-semibold text-text-primary mb-[2.25rem]">경력</h3>
        {loadingStates.experiences ? (
          <SkeletonSection title="" count={2} />
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-6xl mb-4">💼</div>
            <p className="text-text-secondary text-lg">경력 정보가 없습니다.</p>
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
        <h3 className="text-[1.95rem] font-semibold text-text-primary mb-[2.25rem]">교육</h3>
        {loadingStates.educations ? (
          <SkeletonSection title="" count={2} />
        ) : educations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-6xl mb-4">🎓</div>
            <p className="text-text-secondary text-lg">교육 정보가 없습니다.</p>
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
        <h3 className="text-[1.95rem] font-semibold text-text-primary mb-[2.25rem]">자격증</h3>
        {loadingStates.certifications ? (
          <SkeletonSection title="" count={2} />
        ) : certifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-text-muted text-6xl mb-4">🏆</div>
            <p className="text-text-secondary text-lg">자격증이 없습니다.</p>
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
    </section>
  );
};

export { PortfolioSection }; 