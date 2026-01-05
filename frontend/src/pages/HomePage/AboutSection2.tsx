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
    // 첫 번째 프로젝트 섹션 찾기
    const firstProject = document.querySelector('#featured-projects article[data-project-index="0"]');
    if (firstProject) {
      const rect = firstProject.getBoundingClientRect();
      const scrollY = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: scrollY, behavior: 'smooth' });
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
          <SectionTitle level="h2">능숙한 AI 활용</SectionTitle>
          <p className={styles.summary}>
            SDD, BMAD 등 다양한 AI 기반 개발 방법론을 탐구합니다.
          </p>
          <p className={styles.summary}>
            에이전틱 코딩의 한계를 극복하기 위해 다방면으로 접근합니다.
          </p>
          <p className={styles.belief}>
            2025년 Cursor 사용량 <span style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.5rem' }}>상위 5%</span>
          </p>
        </div>
        
        {/* 스크롤 인디케이터 - 그리드의 다음 행에 배치 */}
        <div className={styles.scrollIndicatorWrapper}>
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
        </div>
      </div>
    </section>
  );
};
