// 이 파일은 더 이상 사용되지 않습니다.
// MainApp이 QueryClientProvider와 AppProvider를 포함하여 모든 설정을 처리합니다.
// main.tsx에서 MainApp을 직접 사용하세요.

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AppProvider } from './app/providers/AppProvider';
import { App } from './layout';

const AppRoot: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryClientProvider>
  );
};

export { AppRoot };