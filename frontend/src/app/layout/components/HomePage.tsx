import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import HeroSection from './HeroSection';
import { PortfolioSection } from '../../../features/projects';
import { Chatbot } from '../../../features/chatbot';

interface HomePageProps {
  projects: any[];
  experiences: any[];
  educations: any[];
  certifications: any[];
  isLoading: boolean;
  loadingStates: any;
  isChatbotOpen: boolean;
  isHistoryPanelOpen: boolean;
  isWideScreen: boolean;
  onChatbotToggle: () => void;
  onHistoryPanelToggle: () => void;
}

// 홈페이지 스크롤 위치 저장 (전역 변수로 변경)
if (typeof window !== 'undefined' && window.__homeScrollPosition === undefined) {
  window.__homeScrollPosition = 0;
}

const HomePage: React.FC<HomePageProps> = ({
  projects,
  experiences,
  educations,
  certifications,
  isLoading,
  loadingStates,
  isChatbotOpen,
  isHistoryPanelOpen,
  isWideScreen,
  onChatbotToggle,
  onHistoryPanelToggle
}) => {
  const location = useLocation();

  // 마운트 시 스크롤 위치 복원
  useEffect(() => {
    if (location.state?.fromProject) {
      // 프로젝트 상세에서 돌아온 경우 스크롤 위치 복원
      const savedPosition = window.__homeScrollPosition || 0;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      });
    } else {
      // 다른 경로에서 온 경우 최상단으로
      window.__homeScrollPosition = 0;
      window.scrollTo(0, 0);
    }
  }, [location.state]);

  // 언마운트 시 스크롤 위치 저장 (fallback)
  useEffect(() => {
    return () => {
      if (window.__homeScrollPosition === 0 || window.__homeScrollPosition === undefined) {
        window.__homeScrollPosition = window.pageYOffset;
      }
    };
  }, []);

  return (
    <>
      <Header />
      <HeroSection />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PortfolioSection 
          projects={projects}
          experiences={experiences}
          educations={educations}
          certifications={certifications}
          isLoading={isLoading}
          loadingStates={loadingStates}
          isHistoryPanelOpen={isHistoryPanelOpen}
          onHistoryPanelToggle={onHistoryPanelToggle}
        />
      </main>
      
      {/* 챗봇 패널 */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={onChatbotToggle} 
        showProjectButtons={isWideScreen} 
      />
    </>
  );
};

export default HomePage;
