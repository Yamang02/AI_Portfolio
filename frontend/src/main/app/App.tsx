import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { useThemeInit } from '@/shared/lib/useThemeInit';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';
import { AppProvider } from './providers/AppProvider';
import { MainAppRoutes } from './MainAppRoutes';

// AdminApp을 lazy loading으로 분리하여 메인 번들에 포함되지 않도록 함
const AdminApp = lazy(() => import('@/admin/app/AdminApp').then(module => ({ default: module.AdminApp })));

const AdminLoadingFallback = () => (
  <LoadingScreen message="관리자 페이지를 불러오는 중..." />
);

/**
 * Main 앱의 최상위 컴포넌트
 * - 모든 라우팅과 프로바이더를 통합 관리
 * - FSD app layer의 진입점
 * - Admin 앱과 Main 앱을 라우팅으로 분리
 */
export const App: React.FC = () => {
  // 테마 초기화 (한 곳에서만 처리)
  useThemeInit();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Admin 앱 - /admin/* 경로 (lazy loading) */}
        <Route 
          path="/admin/*" 
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminApp />
            </Suspense>
          } 
        />

        {/* Main 앱 - 일반 사용자 앱 */}
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
