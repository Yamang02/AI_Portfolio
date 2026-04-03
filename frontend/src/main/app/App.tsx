import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { useThemeInit } from '@/shared/lib/useThemeInit';
import { AppProvider } from './providers/AppProvider';
import { MainAppRoutes } from './MainAppRoutes';

/**
 * Main 앱의 최상위 컴포넌트
 * - 모든 라우팅과 프로바이더를 통합 관리
 * - FSD app layer의 진입점
 * - Admin은 `admin.html` MPA 진입점에서만 로드한다.
 */
export const App: React.FC = () => {
  useThemeInit();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/*"
          element={
            <AppProvider>
              <MainAppRoutes />
            </AppProvider>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
};
