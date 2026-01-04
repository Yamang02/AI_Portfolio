import React from 'react';
import { SectionTitle } from '@/design-system';
import styles from './AboutSection.module.css';

/**
 * AboutSection2 - 개발 효율성 향상 소개
 * 
 * CSS Scroll-Driven Animations 사용 (Pure CSS)
 * - Chrome/Edge/Firefox: 스크롤 기반 이미지 fade-in 애니메이션
 * - Safari: 정적 표시 (애니메이션 없음, 콘텐츠는 정상 표시)
 */
export const AboutSection2: React.FC = () => {
  return (
    <section id="about-2" className={`${styles.aboutSection} ${styles.aboutSection2}`}>
      <div className={styles.container}>
        {/* 왼쪽: Cursor 사용 통계 이미지 */}
        <div className={styles.imageWrapper}>
          <img 
            src="/landing/cursor_usage.jpg" 
            alt="Cursor Usage Statistics" 
            className={styles.image}
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
    </section>
  );
};
