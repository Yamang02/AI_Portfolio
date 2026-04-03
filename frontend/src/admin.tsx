import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { initAnalyticsAndWebVitals } from '@/shared/lib/web-vitals';
import { registerChunkLoadErrorRecovery } from '@/shared/lib/chunkLoadErrorRecovery';
import { AdminApp } from '@/admin/app/AdminApp';
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
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
