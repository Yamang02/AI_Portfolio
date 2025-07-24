// API 클라이언트 - 백엔드 서버와 통신
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 백엔드 ResponseType과 일치하는 타입 정의
type ResponseType = 
  | 'SUCCESS'
  | 'RATE_LIMITED'
  | 'CANNOT_ANSWER'
  | 'PERSONAL_INFO'
  | 'INVALID_INPUT'
  | 'SYSTEM_ERROR'
  | 'SPAM_DETECTED';

// API 응답 타입
interface ChatbotResponse {
  response: string;
  isRateLimited?: boolean;
  rateLimitMessage?: string;
  showEmailButton?: boolean;
  responseType?: ResponseType;
  reason?: string;
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
        const error = new Error(data.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).response = { data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }



  // AI 챗봇 API
  async getChatbotResponse(question: string, selectedProject?: string): Promise<ChatbotResponse> {
    try {
      const response = await this.request<{ 
        response: string;
        showEmailButton?: boolean;
        responseType?: string;
        reason?: string;
      }>('/api/chat/message', {
        method: 'POST',
        body: JSON.stringify({ question, selectedProject }),
      });

      return { 
        response: response.data?.response || 'I_CANNOT_ANSWER',
        showEmailButton: response.data?.showEmailButton || false,
        responseType: response.data?.responseType as ResponseType,
        reason: response.data?.reason
      };
    } catch (error: any) {
      // 400 상태 코드 (Bad Request) - 입력 검증 실패
      if (error.status === 400) {
        const errorData = error.response?.data || {};
        return {
          response: errorData.data?.response || '입력 검증에 실패했습니다.',
          showEmailButton: errorData.data?.showEmailButton || false,
          responseType: errorData.data?.responseType as ResponseType,
          reason: errorData.data?.reason
        };
      }
      
      // 429 상태 코드 (Too Many Requests) 처리
      if (error.status === 429) {
        const errorData = error.response?.data || {};
        return {
          response: errorData.data?.response || '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          isRateLimited: true,
          rateLimitMessage: errorData.data?.reason || '요청이 너무 많습니다.',
          showEmailButton: errorData.data?.showEmailButton || true,
          responseType: errorData.data?.responseType as ResponseType,
          reason: errorData.data?.reason
        };
      }
      
      throw error;
    }
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
    const response = await this.request<any[]>(endpoint);
    return response.data || [];
  }

  async getProjectById(id: string): Promise<any> {
    const response = await this.request<any>(`/api/projects/${id}`);
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
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 정의
export type { ApiResponse }; 