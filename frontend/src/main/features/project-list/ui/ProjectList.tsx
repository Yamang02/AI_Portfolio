import React, { useMemo } from 'react';
import { Project } from '../../../entities/project';
import ProjectCard from './ProjectCard';
import ProjectFilter, { FilterOptions } from './ProjectFilter';
import { SkeletonCard } from '../../../../shared/ui/skeleton';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  className?: string;
  // 필터 관련 props
  showFilter?: boolean;
  filterOptions?: FilterOptions;
  onFilterOptionsChange?: (options: FilterOptions) => void;
  // 카드 관련 props
  onProjectClick?: (project: Project) => void;
  onProjectHover?: (projectId: string) => void;
  highlightedProjectId?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading = false,
  className = '',
  showFilter = true,
  filterOptions,
  onFilterOptionsChange,
  onProjectClick,
  onProjectHover,
  highlightedProjectId
}) => {
  // 기본 필터 옵션
  const defaultFilterOptions: FilterOptions = {
    searchQuery: '',
    isTeam: 'all',
    projectType: 'all',
    status: 'all',
    selectedTechs: [],
    sortBy: 'sortOrder',
    sortOrder: 'asc'
  };

  const currentFilterOptions = filterOptions || defaultFilterOptions;

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // 검색어 필터
    if (currentFilterOptions.searchQuery) {
      const searchLower = currentFilterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    }

    // 팀 여부 필터
    if (currentFilterOptions.isTeam !== 'all') {
      const isTeam = currentFilterOptions.isTeam === 'team';
      filtered = filtered.filter(project => project.isTeam === isTeam);
    }

    // 프로젝트 타입 필터
    if (currentFilterOptions.projectType !== 'all') {
      filtered = filtered.filter(project => project.type === currentFilterOptions.projectType);
    }

    // 프로젝트 상태 필터
    if (currentFilterOptions.status !== 'all') {
      filtered = filtered.filter(project => project.status === currentFilterOptions.status);
    }

    // 기술 스택 필터
    if (currentFilterOptions.selectedTechs.length > 0) {
      filtered = filtered.filter(project => {
        if (!project.technologies || project.technologies.length === 0) {
          return false;
        }
        
        const projectTechNames = project.technologies.map(tech => tech.name.toLowerCase());
        return currentFilterOptions.selectedTechs.some(selectedTech =>
          projectTechNames.includes(selectedTech.toLowerCase())
        );
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (currentFilterOptions.sortBy) {
        case 'startDate':
          aValue = a.startDate || '';
          bValue = b.startDate || '';
          break;
        case 'endDate':
          aValue = a.endDate || '';
          bValue = b.endDate || '';
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'sortOrder':
        default:
          aValue = a.sortOrder;
          bValue = b.sortOrder;
          break;
      }

      if (currentFilterOptions.sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [projects, currentFilterOptions]);

  // 필터 옵션 변경 핸들러
  const handleFilterOptionsChange = (options: FilterOptions) => {
    if (onFilterOptionsChange) {
      onFilterOptionsChange(options);
    }
  };

  // 프로젝트 클릭 핸들러
  const handleProjectClick = (project: Project) => {
    if (onProjectClick) {
      onProjectClick(project);
    }
  };

  // 프로젝트 호버 핸들러
  const handleProjectHover = (projectId: string) => {
    if (onProjectHover) {
      onProjectHover(projectId);
    }
  };

  return (
    <div className={`project-list ${className}`}>
      {/* 필터 섹션 */}
      {showFilter && (
        <div className="mb-8">
          <ProjectFilter
            projects={projects}
            filterOptions={currentFilterOptions}
            onFilterOptionsChange={handleFilterOptionsChange}
          />
        </div>
      )}

      {/* 프로젝트 목록 */}
      <div className="project-list__content">
        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <>
            {/* 결과 개수 표시 */}
            <div className="mb-6">
              <p className="text-gray-600">
                총 <span className="font-semibold text-gray-900">{filteredProjects.length}</span>개의 프로젝트
                {currentFilterOptions !== defaultFilterOptions && (
                  <span className="text-sm text-gray-500 ml-2">
                    (전체 {projects.length}개 중)
                  </span>
                )}
              </p>
            </div>

            {/* 프로젝트 그리드 */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isHighlighted={highlightedProjectId === project.id.toString()}
                    onClick={handleProjectClick}
                    onLongHover={handleProjectHover}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  프로젝트를 찾을 수 없습니다
                </h3>
                <p className="text-gray-500">
                  다른 검색어나 필터를 시도해보세요.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
