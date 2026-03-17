import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { initAnalyticsAndWebVitals } from '@/shared/lib/web-vitals';
import { registerChunkLoadErrorRecovery } from '@/shared/lib/chunkLoadErrorRecovery';
import { App } from './main/app/App';
// Design System Styles (Phase 3)
import './design-system/styles/reset.css';
import './design-system/styles/globals.css';
import './index.css';

// 프로덕션: 배포 직후 예전 청크 URL 요청 시 MIME/로드 오류 → 1회 자동 새로고침
registerChunkLoadErrorRecovery();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

initAnalyticsAndWebVitals();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
