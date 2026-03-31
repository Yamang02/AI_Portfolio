import React, { useContext, useEffect, useState, createContext, ReactNode } from 'react';

interface AppContextValue {
  isWideScreen: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

/**
 * 포트폴리오 데이터는 라우트별 페이지·엔티티 훅에서만 로드합니다.
 * 여기서는 전역 UI 상태만 유지합니다.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isWideScreen, setIsWideScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 2400;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 2400);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = React.useMemo<AppContextValue>(
    () => ({ isWideScreen }),
    [isWideScreen]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
