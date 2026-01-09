import React, { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './providers/AppProvider';
import { PageLayout } from '@/main/widgets/page-layout';
import { HomePageLayout } from '@/main/widgets/home-page-layout';
import { HomePage } from '@/main/pages/HomePage';
import { ProjectsListPage } from '@/main/pages/ProjectsListPage';
import { ProjectDetailPage } from '@/main/pages/ProjectDetailPage';
import { ProfilePage } from '@/main/pages/ProfilePage';
import { ChatPage } from '@/main/pages/ChatPage';
import { AnimatedRoutes } from '@/shared/ui/page-transition';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';

/**
 * MainApp의 라우팅 컴포넌트
 * AppProvider 내부에서 사용되므로 useApp 훅 사용 가능
 */
const MainAppContent: React.FC = () => {
  const location = useLocation();
  const {
    projects,
    experiences,
    educations,
    certifications,
    isLoading,
    loadingStates
  } = useApp();

  // 푸터 표시: 홈페이지, 프로필 페이지, 프로젝트 페이지에 표시
  // 챗봇 페이지와 프로젝트 상세 페이지는 푸터 제외
  const showFooter = ['/', '/profile', '/projects'].includes(location.pathname);
  
  // 홈페이지는 스크롤 드리븐 애니메이션을 위해 overflow 제어 제외
  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';


  // React Router의 기본 스크롤 복원 비활성화
  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // 전체 로딩 상태
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

  // 홈페이지는 HomePageLayout 사용 (scroll-driven animation 지원)
  if (isHomePage) {
    return (
      <HomePageLayout showFooter={true}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </HomePageLayout>
    );
  }

  // 다른 페이지는 PageLayout 사용
  return (
    <PageLayout showFooter={showFooter} footerVisible={true}>
      <div
        className="font-sans transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          overflowX: 'hidden',
          overflowY: isChatPage ? 'hidden' : 'auto', // 챗봇 페이지는 내부 스크롤만 사용
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AnimatedRoutes
          isLoading={isLoading}
          loadingStates={loadingStates}
        >
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </AnimatedRoutes>
      </div>
    </PageLayout>
  );
};

/**
 * MainApp 라우팅 컴포넌트
 * AppProvider는 상위 App.tsx에서 제공됨
 */
export const MainAppRoutes: React.FC = () => {
  return <MainAppContent />;
};
