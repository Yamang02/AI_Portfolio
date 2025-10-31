/**
 * 인증 API 클라이언트
 */

import { adminAuthApi } from '../../../../admin/api/adminAuthApi';
import type { 
  AdminUserInfo, 
  LoginRequest, 
  LoginResponse, 
  LogoutResponse 
} from './auth.types';

class AuthApi {
  /**
   * 관리자 로그인
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await adminAuthApi.login(credentials);
      
      if (response.success && response.data) {
        return {
          success: true,
          user: response.data,
        };
      } else {
        return {
          success: false,
          message: response.error || response.message || '로그인 실패',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '로그인 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * 관리자 로그아웃
   */
  async logout(): Promise<LogoutResponse> {
    try {
      await adminAuthApi.logout();
      return { success: true };
    } catch (error: any) {
      return { success: true }; // 로그아웃은 항상 성공으로 처리
    }
  }

  /**
   * 관리자 세션 확인
   */
  async getSession(): Promise<AdminUserInfo | null> {
    try {
      const response = await adminAuthApi.getSession();
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const authApi = new AuthApi();
