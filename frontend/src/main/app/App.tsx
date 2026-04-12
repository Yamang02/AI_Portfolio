import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { useThemeInit } from '@/main/shared/lib/useThemeInit';
import { AppProvider } from './providers/AppProvider';
import { MainAppRoutes } from './MainAppRoutes';

/**
 * Main ?±ì˜ ìµœìƒ??ì»´í¬?ŒíŠ¸
 * - ëª¨ë“  ?¼ìš°?…ê³¼ ?„ë¡œë°”ì´?”ë? ?µí•© ê´€ë¦? * - FSD app layer??ì§„ìž…?? * - Admin?€ `admin.html` MPA ì§„ìž…?ì—?œë§Œ ë¡œë“œ?œë‹¤.
 */
export const App: React.FC = () => {
  useThemeInit();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/*"
          element={
            <AppProvider>
              <MainAppRoutes />
            </AppProvider>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
};
