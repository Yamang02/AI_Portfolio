import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAuthApi, AdminUserInfo } from '../api/adminAuthApi';

// AuthContext 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  sessionData: AdminUserInfo | undefined;
  login: (username: string, password: string) => Promise<{ success: boolean; user?: AdminUserInfo; message?: string }>;
  logout: () => Promise<{ success: boolean }>;
}

// AuthContext 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  // 세션 상태 확인
  const { data: sessionData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-session'],
    queryFn: adminAuthApi.getSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // ApiResponse<AdminUserInfo> 구조에서 data가 있으면 인증됨
    if (sessionData?.success && sessionData?.data) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [sessionData]);

  const login = async (username: string, password: string) => {
    try {
      const response = await adminAuthApi.login({ username, password });
      console.log('Login API response:', response);

      // ApiResponse<AdminUserInfo> 구조: { success, message, data: AdminUserInfo }
      if (response.success && response.data) {
        // 인증 상태를 먼저 설정
        setIsAuthenticated(true);
        // 세션 쿼리 업데이트 (백그라운드에서 처리)
        queryClient.setQueryData(['admin-session'], response);
        return { success: true, user: response.data };
      } else {
        return {
          success: false,
          message: response.error || response.message || '로그인 실패'
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || '로그인 중 오류가 발생했습니다'
      };
    }
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
      setIsAuthenticated(false);
      // 로그아웃 후 세션 쿼리 무효화
      await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      await queryClient.invalidateQueries({ queryKey: ['admin-session'] });
      return { success: true }; // 로그아웃은 항상 성공으로 처리
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    error,
    sessionData: sessionData?.data,
    login,
    logout,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

// useAuth 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

