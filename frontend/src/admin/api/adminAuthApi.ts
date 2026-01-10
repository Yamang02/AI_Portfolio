import { ApiResponse } from '../../shared/types/api';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminUserInfo {
  username: string;
  role: string;
  lastLogin: string;
}

// 개발 환경: 빈 문자열 사용하여 Vite 프록시로 same-origin 쿠키 전송
// 프로덕션: 실제 API 서버 URL 사용
const API_BASE_URL = import.meta.env?.DEV
  ? ''
  : (import.meta.env?.VITE_API_BASE_URL || '');

class AdminAuthApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 쿠키 포함
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    // JSON 파싱 시도
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (error) {
      // JSON 파싱 실패 시
      throw new Error(`응답을 파싱할 수 없습니다. HTTP ${response.status}`);
    }

    // ApiResponse 구조 확인
    if (data && typeof data === 'object' && 'success' in data) {
      // success가 false인 경우 에러로 처리
      if (!data.success) {
        const errorMessage = data.error || data.message || '요청 처리 중 오류가 발생했습니다.';
        throw new Error(errorMessage);
      }
      
      // success가 true이면 정상 반환
      return data;
    }

    // ApiResponse 구조가 아닌 경우
    // HTTP 에러 상태이면 에러 throw
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    // HTTP 200이지만 ApiResponse 구조가 아닌 경우
    // 기본 구조로 래핑하여 반환
    return {
      success: true,
      message: '',
      data: data as T,
    };
  }

  async login(credentials: AdminLoginRequest): Promise<ApiResponse<AdminUserInfo>> {
    // 평문 비밀번호를 그대로 전송 (백엔드에서 해시 비교)
    return this.request<AdminUserInfo>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/admin/auth/logout', {
      method: 'POST',
    });
  }

  async getSession(): Promise<ApiResponse<AdminUserInfo>> {
    return this.request<AdminUserInfo>('/api/admin/auth/session');
  }
}

export const adminAuthApi = new AdminAuthApi();
