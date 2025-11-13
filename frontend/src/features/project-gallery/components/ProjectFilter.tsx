import React from 'react';
import { Project, ProjectCategory } from '@entities/project';
import { TechStackMetadata, TechStackLevel } from '@entities/tech-stack';
import { TechStackApi } from '@shared/techStackApi';
import { TechStackBadge } from '@shared/ui';
import { categorizeTechStack } from '@shared/utils/techStackCategorization';

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
  projectType: 'all' | ProjectCategory;
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
  const [availableTechs, setAvailableTechs] = React.useState<TechStackMetadata[]>([]);
  const [techStackLoading, setTechStackLoading] = React.useState(true);

  // 기술 스택 메타데이터 로드
  React.useEffect(() => {
    const fetchTechStackMetadata = async () => {
      try {
        setTechStackLoading(true);
        const data = await TechStackApi.getTechnologiesUsedInProjects();
        // 데이터 유효성 검증
        if (data && Array.isArray(data)) {
          setAvailableTechs(data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (error) {
        console.error('기술 스택 메타데이터 로드 실패:', error);
        // 폴백: 기존 방식으로 기술 스택 추출
        const techSet = new Set<string>();
        projects.forEach(project => {
          project.technologies?.forEach(tech => techSet.add(tech));
        });
        const fallbackTechs: TechStackMetadata[] = Array.from(techSet).map(tech => ({
          name: tech,
          displayName: tech,
          category: 'other' as const,
          level: 'general' as TechStackLevel,
          isCore: false,
          isActive: true,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        setAvailableTechs(fallbackTechs);
      } finally {
        setTechStackLoading(false);
      }
    };

    fetchTechStackMetadata();
  }, [projects]);

  // 필터링 로직은 상위 컴포넌트에서 처리하므로 제거

  // 잘못된 sortBy 값 보정
  React.useEffect(() => {
    if (!['startDate', 'endDate', 'title', 'status', 'sortOrder', 'type'].includes(filters.sortBy as string)) {
      onFilterOptionsChange({ ...filters, sortBy: 'startDate' });
    }
  }, [filters.sortBy, filters, onFilterOptionsChange]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFilterOptionsChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFilterOptionsChange({
      searchQuery: '',
      isTeam: 'all',
      projectType: 'all',
      status: 'all',
      selectedTechs: [],
      sortBy: 'startDate',
      sortOrder: 'desc'
    });
  };

  // 기술 스택 선택/해제 핸들러
  const handleTechStackToggle = (techName: string) => {
    onFilterOptionsChange({
      ...filters,
      selectedTechs: filters.selectedTechs.includes(techName)
        ? filters.selectedTechs.filter(tech => tech !== techName)
        : [...filters.selectedTechs, techName]
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${className}`}>
      {/* 검색 기능 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          프로젝트 검색
        </label>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          placeholder="프로젝트명을 입력하세요..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 팀/개인 필터 */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            팀/개인
          </label>
          <select
            value={filters.isTeam}
            onChange={(e) => updateFilter('isTeam', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체</option>
            <option value="team">팀 프로젝트</option>
            <option value="individual">개인 프로젝트</option>
          </select>
        </div>

        {/* 프로젝트 타입 필터 */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 타입
          </label>
          <select
            value={filters.projectType}
            onChange={(e) => updateFilter('projectType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체</option>
            <option value="BUILD">BUILD</option>
            <option value="LAB">LAB</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
        </div>

        {/* 상태 필터 */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상태
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">전체</option>
            <option value="completed">완료</option>
            <option value="in_progress">진행중</option>
            <option value="maintenance">유지보수</option>
          </select>
        </div>

        {/* 정렬 */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="startDate">시작일</option>
            <option value="endDate">종료일</option>
            <option value="title">제목</option>
            <option value="type">프로젝트 타입</option>
            <option value="status">상태</option>
            <option value="sortOrder">우선순위</option>
          </select>
        </div>

        {/* 정렬 방향 및 초기화 버튼 */}
        <div className="lg:col-span-1">
          <div className="h-6"></div> {/* 라벨 공간 확보 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title={filters.sortOrder === 'asc' ? '오름차순' : '내림차순'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <button
              onClick={resetFilters}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="필터 초기화"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <span className="text-sm text-blue-600 ml-2">
              총 {projects.length}개 프로젝트
            </span>
          </div>
        </div>
      </div>

      {/* 기술 스택 필터 (분야별 배지 방식) */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            기술 스택 필터
            {filters.selectedTechs.length > 0 && (
              <span className="ml-2 text-xs text-blue-600">
                ({filters.selectedTechs.length}개 선택됨)
              </span>
            )}
          </label>
          {filters.selectedTechs.length > 0 && (
            <button
              onClick={() => onFilterOptionsChange({ ...filters, selectedTechs: [] })}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              선택 해제
            </button>
          )}
        </div>
        
        {techStackLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, badgeIndex) => (
                    <div key={badgeIndex} className="tech-badge tech-badge--loading">
                      <div className="tech-badge__skeleton"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {categorizeTechStack(availableTechs.map(tech => tech.name)).map((group) => (
              <div key={group.name} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {group.name}
                  </h4>
                  <span className="text-xs text-gray-500">
                    ({group.techs.length}개)
                  </span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.techs.map((techName) => {
                    const tech = availableTechs.find(t => t.name === techName);
                    if (!tech) return null;
                    return (
                      <TechStackBadge
                        key={tech.name}
                        tech={tech}
                        variant="filter"
                        size="sm"
                        selected={filters.selectedTechs.includes(tech.name)}
                        onClick={() => handleTechStackToggle(tech.name)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export { ProjectFilter };