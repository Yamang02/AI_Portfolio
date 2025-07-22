import React, { useEffect, useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import { PortfolioSection } from '../../projects';
import { Chatbot } from '../../chatbot';
import { ALL_PROJECTS, ALL_EXPERIENCES, ALL_EDUCATIONS, ALL_CERTIFICATIONS } from '../../projects';
import { validateConfig } from '../../../shared';

const App: React.FC = () => {
  useEffect(() => {
    // 애플리케이션 시작 시 설정 검증
    validateConfig();
  }, []);

  // 패널 상태 독립적으로 관리
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [isHistoryPanelOpen, setHistoryPanelOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      // 전체 창 너비가 2400px 이하에서는 닫힌 상태로 시작
      return window.innerWidth > 2400;
    }
    return true;
  });
  const [isWideScreen, setIsWideScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 2400;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 2400);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 챗봇 토글
  const handleChatbotToggle = () => {
    setChatbotOpen((prev) => !prev);
  };

  // 히스토리 패널 토글
  const handleHistoryPanelToggle = () => {
    setHistoryPanelOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans">
      <Header />
      <HeroSection />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PortfolioSection 
          projects={ALL_PROJECTS} 
          experiences={ALL_EXPERIENCES}
          educations={ALL_EDUCATIONS}
          certifications={ALL_CERTIFICATIONS}
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