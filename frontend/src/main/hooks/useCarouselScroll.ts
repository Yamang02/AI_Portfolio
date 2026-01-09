import { useEffect, useState, useRef } from 'react';

/**
 * 스크롤 기반 캐러셀 훅
 * 섹션 내 스크롤 진행도에 따라 캐러셀을 이동시킵니다.
 */
export const useCarouselScroll = (cardCount: number = 3) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 섹션이 뷰포트에 들어왔는지 확인
      if (rect.top < windowHeight && rect.bottom > 0) {
        // 섹션 내 스크롤 진행도 계산 (0 ~ 1)
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const scrollableHeight = sectionHeight - windowHeight;
        
        let progress = 0;
        if (sectionTop < 0) {
          // 섹션이 뷰포트 위로 올라갔을 때
          progress = Math.min(Math.abs(sectionTop) / scrollableHeight, 1);
        }
        
        setScrollProgress(progress);
        
        // 활성 카드 인덱스 계산 (0, 1, 2)
        const cardIndex = Math.floor(progress * (cardCount - 1));
        setActiveCardIndex(Math.min(cardIndex, cardCount - 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기값 설정
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cardCount]);

  return { scrollProgress, activeCardIndex, sectionRef };
};
