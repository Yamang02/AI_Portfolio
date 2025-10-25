import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainApp } from './main/app/MainApp';
import { AdminApp } from './admin/app/AdminApp';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Admin 앱 - /admin/* 경로 */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* 일반 사용자 앱 - 홈페이지 및 프로젝트 상세 */}
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  </React.StrictMode>
); 