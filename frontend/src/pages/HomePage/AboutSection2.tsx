import React from 'react';
import { SectionTitle } from '@/design-system';
import styles from './AboutSection.module.css';
import imageStyles from './AboutSection2.module.css';

/**
 * AboutSection2 - 개발 효율성 향상 소개
 */
export const AboutSection2: React.FC = () => {
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
            2025년 Cursor 사용량 <span className={styles.highlightText}>상위 5%</span>
          </p>
        </div>
      </div>
    </section>
  );
};
