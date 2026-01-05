import React, { useState, useEffect } from 'react';
import { SectionTitle } from '@/design-system';
import styles from './AboutSection.module.css';
import imageStyles from './AboutSection2.module.css';

/**
 * AboutSection2 - 개발 효율성 향상 소개
 * 
 * CSS Scroll-Driven Animations 사용 (Pure CSS)
 * - Chrome/Edge/Firefox: 스크롤 기반 이미지 fade-in 애니메이션
 * - Safari: 정적 표시 (애니메이션 없음, 콘텐츠는 정상 표시)
 */
export const AboutSection2: React.FC = () => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // 섹션이 뷰포트에 들어온 후 1.5초 뒤에 스크롤 인디케이터 표시
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showScrollIndicator) {
          timer = setTimeout(() => {
            setShowScrollIndicator(true);
          }, 1500);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('about-2');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (section) {
        observer.unobserve(section);
      }
    };
  }, [showScrollIndicator]);

  const scrollToNext = () => {
    const nextSection = document.getElementById('featured-projects');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about-2" className={`${styles.aboutSection} ${styles.aboutSection2}`}>
      <div className={styles.container}>
        {/* 왼쪽: Cursor 사용 통계 이미지 */}
        <div className={imageStyles.imageWrapper}>
          {/* 원본 이미지 */}
          <img 
            src="/landing/cursor_usage.jpg" 
            alt="Cursor Usage Statistics" 
            className={imageStyles.image}
          />
          {/* 강조된 Top 5% 이미지 */}
          <img 
            src="/landing/top_5.png" 
            alt="Usage Top 5%" 
            className={imageStyles.highlightImage}
          />
        </div>
        
        {/* 오른쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h2">개발 효율성 향상</SectionTitle>
          <p className={styles.summary}>
            AI 도구를 활용하여 반복적인 작업을 자동화하고, 복잡한 문제를 빠르게 해결합니다.
            이를 통해 더 나은 사용자 경험에 집중할 수 있습니다.
          </p>
        </div>
      </div>
      {/* 스크롤 인디케이터 */}
      <button
        className={`${styles.scrollIndicator} ${showScrollIndicator ? styles.show : ''}`}
        onClick={scrollToNext}
        aria-label="다음 섹션으로"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M7 13l5 5 5-5" />
          <path d="M7 6l5 5 5-5" />
        </svg>
      </button>
    </section>
  );
};
