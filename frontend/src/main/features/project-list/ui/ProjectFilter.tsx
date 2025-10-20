import React from 'react';
import { Project, ProjectFilter as ProjectFilterType } from '../../../entities/project';
import { TechStack } from '../../../entities/tech-stack';
import { techStackApi } from '../../../entities/tech-stack';
import { TechStackBadge } from '../../../entities/tech-stack';

interface ProjectFilterProps {
  projects: Project[];
  className?: string;
  // Controlled component props
  filterOptions: FilterOptions;
  onFilterOptionsChange: (options: FilterOptions) => void;
}

export interface FilterOptions {
  searchQuery: string; // 검색어
  isTeam: 'all' | 'team' | 'individual';
  projectType: 'all' | 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'all' | 'completed' | 'in_progress' | 'maintenance';
  selectedTechs: string[]; // 기술 스택 배열로 변경
  sortBy: 'startDate' | 'endDate' | 'title' | 'status' | 'sortOrder' | 'type';
  sortOrder: 'asc' | 'desc';
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
  projects,
  className = '',
  filterOptions,
  onFilterOptionsChange
}) => {
  // Controlled component이므로 내부 상태 제거
  const filters = filterOptions;

  // 기술 스택 메타데이터 상태
  const [availableTechs, setAvailableTechs] = React.useState<TechStack[]>([]);
  const [techStackLoading, setTechStackLoading] = React.useState(true);

  // 기술 스택 메타데이터 로드
  React.useEffect(() => {
    const fetchTechStackMetadata = async () => {
      try {
        setTechStackLoading(true);
        const data = await techStackApi.getTechStacks();
        // 데이터 유효성 검증
        if (data && Array.isArray(data)) {
          setAvailableTechs(data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (error) {
        console.error('Failed to fetch tech stack metadata:', error);
        setAvailableTechs([]);
      } finally {
        setTechStackLoading(false);
      }
    };

    fetchTechStackMetadata();
  }, []);

  // 필터 옵션 업데이트 헬퍼
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterOptionsChange({
      ...filters,
      [key]: value
    });
  };

  // 기술 스택 토글
  const toggleTechStack = (techName: string) => {
    const newSelectedTechs = filters.selectedTechs.includes(techName)
      ? filters.selectedTechs.filter(tech => tech !== techName)
      : [...filters.selectedTechs, techName];
    
    updateFilter('selectedTechs', newSelectedTechs);
  };

  // 필터 초기화
  const resetFilters = () => {
    onFilterOptionsChange({
      searchQuery: '',
      isTeam: 'all',
      projectType: 'all',
      status: 'all',
      selectedTechs: [],
      sortBy: 'sortOrder',
      sortOrder: 'asc'
    });
  };

  // 활성 필터 개수 계산
  const activeFilterCount = [
    filters.searchQuery,
    filters.isTeam !== 'all',
    filters.projectType !== 'all',
    filters.status !== 'all',
    filters.selectedTechs.length > 0
  ].filter(Boolean).length;

  return (
    <div className={`project-filter bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* 필터 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">프로젝트 필터</h3>
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <span className="text-sm text-gray-500">
              {activeFilterCount}개 필터 적용됨
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            초기화
          </button>
        </div>
      </div>

      {/* 검색어 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          검색어
        </label>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          placeholder="프로젝트명, 설명으로 검색..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 필터 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 팀 여부 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            팀 여부
          </label>
          <select
            value={filters.isTeam}
            onChange={(e) => updateFilter('isTeam', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="team">팀 프로젝트</option>
            <option value="individual">개인 프로젝트</option>
          </select>
        </div>

        {/* 프로젝트 타입 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 타입
          </label>
          <select
            value={filters.projectType}
            onChange={(e) => updateFilter('projectType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="BUILD">개발 프로젝트</option>
            <option value="LAB">실험 프로젝트</option>
            <option value="MAINTENANCE">유지보수</option>
          </select>
        </div>

        {/* 프로젝트 상태 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 상태
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">전체</option>
            <option value="completed">완료</option>
            <option value="in_progress">진행중</option>
            <option value="maintenance">유지보수</option>
          </select>
        </div>
      </div>

      {/* 기술 스택 필터 */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          기술 스택
        </label>
        
        {techStackLoading ? (
          <div className="text-sm text-gray-500">기술 스택 로딩 중...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableTechs.map((tech) => (
              <TechStackBadge
                key={tech.name}
                tech={{
                  name: tech.name,
                  category: tech.category,
                  level: 'intermediate'
                }}
                variant="filter"
                size="sm"
                selected={filters.selectedTechs.includes(tech.name)}
                onClick={() => toggleTechStack(tech.name)}
              />
            ))}
          </div>
        )}
        
        {filters.selectedTechs.length > 0 && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-2">선택된 기술 스택:</div>
            <div className="flex flex-wrap gap-2">
              {filters.selectedTechs.map((techName) => (
                <TechStackBadge
                  key={techName}
                  tech={{
                    name: techName,
                    category: 'other',
                    level: 'intermediate'
                  }}
                  variant="filter"
                  size="sm"
                  selected={true}
                  onClick={() => toggleTechStack(techName)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 정렬 옵션 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬 기준
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sortOrder">정렬 순서</option>
            <option value="startDate">시작일</option>
            <option value="endDate">종료일</option>
            <option value="title">제목</option>
            <option value="status">상태</option>
            <option value="type">타입</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬 방향
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => updateFilter('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilter;
