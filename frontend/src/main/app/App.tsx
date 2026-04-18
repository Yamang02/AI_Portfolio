import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { useThemeInit } from '@/main/shared/lib/useThemeInit';
import { AppProvider } from './providers/AppProvider';
import { MainAppRoutes } from './MainAppRoutes';

/**
 * Main ?�의 최상??컴포?�트
 * - 모든 ?�우?�과 ?�로바이?��? ?�합 관�? * - FSD app layer??진입?? * - Admin?� `admin.html` MPA 진입?�에?�만 로드?�다.
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
