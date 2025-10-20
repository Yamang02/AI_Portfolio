/**
 * 인증 관련 타입 정의
 */

// 관리자 사용자 정보
export interface AdminUserInfo {
  id: number;
  username: string;
  email?: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 로그인 요청
export interface LoginRequest {
  username: string;
  password: string;
}

// 로그인 응답
export interface LoginResponse {
  success: boolean;
  user?: AdminUserInfo;
  message?: string;
}

// 로그아웃 응답
export interface LogoutResponse {
  success: boolean;
  message?: string;
}

// 인증 컨텍스트 타입
export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  sessionData: AdminUserInfo | undefined;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<LogoutResponse>;
}
