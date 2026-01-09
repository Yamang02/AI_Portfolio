import React from 'react';
import { SectionTitle, Button } from '@/design-system';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.nameContainer}>
          <SectionTitle level="h1">이정준</SectionTitle>
          <h1 className={styles.secondaryName}>
            Yamang02
          </h1>
        </div>
        <SectionTitle level="h2" className={styles.sequentialItem}>
          Software Engineer
        </SectionTitle>
        <p className={`${styles.intro} ${styles.sequentialItem}`}>
          AI와 함께 성장하는 개발자 이정준입니다
        </p>
      </div>
    </section>
  );
};
