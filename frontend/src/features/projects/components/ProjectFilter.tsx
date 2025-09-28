import React from 'react';
import { Project } from '../types';

interface ProjectFilterProps {
  projects: Project[];
  onFilteredProjectsChange: (filteredProjects: Project[]) => void;
  className?: string;
}

export interface FilterOptions {
  isTeam: 'all' | 'team' | 'individual';
  status: 'all' | 'completed' | 'in_progress' | 'maintenance';
  technology: string;
  sortBy: 'startDate' | 'endDate' | 'title' | 'status' | 'sortOrder';
  sortOrder: 'asc' | 'desc';
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
  projects,
  onFilteredProjectsChange,
  className = ''
}) => {
  const [filters, setFilters] = React.useState<FilterOptions>({
    isTeam: 'all',
    status: 'all',
    technology: '',
    sortBy: 'startDate',
    sortOrder: 'desc'
  });

  // 고유한 기술 스택 목록 추출
  const allTechnologies = React.useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.technologies?.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // 필터링 및 정렬 로직
  const applyFilters = React.useCallback((filterOptions: FilterOptions) => {
    let filtered = [...projects];

    // 팀/개인 필터
    if (filterOptions.isTeam !== 'all') {
      filtered = filtered.filter(project =>
        filterOptions.isTeam === 'team' ? project.isTeam : !project.isTeam
      );
    }

    // 상태 필터 - null/undefined 처리 및 대소문자 구분 없이 비교
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(project => {
        const projectStatus = project.status || 'completed'; // 기본값으로 'completed' 설정
        return projectStatus.toLowerCase() === filterOptions.status.toLowerCase();
      });
    }

    // 기술 스택 필터
    if (filterOptions.technology) {
      filtered = filtered.filter(project =>
        project.technologies?.some(tech =>
          tech.toLowerCase().includes(filterOptions.technology.toLowerCase())
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
        default:
          compareValue = 0;
      }

      return filterOptions.sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [projects]);

  // 필터 변경 시 결과 업데이트
  React.useEffect(() => {
    const filteredProjects = applyFilters(filters);
    onFilteredProjectsChange(filteredProjects);
  }, [filters, applyFilters, onFilteredProjectsChange]);

  // 잘못된 sortBy 값 보정
  React.useEffect(() => {
    if (filters.sortBy === 'date' || filters.sortBy === 'type' || !['startDate', 'endDate', 'title', 'status', 'sortOrder'].includes(filters.sortBy as string)) {
      setFilters(prev => ({ ...prev, sortBy: 'startDate' }));
    }
  }, [filters.sortBy]);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      isTeam: 'all',
      status: 'all',
      technology: '',
      sortBy: 'startDate',
      sortOrder: 'desc'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${className}`}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">필터 & 정렬</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          초기화
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 프로젝트 타입 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로젝트 타입
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

        {/* 상태 필터 */}
        <div>
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

        {/* 기술 스택 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기술 스택
          </label>
          <select
            value={filters.technology}
            onChange={(e) => updateFilter('technology', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체</option>
            {allTechnologies.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>

        {/* 정렬 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="startDate">시작일</option>
              <option value="endDate">종료일</option>
              <option value="title">제목</option>
              <option value="status">상태</option>
              <option value="sortOrder">우선순위</option>
            </select>
            <button
              onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title={filters.sortOrder === 'asc' ? '오름차순' : '내림차순'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>


      {/* 필터 결과 요약 */}
      <div className="mt-4 text-sm text-gray-600">
        {projects.length}개 프로젝트 중 필터링된 결과를 표시합니다.
      </div>
    </div>
  );
};

export default ProjectFilter;