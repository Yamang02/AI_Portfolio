import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainApp } from './main/app/MainApp';
// Design System Styles (Phase 3)
import './design-system/styles/reset.css';
import './design-system/styles/globals.css';
import './index.css';
import { LoadingScreen } from './shared/ui/LoadingScreen';

// AdminApp을 lazy loading으로 분리하여 메인 번들에 포함되지 않도록 함
const AdminApp = lazy(() => import('./admin/app/AdminApp').then(module => ({ default: module.AdminApp })));

const AdminLoadingFallback = () => (
  <LoadingScreen message="관리자 페이지를 불러오는 중..." />
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
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

        {/* 일반 사용자 앱 - 홈페이지 및 프로젝트 상세 */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
