import { useEffect } from 'react';

const STORAGE_KEY = 'portfolio-theme';

/**
 * 테마 초기화 훅 - 앱 시작 시 localStorage 또는 시스템 설정에서 테마 로드
 */
export function useThemeInit(): void {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme = stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, []);
}
