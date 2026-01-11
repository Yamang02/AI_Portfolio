/**
 * 프로젝트 API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 프로젝트 API
 */

import { apiClient } from '@shared/api/apiClient';
import type { 
  Project, 
  ProjectCreateRequest, 
  ProjectUpdateRequest, 
  ProjectFilter,
  ProjectDetail,
  ProjectListParams
} from '../model/project.types';

class ProjectApi {

  /**
   * 프로젝트 목록 조회 (Main용)
   */
  async getProjects(params?: ProjectListParams): Promise<Project[]> {
    return apiClient.getProjects(params);
  }

  /**
   * 프로젝트 상세 조회 (Main용)
   */
  async getProjectById(id: string): Promise<ProjectDetail> {
    return apiClient.getProjectById(id);
  }

  /**
   * 관리자용 프로젝트 목록 조회 (필터링 지원)
   */
  async getAdminProjects(filter: ProjectFilter = {}): Promise<Project[]> {
    const params = new URLSearchParams();
    
    if (filter.search) params.append('search', filter.search);
    if (filter.isTeam) params.append('isTeam', filter.isTeam);
    if (filter.projectType) params.append('projectType', filter.projectType);
    if (filter.status) params.append('status', filter.status);
    if (filter.techs) filter.techs.forEach(tech => params.append('techs', tech));
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortOrder) params.append('sortOrder', filter.sortOrder);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/admin/projects?${queryString}` : '/api/admin/projects';
    
    const response = await apiClient.callApi<Project[]>(endpoint);
    return response.data || [];
  }

  /**
   * 관리자용 프로젝트 상세 조회
   */
  async getAdminProject(id: number | string): Promise<Project> {
    const response = await apiClient.callApi<Project>(`/api/admin/projects/${id}`);
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 생성
   */
  async createProject(project: ProjectCreateRequest): Promise<Project> {
    const response = await apiClient.callApi<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 수정
   */
  async updateProject(id: number | string, project: ProjectUpdateRequest): Promise<Project> {
    const response = await apiClient.callApi<Project>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 삭제
   */
  async deleteProject(id: number | string): Promise<void> {
    await apiClient.callApi<void>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    });
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

