import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectListPage } from '../pages/ProjectListPage';
import { ProjectEditPage } from '../pages/ProjectEditPage';
import { LoginForm, ProtectedRoute } from '../features/auth';
import AdminLayout from '../shared/components/AdminLayout';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AdminApp: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#8b5cf6', // 기존 프로젝트 색상
          fontFamily: 'Pretendard, sans-serif',
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#001529',
          },
          Button: {
            borderRadius: 8,
          },
        },
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes>
              {/* 로그인 페이지 */}
              <Route path="login" element={<LoginForm />} />

              {/* 보호된 관리자 라우트 */}
              <Route path="*" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  );
};

export default AdminApp;

