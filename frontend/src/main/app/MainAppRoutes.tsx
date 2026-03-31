import React, { lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { PageLayout } from '@/main/widgets/page-layout';
import { HomePageLayout } from '@/main/widgets/home-page-layout';
import { AnimatedRoutes } from '@/shared/ui/page-transition';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

// 홈페이지는 즉시 로드 (초기 진입점)
import { HomePage } from '@/main/pages/HomePage';

// 나머지 페이지는 코드 스플리팅 적용
const ProjectsListPage = lazy(() => import('@/main/pages/ProjectsListPage').then(m => ({ default: m.ProjectsListPage })));
const ProjectDetailPage = lazy(() => import('@/main/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const ProfilePage = lazy(() => import('@/main/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ChatPage = lazy(() => import('@/main/pages/ChatPage').then(m => ({ default: m.ChatPage })));
const ArticleListPage = lazy(() => import('@/main/pages/ArticleListPage').then(m => ({ default: m.ArticleListPage })));
const ArticleDetailPage = lazy(() => import('@/main/pages/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));

/**
 * MainApp의 라우팅 컴포넌트
 * AppProvider는 App.tsx에서 상위로 감싼다.
 */
const MainAppContent: React.FC = () => {
  const location = useLocation();

  // 푸터 표시: 홈페이지, 프로필 페이지, 프로젝트 페이지, 아티클 페이지에 표시
  // 챗봇 페이지와 프로젝트 상세 페이지는 푸터 제외
  const showFooter = ['/', '/profile', '/projects', '/articles'].includes(location.pathname) && !location.pathname.startsWith('/projects/') && !location.pathname.startsWith('/articles/');
  
  // 홈페이지는 스크롤 드리븐 애니메이션을 위해 overflow 제어 제외
  const isHomePage = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';


  // React Router의 기본 스크롤 복원 비활성화
  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

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
        <AnimatedRoutes>
          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="프로필을 불러오는 중..." />}>
                  <ProfilePage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="작업물을 불러오는 중..." />}>
                  <ProjectsListPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="작업물 상세를 불러오는 중..." />}>
                  <ProjectDetailPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/articles"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="글을 불러오는 중..." />}>
                  <ArticleListPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/articles/:businessId"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="글 상세를 불러오는 중..." />}>
                  <ArticleDetailPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/chat"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="챗봇을 불러오는 중..." />}>
                  <ChatPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
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
