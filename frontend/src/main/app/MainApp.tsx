import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/queryClient';
import { AppProvider, useApp } from '../app/providers/AppProvider';
import { ThemeProvider } from '@shared/providers/ThemeProvider';
import { HomePage } from '../layout/components/HomePage';
import { ProjectDetailPage } from '../pages/ProjectDetail/ProjectDetailPage';
import {
  EasterEggProvider,
  EasterEggLayer,
  useEasterEggEscapeKey,
  easterEggRegistry,
  defaultTriggers,
  defaultEffects,
} from '@features/easter-eggs';

const MainAppContent: React.FC = () => {
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

  // ESC 키로 이스터에그 종료
  useEasterEggEscapeKey();

  // React Router의 기본 스크롤 복원 비활성화
  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // 챗봇 토글
  const handleChatbotToggle = () => {
    setChatbotOpen((prev) => !prev);
  };

  // 히스토리 패널 토글
  const handleHistoryPanelToggle = () => {
    setHistoryPanelOpen((prev) => !prev);
  };

  // 전체 로딩 상태
  const isInitialLoading = isLoading &&
    loadingStates.projects &&
    loadingStates.experiences &&
    loadingStates.educations &&
    loadingStates.certifications;

  if (isInitialLoading) {
    return (
      <div 
        className="min-h-screen font-sans flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-text-secondary">포트폴리오를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen font-sans transition-colors"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
      }}
    >
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
            isChatbotOpen={isChatbotOpen}
            isHistoryPanelOpen={isHistoryPanelOpen}
            isWideScreen={isWideScreen}
            onChatbotToggle={handleChatbotToggle}
            onHistoryPanelToggle={handleHistoryPanelToggle}
          />
        } />

        {/* 프로젝트 상세 페이지 */}
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
      
      {/* 이스터에그 레이어 */}
      <EasterEggLayer />
    </div>
  );
};

const MainApp: React.FC = () => {
  // 이스터에그 초기화
  useEffect(() => {
    // 기본 트리거 및 이펙트 등록
    defaultTriggers.forEach(trigger => {
      easterEggRegistry.registerTrigger(trigger);
    });

    defaultEffects.forEach(effect => {
      easterEggRegistry.registerEffect(effect);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
          <EasterEggProvider maxConcurrent={1} initialEnabled={true}>
            <MainAppContent />
          </EasterEggProvider>
        </AppProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export { MainApp };
