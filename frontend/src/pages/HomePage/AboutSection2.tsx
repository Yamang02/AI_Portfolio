import React from 'react';
import { SectionTitle } from '@/design-system';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from './AboutSection.module.css';

export const AboutSection2: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation();
  
  return (
    <section 
      id="about-2" 
      ref={ref}
      className={`${styles.aboutSection} ${styles.aboutSection2} ${isVisible ? styles.visible : ''}`}
    >
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
