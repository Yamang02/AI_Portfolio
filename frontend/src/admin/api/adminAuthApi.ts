import { ApiResponse } from '../../shared/types/api';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  user?: {
    username: string;
    role: string;
    lastLogin: string;
  };
}

export interface SessionInfo {
  authenticated: boolean;
  username?: string;
  role?: string;
  lastLogin?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: AdminLoginRequest): Promise<ApiResponse<AdminLoginResponse>> {
    return this.request<AdminLoginResponse>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/admin/auth/logout', {
      method: 'POST',
    });
  }

  async getSession(): Promise<ApiResponse<SessionInfo>> {
    return this.request<SessionInfo>('/api/admin/auth/session');
  }
}

export const adminAuthApi = new AdminAuthApi();

