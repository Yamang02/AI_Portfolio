// API 클라이언트 - 백엔드 서버와 통신
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  response?: string;
  count?: number;
  counts?: {
    experiences: number;
    education: number;
    certifications: number;
  };
  timestamp?: string;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async requestDirect<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // AI 챗봇 API
  async getChatbotResponse(question: string, selectedProject?: string): Promise<string> {
    const response = await this.request<{ response: string }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ question, selectedProject }),
    });

    return response.response || 'I_CANNOT_ANSWER';
  }

  // 프로젝트 API
  async getProjects(params?: {
    type?: 'project' | 'certification';
    source?: 'github' | 'local' | 'certification';
    isTeam?: boolean;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.source) queryParams.append('source', params.source);
    if (params?.isTeam !== undefined) queryParams.append('isTeam', params.isTeam.toString());

    const endpoint = `/api/data/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.requestDirect<any[]>(endpoint);
    return response || [];
  }

  async getProjectById(id: string): Promise<any> {
    const response = await this.request<any>(`/api/projects/${id}`);
    return response.data;
  }

  // GitHub API
  async getGitHubRepos(params?: {
    sort?: 'updated' | 'created' | 'pushed' | 'full_name';
    per_page?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

    const endpoint = `/api/github/repos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any[]>(endpoint);
    return response.data || [];
  }

  async getGitHubRepoByName(name: string): Promise<any> {
    const response = await this.request<any>(`/api/github/repos/${name}`);
    return response.data;
  }

  async getGitHubUser(): Promise<any> {
    const response = await this.request<any>('/api/github/user');
    return response.data;
  }

  // 정적 데이터 API
  async getExperiences(): Promise<any[]> {
    const response = await this.requestDirect<any[]>('/api/data/experiences');
    return response || [];
  }

  async getEducation(): Promise<any[]> {
    const response = await this.requestDirect<any[]>('/api/data/education');
    return response || [];
  }

  async getCertifications(): Promise<any[]> {
    const response = await this.requestDirect<any[]>('/api/data/certifications');
    return response || [];
  }

  async getAllData(): Promise<{
    experiences: any[];
    education: any[];
    certifications: any[];
  }> {
    const response = await this.request<{
      experiences: any[];
      education: any[];
      certifications: any[];
    }>('/api/data/all');
    return response.data || { experiences: [], education: [], certifications: [] };
  }

  // 헬스 체크
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.request<{ status: string; timestamp: string; version: string }>('/health');
    return response.data || { status: 'unknown', timestamp: '', version: '' };
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 정의
export type { ApiResponse }; 