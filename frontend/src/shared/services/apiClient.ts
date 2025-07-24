// API 클라이언트 - 백엔드 서버와 통신 (하이브리드 방식)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 백엔드 API 응답 구조
interface ApiResponse<T> {
  success: boolean;                    // API 호출 성공 여부
  message: string;                     // API 응답 메시지
  data?: T;                           // 실제 데이터
  error?: string;                     // 시스템 오류 메시지
}

// 백엔드 ResponseType과 일치하는 타입 정의
type ResponseType = 
  | 'SUCCESS'           // 정상적인 AI 응답
  | 'RATE_LIMITED'      // 사용량 제한 초과
  | 'CANNOT_ANSWER'     // AI가 답변할 수 없는 질문
  | 'PERSONAL_INFO'     // 개인정보 요청 감지
  | 'INVALID_INPUT'     // 입력 검증 실패
  | 'SYSTEM_ERROR'      // 실제 시스템 오류
  | 'SPAM_DETECTED';    // 스팸 패턴 감지

// 백엔드 ChatResponse 구조
interface BackendChatResponse {
  response: string;                    // 응답 메시지
  success: boolean;                    // 비즈니스 로직 성공 여부
  error?: string;                     // 오류 메시지
  showEmailButton: boolean;           // 메일 버튼 표시 여부
  responseType: ResponseType;         // 응답 타입
  reason?: string;                    // 상세 이유
}

// 프론트엔드 API 응답 타입 (하이브리드 방식)
interface ChatbotResponse {
  response: string;                    // 응답 메시지
  isRateLimited?: boolean;             // 사용량 제한 여부 (레거시 호환성)
  rateLimitMessage?: string;           // 사용량 제한 메시지 (레거시 호환성)
  showEmailButton?: boolean;           // 메일 버튼 표시 여부
  responseType?: ResponseType;         // 응답 타입 (새로운 방식)
  reason?: string;                     // 상세 이유
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