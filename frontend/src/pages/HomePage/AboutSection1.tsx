import React, { useState, useEffect } from 'react';
import { SectionTitle } from '@/design-system';
import styles from './AboutSection.module.css';

/**
 * AboutSection1 - AI 활용 개발 소개
 * 
 * CSS Scroll-Driven Animations 사용 (Pure CSS)
 * - Chrome/Edge/Firefox: 스크롤 기반 로고 모임 애니메이션
 * - Safari: 정적 표시 (애니메이션 없음, 콘텐츠는 정상 표시)
 */
export const AboutSection1: React.FC = () => {
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

    const section = document.getElementById('about-1');
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
    const nextSection = document.getElementById('about-2');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about-1" className={styles.aboutSection}>
      <div className={styles.container}>
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h2">에이전틱 코딩</SectionTitle>
          <div className={styles.processFlow}>
            <div className={styles.processSteps}>
              <span className={styles.processStep}>기획</span>
              <span className={styles.processArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
              <span className={styles.processStep}>설계</span>
              <span className={styles.processArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
              <span className={styles.processStep}>개발</span>
              <span className={styles.processArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
              <span className={styles.processStep}>배포</span>
              <span className={styles.processArrow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
              <span className={styles.processStep}>운영</span>
            </div>
            <p className={styles.summary}>
              전 과정에 AI를 접목하여 생산성을 높이고,
            </p>
            <p className={styles.summary}>
              <span className={styles.highlight}>장기적인 유지보수</span>까지 고려한 개발을 실천합니다.
            </p>
            <p className={styles.belief}>
              신속하면서도 안정적인 개발은<br />
              잘 짜여진 프로세스 속 AI를 활용할 때 가능하다고 믿습니다.
            </p>
          </div>
        </div>
        
        {/* 오른쪽: 로고 모임 애니메이션 */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper} data-logo="cursor">
            <img 
              src="/landing/cursor_logo.png" 
              alt="Cursor" 
              className={styles.logo}
            />
          </div>
          <div className={styles.logoWrapper} data-logo="claude">
            <img 
              src="/landing/claude_code_logo.png" 
              alt="Claude" 
              className={styles.logo}
            />
          </div>
          <div className={styles.logoWrapper} data-logo="codex">
            <img 
              src="/landing/codex_logo.png" 
              alt="Codex" 
              className={styles.logo}
            />
          </div>
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
