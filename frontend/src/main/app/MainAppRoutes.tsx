import React, { lazy, Suspense } from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { PageLayout } from '@/main/widgets/page-layout';
import { AnimatedRoutes } from '@/main/shared/ui/page-transition';
import { LoadingScreen } from '@/main/shared/ui/LoadingScreen';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

// ?�머지 ?�이지??코드 ?�플리팅 ?�용
const ProjectsListPage = lazy(() => import('@/main/pages/ProjectsListPage').then(m => ({ default: m.ProjectsListPage })));
const ProjectDetailPage = lazy(() => import('@/main/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const FounderPage = lazy(() => import('@/main/pages/FounderPage').then(m => ({ default: m.FounderPage })));
const ChatPage = lazy(() => import('@/main/pages/ChatPage').then(m => ({ default: m.ChatPage })));
const ArticleListPage = lazy(() => import('@/main/pages/ArticleListPage').then(m => ({ default: m.ArticleListPage })));
const ArticleDetailPage = lazy(() => import('@/main/pages/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));

/**
 * MainApp???�우??컴포?�트
 * AppProvider??App.tsx?�서 ?�위�?감싼??
 */
const MainAppContent: React.FC = () => {
  const location = useLocation();

  // ?�터 ?�시: ?�로?�·프로젝?�·아?�클 목록???�시 (챗봇·?�세 ?�외)
  const showFooter =
    ['/profile', '/projects', '/articles'].includes(location.pathname) &&
    !location.pathname.startsWith('/projects/') &&
    !location.pathname.startsWith('/articles/');

  const isChatPage = location.pathname === '/chat';

  // React Router??기본 ?�크�?복원 비활?�화
  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <PageLayout showFooter={showFooter} footerVisible={true}>
      <div
        className="font-sans transition-colors"
        style={{
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-text-primary)',
          overflowX: 'hidden',
          overflowY: isChatPage ? 'hidden' : 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AnimatedRoutes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route
            path="/profile"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="자기소개를 불러오는 중..." />}>
                  <FounderPage />
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
 * MainApp ?�우??컴포?�트
 * AppProvider??App.tsx?�서 ?�위�??�공?? */
export const MainAppRoutes: React.FC = () => {
  return <MainAppContent />;
};
