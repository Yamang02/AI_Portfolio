import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { LoginForm, ProtectedRoute } from '../features/auth';
import { AdminLayout } from '../shared/components/AdminLayout';
import {
  Dashboard,
  ProjectList,
  ProjectEdit,
  TechStackManagement,
  CareerManagement,
  CertificationManagement,
  Settings,
  ProfileIntroductionManagement,
  ArticleManagement,
  ArticleEdit,
} from '../pages';
import { adminTheme } from '../shared/theme/antdTheme';

const AdminApp: React.FC = () => {
  // Admin 전용 Antd 테마 적용
  // Admin은 독립적인 디자인 체계를 사용합니다

  return (
    <ConfigProvider theme={adminTheme}>
        <AntdApp>
          <SeoHead noindex title="관리자" />
              <Routes>
                {/* Admin MPA 전용: 메인 앱 헤더 없음 */}
                <Route path="login" element={<LoginForm />} />

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
                  <Route path="profile-introduction" element={<ProfileIntroductionManagement />} />
                  <Route path="articles" element={<ArticleManagement />} />
                  <Route path="articles/new" element={<ArticleEdit />} />
                  <Route path="articles/:id" element={<ArticleEdit />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
        </AntdApp>
      </ConfigProvider>
  );
};

export { AdminApp };
