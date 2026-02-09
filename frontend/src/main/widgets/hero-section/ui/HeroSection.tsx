import React from 'react';
import { SectionTitle, Button } from '@/design-system';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.motto}>
          인간이여, 야망을 가져라
        </p>
        <div className={styles.nameContainer}>
          <SectionTitle level="h1">야망솔루션</SectionTitle>
        </div>
        <p className={`${styles.intro} ${styles.sequentialItem}`}>
          당신의 꿈을 AI로 풀어냅니다
        </p>
      </div>
    </section>
  );
};
