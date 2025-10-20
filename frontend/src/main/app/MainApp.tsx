import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '../pages/HomePage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { AppProvider, useApp } from '../shared/providers/AppProvider';

// React Query 클라이언트 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const MainAppContent: React.FC = () => {
  const {
    isChatbotOpen,
    isHistoryPanelOpen,
    isWideScreen,
    setChatbotOpen,
    setHistoryPanelOpen
  } = useApp();

  // 챗봇 토글
  const handleChatbotToggle = () => {
    setChatbotOpen((prev) => !prev);
  };

  // 히스토리 패널 토글
  const handleHistoryPanelToggle = () => {
    setHistoryPanelOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white text-gray-700 font-sans">
      <HomePage
        isChatbotOpen={isChatbotOpen}
        isHistoryPanelOpen={isHistoryPanelOpen}
        isWideScreen={isWideScreen}
        onChatbotToggle={handleChatbotToggle}
        onHistoryPanelToggle={handleHistoryPanelToggle}
      />
    </div>
  );
};

const MainApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </QueryClientProvider>
  );
};

export default MainApp;
