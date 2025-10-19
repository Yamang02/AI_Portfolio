import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import AdminLayout from './components/layout/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectEdit from './pages/ProjectEdit';
import SkillList from './pages/SkillList';
import ExperienceList from './pages/ExperienceList';
import EducationList from './pages/EducationList';
import CertificationList from './pages/CertificationList';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

/**
 * Admin Dashboard 메인 애플리케이션
 * Ant Design 테마와 React Query를 설정하고 라우팅을 구성합니다.
 */
const AdminApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#8b5cf6', // 기존 프로젝트 색상 (보라색)
              fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              borderRadius: 8,
              fontSize: 14,
            },
            components: {
              Layout: {
                headerBg: '#ffffff',
                siderBg: '#001529',
                bodyBg: '#f5f5f5',
              },
              Button: {
                borderRadius: 8,
                controlHeight: 36,
              },
              Input: {
                borderRadius: 8,
                controlHeight: 36,
              },
              Card: {
                borderRadius: 12,
              },
              Table: {
                borderRadius: 8,
              },
            },
          }}
        >
          <AuthProvider>
            <Routes>
              {/* 로그인 페이지 */}
              <Route path="/login" element={<AdminLogin />} />
              
              {/* 보호된 관리자 페이지들 */}
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                } />
                <Route path="/projects" element={
                  <AdminLayout>
                    <ProjectList />
                  </AdminLayout>
                } />
                <Route path="/projects/new" element={
                  <AdminLayout>
                    <ProjectEdit />
                  </AdminLayout>
                } />
                <Route path="/projects/:id/edit" element={
                  <AdminLayout>
                    <ProjectEdit />
                  </AdminLayout>
                } />
                <Route path="/skills" element={
                  <AdminLayout>
                    <SkillList />
                  </AdminLayout>
                } />
                <Route path="/experiences" element={
                  <AdminLayout>
                    <ExperienceList />
                  </AdminLayout>
                } />
                <Route path="/education" element={
                  <AdminLayout>
                    <EducationList />
                  </AdminLayout>
                } />
                <Route path="/certifications" element={
                  <AdminLayout>
                    <CertificationList />
                  </AdminLayout>
                } />
              </Route>
              
              {/* 기본 리다이렉트 */}
              <Route path="/*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
          </AuthProvider>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default AdminApp;
