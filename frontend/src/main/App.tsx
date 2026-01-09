import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './layout/components/HomePage';
import { ProjectDetailPage } from './pages/ProjectDetail/ProjectDetailPage';
import { useApp } from './app/providers/AppProvider';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';

const App: React.FC = () => {
  const {
    projects,
    experiences,
    educations,
    certifications,
    isLoading,
    loadingStates,
    isHistoryPanelOpen,
    setHistoryPanelOpen
  } = useApp();

  // React Router의 기본 스크롤 복원 비활성화
  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // 히스토리 패널 토글
  const handleHistoryPanelToggle = () => {
    setHistoryPanelOpen((prev) => !prev);
  };

  // 전체 로딩 상태 (모든 데이터가 로드되지 않았을 때만)
  const isInitialLoading = isLoading && 
    loadingStates.projects && 
    loadingStates.experiences && 
    loadingStates.educations && 
    loadingStates.certifications;

  if (isInitialLoading) {
    return (
      <LoadingScreen
        message="포트폴리오를 불러오는 중..."
        showProgress={true}
        loadingStates={loadingStates}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans">
      <Routes>
        {/* 홈 페이지 */}
        <Route path="/" element={
          <HomePage
            projects={projects}
            experiences={experiences}
            educations={educations}
            certifications={certifications}
            isLoading={isLoading}
            loadingStates={loadingStates}
            isHistoryPanelOpen={isHistoryPanelOpen}
            onHistoryPanelToggle={handleHistoryPanelToggle}
          />
        } />
        
        {/* 프로젝트 상세 페이지 */}
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </div>
  );
};

export { App };
