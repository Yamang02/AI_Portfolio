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

    // 응답이 실패 상태코드여도 ApiResponse 형식일 수 있으므로 JSON 파싱 시도
    const data: ApiResponse<T> = await response.json();

    // HTTP 에러 상태이면서 ApiResponse가 아닌 경우에만 에러 throw
    if (!response.ok && !data.hasOwnProperty('success')) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
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
