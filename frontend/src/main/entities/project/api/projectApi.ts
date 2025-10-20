/**
 * 프로젝트 API 클라이언트
 */

import { apiClient } from '../../../../shared/api/apiClient';
import type { 
  Project, 
  ProjectCreateRequest, 
  ProjectUpdateRequest, 
  ProjectFilter,
  ProjectDetail 
} from './project.types';

class ProjectApi {
  /**
   * 프로젝트 목록 조회
   */
  async getProjects(params?: {
    type?: 'project' | 'certification';
    source?: 'github' | 'local' | 'certification';
    isTeam?: boolean;
  }): Promise<Project[]> {
    return apiClient.getProjects(params);
  }

  /**
   * 프로젝트 상세 조회
   */
  async getProjectById(id: string): Promise<ProjectDetail> {
    return apiClient.getProjectById(id);
  }

  /**
   * 관리자용 프로젝트 목록 조회 (필터링 지원)
   */
  async getAdminProjects(filter: ProjectFilter = {}): Promise<Project[]> {
    const response = await apiClient.getAdminProjects(filter);
    return response.data || [];
  }

  /**
   * 관리자용 프로젝트 상세 조회
   */
  async getAdminProject(id: number): Promise<Project> {
    const response = await apiClient.getAdminProject(id);
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 생성
   */
  async createProject(project: ProjectCreateRequest): Promise<Project> {
    const response = await apiClient.createAdminProject(project);
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 수정
   */
  async updateProject(id: number, project: ProjectUpdateRequest): Promise<Project> {
    const response = await apiClient.updateAdminProject(id, project);
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 삭제
   */
  async deleteProject(id: number): Promise<void> {
    await apiClient.deleteAdminProject(id);
  }

  /**
   * GitHub 프로젝트 목록 조회
   */
  async getGitHubProjects(): Promise<Project[]> {
    return apiClient.getGitHubProjects();
  }

  /**
   * GitHub 프로젝트 상세 조회
   */
  async getGitHubProject(repoName: string): Promise<Project> {
    return apiClient.getGitHubProject(repoName);
  }
}

export const projectApi = new ProjectApi();
