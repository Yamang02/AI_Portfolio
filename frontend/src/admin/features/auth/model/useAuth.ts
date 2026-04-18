import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAuthApi, AdminUserInfo } from '@/admin/entities/auth';
import { STALE_TIME } from '@/shared/config/queryCacheConfig';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const queryClient = useQueryClient();

  // 세션 상태 확인
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['admin-session'],
    queryFn: () => adminAuthApi.getSession(),
    retry: false,
    staleTime: STALE_TIME.NONE, // 캐시 사용 안함 - 항상 최신 상태 확인
    gcTime: 0, // 가비지 컬렉션 즉시 (이전 cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    // 로딩 중이 아닐 때만 인증 상태 업데이트
    if (!isLoading) {
      // ApiResponse<AdminUserInfo> 구조에서 data가 있으면 인증됨
      if (sessionData?.success && sessionData?.data) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [sessionData, isLoading, error]);

  const login = async (username: string, password: string) => {
    try {
      const response = await adminAuthApi.login({ username, password });

      // ApiResponse<AdminUserInfo> 구조: { success, message, data: AdminUserInfo }
      if (response.success && response.data) {
        // 1. 먼저 기존 캐시를 완전히 제거
        await queryClient.invalidateQueries({ queryKey: ['admin-session'] });

        // 2. 새로운 세션 데이터를 캐시에 설정
        queryClient.setQueryData(['admin-session'], response);

        // 3. 인증 상태 설정
        setIsAuthenticated(true);

        return { success: true, user: response.data };
      } else {
        return {
          success: false,
          message: response.error || response.message || '로그인 실패'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || '로그인 중 오류가 발생했습니다'
      };
    }
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
    } catch {
      // API 실패여도 클라이언트 측 세션 상태는 정리
    }
    setIsAuthenticated(false);
    queryClient.removeQueries({ queryKey: ['admin-session'] });
    globalThis.location.href = '/admin/login';
    return { success: true };
  };

  const value: AuthContextType = {
    isAuthenticated: isAuthenticated === true,
    isLoading: isLoading || isAuthenticated === null,
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
