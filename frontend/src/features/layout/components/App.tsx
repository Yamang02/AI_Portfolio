import React, { useEffect, useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import { PortfolioSection } from '../../projects';
import { Chatbot } from '../../chatbot';
import { apiClient } from '../../../shared/services/apiClient';

const App: React.FC = () => {
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

  // 데이터 상태
  const [projects, setProjects] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [backendProjectsData, experiencesData, educationsData, certificationsData] = await Promise.all([
          apiClient.getProjects(),
          apiClient.getExperiences(),
          apiClient.getEducation(),
          apiClient.getCertifications()
        ]);

        // 백엔드 프로젝트만 사용
        setProjects(backendProjectsData);
        setExperiences(experiencesData);
        setEducations(educationsData);
        setCertifications(certificationsData);
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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