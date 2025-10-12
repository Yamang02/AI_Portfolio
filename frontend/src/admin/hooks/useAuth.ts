import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAuthApi } from '../api/adminAuthApi';

interface SessionInfo {
  authenticated: boolean;
  username?: string;
  role?: string;
  lastLogin?: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 세션 상태 확인
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['admin-session'],
    queryFn: adminAuthApi.getSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionData?.data) {
      setIsAuthenticated(sessionData.data.authenticated);
    } else {
      setIsAuthenticated(false);
    }
  }, [sessionData]);

  const login = async (username: string, password: string) => {
    try {
      const response = await adminAuthApi.login({ username, password });
      if (response.data?.success) {
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: response.data?.message || '로그인 실패' };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || '로그인 중 오류가 발생했습니다' 
      };
    }
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setIsAuthenticated(false);
      return { success: true }; // 로그아웃은 항상 성공으로 처리
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    sessionData: sessionData?.data,
    login,
    logout,
  };
};

