import React, { lazy, Suspense } from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { PageLayout } from '@/main/widgets/page-layout';
import { AnimatedRoutes } from '@/main/shared/ui/page-transition';
import { LoadingScreen } from '@/main/shared/ui/LoadingScreen';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

// ?˜ë¨¸ì§€ ?˜ì´ì§€??ì½”ë“œ ?¤í”Œë¦¬íŒ… ?ìš©
const ProjectsListPage = lazy(() => import('@/main/pages/ProjectsListPage').then(m => ({ default: m.ProjectsListPage })));
const ProjectDetailPage = lazy(() => import('@/main/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const FounderPage = lazy(() => import('@/main/pages/FounderPage').then(m => ({ default: m.FounderPage })));
const ChatPage = lazy(() => import('@/main/pages/ChatPage').then(m => ({ default: m.ChatPage })));
const ArticleListPage = lazy(() => import('@/main/pages/ArticleListPage').then(m => ({ default: m.ArticleListPage })));
const ArticleDetailPage = lazy(() => import('@/main/pages/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));

/**
 * MainApp???¼ìš°??ì»´í¬?ŒíŠ¸
 * AppProvider??App.tsx?ì„œ ?ìœ„ë¡?ê°ì‹¼??
 */
const MainAppContent: React.FC = () => {
  const location = useLocation();

  // ?¸í„° ?œì‹œ: ?„ë¡œ?„Â·í”„ë¡œì ?¸Â·ì•„?°í´ ëª©ë¡???œì‹œ (ì±—ë´‡Â·?ì„¸ ?œì™¸)
  const showFooter =
    ['/profile', '/projects', '/articles'].includes(location.pathname) &&
    !location.pathname.startsWith('/projects/') &&
    !location.pathname.startsWith('/articles/');

  const isChatPage = location.pathname === '/chat';

  // React Router??ê¸°ë³¸ ?¤í¬ë¡?ë³µì› ë¹„í™œ?±í™”
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
                <Suspense fallback={<LoadingScreen message="?€???Œê°œë¥?ë¶ˆëŸ¬?¤ëŠ” ì¤?.." />}>
                  <FounderPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="?‘ì—…ë¬¼ì„ ë¶ˆëŸ¬?¤ëŠ” ì¤?.." />}>
                  <ProjectsListPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="?‘ì—…ë¬??ì„¸ë¥?ë¶ˆëŸ¬?¤ëŠ” ì¤?.." />}>
                  <ProjectDetailPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/articles"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="ê¸€??ë¶ˆëŸ¬?¤ëŠ” ì¤?.." />}>
                  <ArticleListPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/articles/:businessId"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="ê¸€ ?ì„¸ë¥?ë¶ˆëŸ¬?¤ëŠ” ì¤?.." />}>
                  <ArticleDetailPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/chat"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingScreen message="ì±—ë´‡??ë¶ˆëŸ¬?¤ëŠ” ì¤?.." />}>
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
 * MainApp ?¼ìš°??ì»´í¬?ŒíŠ¸
 * AppProvider??App.tsx?ì„œ ?ìœ„ë¡??œê³µ?? */
export const MainAppRoutes: React.FC = () => {
  return <MainAppContent />;
};
