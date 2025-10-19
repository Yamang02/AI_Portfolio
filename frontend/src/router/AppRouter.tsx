import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../main/App';
import AdminApp from '../admin/App';

/**
 * 메인 라우터 - 홈페이지와 Admin 앱을 분리하여 관리
 */
const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Admin 앱 - /admin/* 경로 */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* 일반 사용자 앱 - 홈페이지 및 프로젝트 상세 */}
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
