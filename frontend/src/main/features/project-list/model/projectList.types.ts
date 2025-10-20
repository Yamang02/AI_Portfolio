/**
 * 프로젝트 목록 기능 타입 정의
 */

import { Project } from '../../entities/project';

// 프로젝트 필터 옵션
export interface ProjectFilterOptions {
  searchQuery: string;
  isTeam: 'all' | 'team' | 'individual';
  projectType: 'all' | 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'all' | 'completed' | 'in_progress' | 'maintenance';
  selectedTechs: string[];
  sortBy: 'startDate' | 'endDate' | 'title' | 'status' | 'sortOrder' | 'type';
  sortOrder: 'asc' | 'desc';
}

// 프로젝트 목록 상태
export interface ProjectListState {
  projects: Project[];
  filteredProjects: Project[];
  isLoading: boolean;
  error?: string;
  filterOptions: ProjectFilterOptions;
  highlightedProjectId?: string;
}

// 프로젝트 목록 액션
export interface ProjectListActions {
  setFilterOptions: (options: ProjectFilterOptions) => void;
  setHighlightedProject: (projectId?: string) => void;
  resetFilters: () => void;
}

// 프로젝트 목록 Props
export interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  className?: string;
  showFilter?: boolean;
  filterOptions?: ProjectFilterOptions;
  onFilterOptionsChange?: (options: ProjectFilterOptions) => void;
  onProjectClick?: (project: Project) => void;
  onProjectHover?: (projectId: string) => void;
  highlightedProjectId?: string;
}
