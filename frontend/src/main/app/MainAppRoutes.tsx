import React, { lazy, Suspense } from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { PageLayout } from '@/main/widgets/page-layout';
import { AnimatedRoutes } from '@/shared/ui/page-transition';
import { LoadingScreen } from '@/shared/ui/LoadingScreen';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

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

  // 푸터 표시: 프로필·프로젝트·아티클 목록에 표시 (챗봇·상세 제외)
  const showFooter =
    ['/profile', '/projects', '/articles'].includes(location.pathname) &&
    !location.pathname.startsWith('/projects/') &&
    !location.pathname.startsWith('/articles/');

  const isChatPage = location.pathname === '/chat';

  // React Router의 기본 스크롤 복원 비활성화
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
 * AppProvider는 App.tsx에서 상위로 제공됨
 */
export const MainAppRoutes: React.FC = () => {
  return <MainAppContent />;
};
