/**
 * 프로젝트 목록 기능 훅
 */

import { useState, useMemo } from 'react';
import { Project } from '../../entities/project';
import { ProjectFilterOptions } from './projectList.types';

// 기본 필터 옵션
const defaultFilterOptions: ProjectFilterOptions = {
  searchQuery: '',
  isTeam: 'all',
  projectType: 'all',
  status: 'all',
  selectedTechs: [],
  sortBy: 'sortOrder',
  sortOrder: 'asc'
};

/**
 * 프로젝트 목록 관리 훅
 */
export const useProjectList = (initialProjects: Project[] = []) => {
  const [projects] = useState<Project[]>(initialProjects);
  const [filterOptions, setFilterOptions] = useState<ProjectFilterOptions>(defaultFilterOptions);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | undefined>();

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // 검색어 필터
    if (filterOptions.searchQuery) {
      const searchLower = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    }

    // 팀 여부 필터
    if (filterOptions.isTeam !== 'all') {
      const isTeam = filterOptions.isTeam === 'team';
      filtered = filtered.filter(project => project.isTeam === isTeam);
    }

    // 프로젝트 타입 필터
    if (filterOptions.projectType !== 'all') {
      filtered = filtered.filter(project => project.type === filterOptions.projectType);
    }

    // 프로젝트 상태 필터
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(project => project.status === filterOptions.status);
    }

    // 기술 스택 필터
    if (filterOptions.selectedTechs.length > 0) {
      filtered = filtered.filter(project => {
        if (!project.technologies || project.technologies.length === 0) {
          return false;
        }
        
        const projectTechNames = project.technologies.map(tech => tech.name.toLowerCase());
        return filterOptions.selectedTechs.some(selectedTech =>
          projectTechNames.includes(selectedTech.toLowerCase())
        );
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filterOptions.sortBy) {
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

      if (filterOptions.sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [projects, filterOptions]);

  // 필터 초기화
  const resetFilters = () => {
    setFilterOptions(defaultFilterOptions);
  };

  // 하이라이트된 프로젝트 설정
  const setHighlightedProject = (projectId?: string) => {
    setHighlightedProjectId(projectId);
  };

  return {
    projects,
    filteredProjects,
    filterOptions,
    highlightedProjectId,
    setFilterOptions,
    setHighlightedProject,
    resetFilters
  };
};
