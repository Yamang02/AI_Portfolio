import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/queryClient';
import { AppProvider, useApp } from '../app/providers/AppProvider';
import { PageLayout } from '@/widgets/layout';
import { useLocation } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ProjectsListPage } from '@/pages/ProjectsListPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ChatPage } from '@/pages/ChatPage';
import {
  EasterEggProvider,
  EasterEggLayer,
  useEasterEggEscapeKey,
  useKeyboardTrigger,
  useScrollTrigger,
  easterEggRegistry,
} from '@features/easter-eggs';
import { AudioIndicator } from '@features/easter-eggs/components/AudioIndicator';
import { loadEasterEggConfig } from '@features/easter-eggs/config/easterEggConfigLoader';
import { MobileFeatureNotice } from '../shared/ui/MobileFeatureNotice';
import { useFeatureAvailability } from '../shared/lib/hooks/useFeatureAvailability';
import { AnimatedRoutes } from '../shared/ui/page-transition';

const MainAppContent: React.FC = () => {
  const location = useLocation();
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

  const { shouldShowMobileNotice } = useFeatureAvailability();
  
  // HomePage에서만 footer를 표시 (간단한 구현)
  const showFooter = location.pathname === '/';

  // ESC 키로 이스터에그 종료
  useEasterEggEscapeKey();

  // PgDn 키 3번 누르면 이스터에그 트리거
  useKeyboardTrigger({
    easterEggId: 'demon-slayer-effect',
    key: 'PageDown',
    targetCount: 3,
    timeWindow: 3000, // 3초 내에 3번 눌러야 함
  });

  // 위에서 아래로 빠르게 스크롤하면 이스터에그 트리거
  useScrollTrigger({
    easterEggId: 'demon-slayer-effect',
    timeWindow: 5000, // 5초 이내
  });

  // ESC 키 매핑: 열린 패널 닫기 (공통)
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 챗봇이 열려있으면 닫기
        if (isChatbotOpen) {
          setChatbotOpen(false);
          return;
        }
        // 히스토리 패널이 열려있으면 닫기
        if (isHistoryPanelOpen) {
          setHistoryPanelOpen(false);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isChatbotOpen, isHistoryPanelOpen, setChatbotOpen, setHistoryPanelOpen]);

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
    <PageLayout showFooter={showFooter} footerVisible={true}>
      <div
        className="font-sans transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          overflowX: 'hidden', // 좌우 슬라이드 애니메이션을 위한 overflow 제어
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 모바일 기능 안내 메시지 */}
        {shouldShowMobileNotice && (
          <div className="container mx-auto px-4 pt-4">
            <MobileFeatureNotice />
          </div>
        )}

        <AnimatedRoutes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </AnimatedRoutes>

        {/* 이스터에그 레이어 */}
        <EasterEggLayer />
        
        {/* 오디오 재생 인디케이터 */}
        <AudioIndicator />
      </div>
    </PageLayout>
  );
};

const MainApp: React.FC = () => {
  // 테마 초기화 (localStorage에서 테마 로드)
  useEffect(() => {
    const theme = localStorage.getItem('portfolio-theme') || 'light';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === 'dark' ? 'dark' : 'light');
  }, []);

  // 이스터에그 초기화 - JSON 설정 파일에서 로드
  useEffect(() => {
    try {
      const { triggers, effects } = loadEasterEggConfig();
      
      // 트리거 등록
      triggers.forEach(trigger => {
        easterEggRegistry.registerTrigger(trigger);
      });

      // 이펙트 등록
      effects.forEach(effect => {
        easterEggRegistry.registerEffect(effect);
      });
    } catch (error) {
      console.error('Failed to load easter egg config:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <EasterEggProvider maxConcurrent={1} initialEnabled={true}>
          <MainAppContent />
        </EasterEggProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export { MainApp };
