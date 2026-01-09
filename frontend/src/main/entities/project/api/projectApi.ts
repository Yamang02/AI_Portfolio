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
import { ApiResponse } from '../../../shared/types/api';

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

class ProjectApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

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
    
    const response = await this.request<Project[]>(endpoint);
    return response.data || [];
  }

  /**
   * 관리자용 프로젝트 상세 조회
   */
  async getAdminProject(id: number | string): Promise<Project> {
    const response = await this.request<Project>(`/api/admin/projects/${id}`);
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 생성
   */
  async createProject(project: ProjectCreateRequest): Promise<Project> {
    const response = await this.request<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 수정
   */
  async updateProject(id: number | string, project: ProjectUpdateRequest): Promise<Project> {
    const response = await this.request<Project>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
    return response.data!;
  }

  /**
   * 관리자용 프로젝트 삭제
   */
  async deleteProject(id: number | string): Promise<void> {
    await this.request<void>(`/api/admin/projects/${id}`, {
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

