import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import HeroSection from './HeroSection';
import { PortfolioSection } from '../../../features/projects';
import { Chatbot } from '../../../features/chatbot';
import { useApp } from '../../providers';
import ProjectDetailPage from '../../../pages/ProjectDetailPage';

const App: React.FC = () => {
  const {
    projects,
    experiences,
    educations,
    certifications,
    isLoading,
    loadingStates,
    isChatbotOpen,
    isHistoryPanelOpen,
    isWideScreen,
    setChatbotOpen,
    setHistoryPanelOpen
  } = useApp();

  // 챗봇 토글
  const handleChatbotToggle = () => {
    setChatbotOpen((prev) => !prev);
  };

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
      <div className="min-h-screen bg-white text-gray-700 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">포트폴리오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-700 font-sans">
        <Routes>
          {/* 홈 페이지 */}
          <Route path="/" element={
            <>
              <Header />
              <HeroSection />
              <main className="container mx-auto px-4 py-8 md:py-12">
                <PortfolioSection 
                  projects={projects} 
                  experiences={experiences}
                  educations={educations}
                  certifications={certifications}
                  loadingStates={loadingStates}
                  isHistoryPanelOpen={isHistoryPanelOpen}
                  onHistoryPanelToggle={handleHistoryPanelToggle}
                />
              </main>
              <Chatbot isOpen={isChatbotOpen} onToggle={handleChatbotToggle} showProjectButtons={isWideScreen} />
            </>
          } />
          
          {/* 프로젝트 상세 페이지 */}
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 