import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../../../widgets/header';
import { HeroSection } from '../../../widgets/hero-section';
import { PortfolioSection } from '../../../features/project-list';
import { ChatbotWidget } from '../../../widgets/chatbot';
import { HistoryPanel } from '../../../widgets/history-panel';
import { useProjectsQuery } from '../../../entities/project';
import { useExperiencesQuery } from '../../../entities/experience';
import { useEducationQuery } from '../../../entities/education';
import { useCertificationsQuery } from '../../../entities/certification';

interface HomePageProps {
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
  isChatbotOpen,
  isHistoryPanelOpen,
  isWideScreen,
  onChatbotToggle,
  onHistoryPanelToggle
}) => {
  const location = useLocation();

  // 데이터 가져오기
  const { data: projects = [], isLoading: projectsLoading } = useProjectsQuery();
  const { data: experiences = [], isLoading: experiencesLoading } = useExperiencesQuery();
  const { data: educations = [], isLoading: educationsLoading } = useEducationQuery();
  const { data: certifications = [], isLoading: certificationsLoading } = useCertificationsQuery();

  const isLoading = projectsLoading || experiencesLoading || educationsLoading || certificationsLoading;

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
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 포트폴리오 섹션 */}
      <PortfolioSection
        projects={projects}
        experiences={experiences}
        educations={educations}
        certifications={certifications}
        isLoading={isLoading}
        loadingStates={{
          projects: projectsLoading,
          experiences: experiencesLoading,
          educations: educationsLoading,
          certifications: certificationsLoading
        }}
      />

      {/* 챗봇 위젯 */}
      <ChatbotWidget
        isOpen={isChatbotOpen}
        onToggle={onChatbotToggle}
        showProjectButtons={true}
      />

      {/* 히스토리 패널 (와이드 스크린에서만 표시) */}
      {isWideScreen && (
        <HistoryPanel
          projects={projects}
          experiences={experiences}
          educations={educations}
          isOpen={isHistoryPanelOpen}
          onToggle={onHistoryPanelToggle}
        />
      )}
    </div>
  );
};

export default HomePage;
