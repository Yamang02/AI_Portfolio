import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'portfolio-theme';

/**
 * 초기 테마 가져오기
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  
  // 기본값은 항상 light 모드
  return 'light';
}

/**
 * 간단한 테마 관리 훅
 * 
 * CSS 변수 기반 테마 시스템과 함께 사용됩니다.
 * ThemeProvider 없이도 작동하며, document.documentElement에 dark 클래스를 추가/제거합니다.
 * 
 * @example
 * ```tsx
 * import { useTheme } from '@/shared/hooks/useTheme';
 * 
 * function MyComponent() {
 *   const { theme, toggleTheme, setTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={toggleTheme}>
 *       현재 테마: {theme}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const initialTheme = getInitialTheme();
    // 초기 마운트 시 클래스 적용
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(initialTheme);
    }
    return initialTheme;
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // 테마 변경 시 클래스 업데이트
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
