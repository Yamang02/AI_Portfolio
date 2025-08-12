import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import { PortfolioSection } from '../../../features/projects';
import { Chatbot } from '../../../features/chatbot';
import { useApp } from '../../providers';

const App: React.FC = () => {
  const {
    projects,
    experiences,
    educations,
    certifications,
    isLoading,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-gray-700 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans">
      <Header />
      <HeroSection />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PortfolioSection 
          projects={projects} 
          experiences={experiences}
          educations={educations}
          certifications={certifications}
          isHistoryPanelOpen={isHistoryPanelOpen}
          onHistoryPanelToggle={handleHistoryPanelToggle}
          isChatbotOpen={isChatbotOpen}
          onChatbotToggle={handleChatbotToggle}
        />
      </main>
      <Chatbot isOpen={isChatbotOpen} onToggle={handleChatbotToggle} showProjectButtons={isWideScreen} />
    </div>
  );
};

export default App; 