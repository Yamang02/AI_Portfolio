import React, { useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, Navigate } from 'react-router-dom';
import { adminQueryClient } from '../config/queryClient';
import { AuthProvider } from '../hooks/useAuth';
import { Header } from '../../main/layout/components/Header';
import { LoginForm, ProtectedRoute } from '../features/auth';
import { AdminLayout } from '../shared/components/AdminLayout';
import { Dashboard } from '../pages/Dashboard';
import { ProjectList } from '../components/projects/ProjectList';
import { ProjectEdit } from '../pages/ProjectEdit';
import { TechStackManagement } from '../pages/TechStackManagement';
import { CareerManagement } from '../pages/CareerManagement';
import { CertificationManagement } from '../pages/CertificationManagement';
import { Settings } from '../pages/Settings';

const AdminApp: React.FC = () => {
  // 테마 초기화 (localStorage에서 테마 로드)
  useEffect(() => {
    const theme = localStorage.getItem('portfolio-theme') || 'light';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === 'dark' ? 'dark' : 'light');
  }, []);

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
              bodyBg: '#f0f2f5',
            },
            Button: {
              borderRadius: 8,
            },
          },
        }}
      >
        <AntdApp>
          <QueryClientProvider client={adminQueryClient}>
            <AuthProvider>
              <Routes>
                {/* 로그인 페이지 - 메인 헤더 포함 (일반 사용자 접근 페이지) */}
                <Route path="login" element={
                  <>
                    <Header />
                    <LoginForm />
                  </>
                } />

                {/* 보호된 관리자 라우트 - AdminLayout 사용 (헤더 없음) */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  {/* AdminLayout 내부의 중첩 라우트 */}
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects" element={<ProjectList />} />
                  <Route path="projects/new" element={<ProjectEdit />} />
                  <Route path="projects/:id" element={<ProjectEdit />} />
                  <Route path="tech-stacks" element={<TechStackManagement />} />
                  <Route path="career" element={<CareerManagement />} />
                  <Route path="certifications" element={<CertificationManagement />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </AuthProvider>
          </QueryClientProvider>
        </AntdApp>
      </ConfigProvider>
  );
};

export { AdminApp };

