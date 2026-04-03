/**
 * Admin MPA 엔트리(admin.html → 이 스크립트).
 * admin 전용 호스트로 들어온 첫 요청이 index.html이 아니라 admin.html을 타게 하려면
 * CloudFront viewer-request에서 해당 Host의 HTML 요청 URI를 /admin.html로 맞추는 설정이 필요함.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { initAnalyticsAndWebVitals } from '@/shared/lib/web-vitals';
import { registerChunkLoadErrorRecovery } from '@/shared/lib/chunkLoadErrorRecovery';
import { AdminApp } from '@/admin/app/AdminApp';
import { AdminRootGate } from '@/admin/app/AdminRootGate';
import { AuthProvider } from '@/admin/hooks/useAuth';
import { adminQueryClient } from '@/admin/config/queryClient';
import './design-system/styles/reset.css';
import './design-system/styles/globals.css';
import './index.css';

registerChunkLoadErrorRecovery();
initAnalyticsAndWebVitals();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={adminQueryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AdminRootGate />} />
              <Route path="/admin/*" element={<AdminApp />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);
