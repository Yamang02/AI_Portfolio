import { useEffect, useState } from 'react';

/**
 * 스크롤 진행도 훅
 * Hero Section 높이 내에서의 스크롤 진행도를 계산합니다.
 */
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      // Hero Section 높이 내에서의 진행도 (0 ~ 1)
      const progress = Math.min(scrollTop / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기값 설정
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
};
