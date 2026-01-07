import { useEffect, useRef, useState } from 'react';

/**
 * Intersection Observer를 사용한 스크롤 애니메이션 훅
 * 섹션이 뷰포트에 진입했을 때 애니메이션을 트리거하고, 벗어나면 역재생합니다.
 */
export const useScrollAnimation = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const lastScrollY = useRef(window.scrollY);
  const wasIntersecting = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY.current;
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          wasIntersecting.current = true;
        } else if (wasIntersecting.current) {
          // 한 번이라도 뷰포트에 들어왔었다면, 벗어날 때 역재생
          if (scrollingDown && entry.boundingClientRect.top < 0) {
            // 아래로 스크롤하여 섹션이 위로 벗어남 - 역재생
            setIsVisible(false);
          } else if (!scrollingDown && entry.boundingClientRect.bottom > window.innerHeight) {
            // 위로 스크롤하여 섹션이 아래로 벗어남 - 역재생
            setIsVisible(false);
          }
        }
        
        lastScrollY.current = currentScrollY;
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // 스크롤 방향 추적
    const handleScroll = () => {
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, [options]);

  return [ref, isVisible] as const;
};
