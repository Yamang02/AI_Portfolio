// API 클라이언트 - 백엔드 서버와 통신 (하이브리드 방식)
import type { ApiResponse as ApiResponseType, BackendChatResponse, ChatbotResponse } from '@/shared/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponseType<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 쿠키 포함 (세션 인증에 필요)
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      // 비즈니스 로직 오류는 200 OK로 반환되므로 정상 처리
      if (response.ok) {
        return data;
      }

      // 시스템 오류만 예외로 던짐
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = { data };
      throw error;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }



  // AI 챗봇 API (하이브리드 방식)
  async getChatbotResponse(question: string, selectedProject?: string): Promise<ChatbotResponse> {
    const response = await this.request<BackendChatResponse>('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ question, selectedProject }),
    });

    const chatData = response.data;
    
    return { 
      response: chatData?.response || 'I_CANNOT_ANSWER',
      showEmailButton: chatData?.showEmailButton || false,
      responseType: chatData?.responseType,
      reason: chatData?.reason,
      // 레거시 호환성을 위한 필드들
      isRateLimited: chatData?.responseType === 'RATE_LIMITED',
      rateLimitMessage: chatData?.responseType === 'RATE_LIMITED' ? chatData?.reason : undefined
    };
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

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/data/projects?${queryString}` : '/api/data/projects';
    const response = await this.request<any[]>(endpoint);
    return response.data || [];
  }

  async getProjectById(id: string): Promise<any> {
    const response = await this.request<any>(`/api/data/projects/${encodeURIComponent(id)}`);
    return response.data;
  }

  // GitHub API
  async getGitHubProjects(): Promise<any[]> {
    const response = await this.request<any[]>('/api/github/projects');
    return response.data || [];
  }

  async getGitHubProject(repoName: string): Promise<any> {
    const response = await this.request<any>(`/api/github/project/${repoName}`);
    return response.data;
  }

  // 정적 데이터 API
  async getExperiences(): Promise<any[]> {
    const response = await this.request<any[]>('/api/data/experiences');
    return response.data || [];
  }

  async getEducation(): Promise<any[]> {
    const response = await this.request<any[]>('/api/data/education');
    return response.data || [];
  }

  async getCertifications(): Promise<any[]> {
    const response = await this.request<any[]>('/api/data/certifications');
    return response.data || [];
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
  async healthCheck(): Promise<string> {
    const response = await this.request<string>('/api/chat/health');
    return response.data || 'unknown';
  }

  // 사용량 제한 상태 확인
  async getChatUsageStatus(): Promise<{
    dailyCount: number;
    hourlyCount: number;
    timeUntilReset: number;
    isBlocked: boolean;
  }> {
    const response = await this.request<{
      dailyCount: number;
      hourlyCount: number;
      timeUntilReset: number;
      isBlocked: boolean;
    }>('/api/chat/status');
    return response.data || { dailyCount: 0, hourlyCount: 0, timeUntilReset: 0, isBlocked: false };
  }

  // 기술 스택 API
  async getTechStacks(): Promise<any[]> {
    const response = await this.request<any[]>('/api/tech-stack');
    return response.data || [];
  }

  async getCoreTechStacks(): Promise<any[]> {
    const response = await this.request<any[]>('/api/tech-stack/core');
    return response.data || [];
  }

  async getTechStackByName(name: string): Promise<any> {
    const response = await this.request<any>(`/api/tech-stack/${name}`);
    return response.data;
  }

  async getTechStacksByCategory(category: string): Promise<any[]> {
    const response = await this.request<any[]>(`/api/tech-stack/category/${category}`);
    return response.data || [];
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 정의
export type { ApiResponse } from '@/shared/types/api';
