import { useEffect } from 'react';

/**
 * 테마 초기화 훅
 * localStorage에서 테마를 로드하여 document에 적용
 */
export const useThemeInit = () => {
  useEffect(() => {
    const theme = localStorage.getItem('portfolio-theme') || 'light';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === 'dark' ? 'dark' : 'light');
  }, []);
};
