import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { Theme } from '../types/common.types';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'portfolio-theme';

/**
 * 시스템 다크모드 설정 감지
 */
const getSystemTheme = (): Theme => {
  if (globalThis.window === undefined) return 'light';
  return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/**
 * 저장된 테마 가져오기 (기본값: light)
 */
const getInitialTheme = (): Theme => {
  if (globalThis.window === undefined) return 'light';
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  // 기본값은 항상 light 모드
  return 'light';
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 초기 테마를 가져오면서 동시에 HTML에 클래스 적용
    const initialTheme = getInitialTheme();
    if (globalThis.window !== undefined) {
      const root = document.documentElement;
      if (initialTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
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

  // 시스템 테마 변경 감지는 비활성화 (기본값은 항상 light)

  const updateTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    // matrix와 demon-slayer 테마는 토글로 진입하지 않음 (이스터에그 전용)
    if (theme === 'light') {
      updateTheme('dark');
    } else if (theme === 'dark') {
      updateTheme('light');
    }
  }, [theme, updateTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme,
    setTheme: updateTheme,
  }), [theme, toggleTheme, updateTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
