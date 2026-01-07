/**
 * Design System Theme Provider
 * 
 * 디자인 시스템의 테마 관리 기능을 제공합니다.
 * CSS 변수 기반 디자인 시스템과 통합되어 작동합니다.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'portfolio-theme';

/**
 * 저장된 테마 가져오기 (기본값: light)
 */
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark' || stored === 'matrix' || stored === 'demon-slayer') {
    return stored;
  }
  
  // 기본값은 항상 light 모드
  return 'light';
};

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider
 * 
 * 디자인 시스템의 테마를 관리하는 Provider입니다.
 * 
 * @example
 * ```tsx
 * import { ThemeProvider } from '@/design-system';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme 
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 초기 테마를 가져오면서 동시에 HTML에 클래스 적용
    const initialTheme = defaultTheme || getInitialTheme();
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      // 기존 테마 클래스 제거
      root.classList.remove('dark', 'matrix-theme', 'demon-slayer-theme');
      // 새 테마 클래스 추가
      if (initialTheme === 'dark') {
        root.classList.add('dark');
      } else if (initialTheme === 'matrix') {
        root.classList.add('matrix-theme');
      } else if (initialTheme === 'demon-slayer') {
        root.classList.add('demon-slayer-theme');
      }
    }
    return initialTheme;
  });

  // HTML 요소에 테마 클래스 토글
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'matrix-theme', 'demon-slayer-theme');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'matrix') {
      root.classList.add('matrix-theme');
    } else if (theme === 'demon-slayer') {
      root.classList.add('demon-slayer-theme');
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    // matrix와 demon-slayer 테마는 토글로 진입하지 않음 (이스터에그 전용)
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    }
  }, [theme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * useTheme Hook
 * 
 * 디자인 시스템의 테마를 사용하는 Hook입니다.
 * 
 * @example
 * ```tsx
 * import { useTheme } from '@/design-system';
 * 
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={toggleTheme}>
 *       현재 테마: {theme}
 *     </button>
 *   );
 * }
 * ```
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
