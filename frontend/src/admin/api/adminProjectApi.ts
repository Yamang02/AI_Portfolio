import { ApiResponse } from '../../shared/types/api';

export interface Project {
  id: number;
  title: string;
  description: string;
  readme?: string;
  type: 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'completed' | 'in_progress' | 'maintenance';
  isTeam: boolean;
  teamSize?: number;
  role?: string;
  myContributions?: string[];
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  screenshots?: ProjectScreenshot[];
  githubUrl?: string;
  liveUrl?: string;
  externalUrl?: string;
  technologies?: Technology[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectScreenshot {
  id: number;
  imageUrl: string;
  cloudinaryPublicId?: string;
  displayOrder: number;
}

export interface Technology {
  id: number;
  name: string;
  category: string;
  proficiencyLevel?: number;
}

export interface ProjectCreateRequest {
  title: string;
  description: string;
  readme?: string;
  type: 'BUILD' | 'LAB' | 'MAINTENANCE';
  status: 'completed' | 'in_progress' | 'maintenance';
  isTeam?: boolean;
  teamSize?: number;
  role?: string;
  myContributions?: string[];
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  screenshots?: string[];
  githubUrl?: string;
  liveUrl?: string;
  externalUrl?: string;
  technologies: string[];
  sortOrder?: number;
}

export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {}

export interface ProjectFilter {
  search?: string;
  isTeam?: 'all' | 'team' | 'individual';
  projectType?: 'all' | 'BUILD' | 'LAB' | 'MAINTENANCE';
  status?: 'all' | 'completed' | 'in_progress' | 'maintenance';
  techs?: string[];
  sortBy?: 'startDate' | 'endDate' | 'title' | 'status' | 'sortOrder' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// 개발 환경에서는 상대 경로로 호출하여 Vite 프록시를 통해 동일 출처 쿠키를 사용
const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.DEV
  ? (import.meta.env.VITE_API_BASE_URL || '')  // 빈 문자열 = 상대 경로 사용
  : (import.meta.env?.VITE_API_BASE_URL || '');

class AdminProjectApi {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getProjects(filter: ProjectFilter = {}): Promise<ApiResponse<Project[]>> {
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
    
    return this.request<Project[]>(endpoint);
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/admin/projects/${id}`);
  }

  async createProject(project: ProjectCreateRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: number, project: ProjectUpdateRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    });
  }
}

export const adminProjectApi = new AdminProjectApi();

