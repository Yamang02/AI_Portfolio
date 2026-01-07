import React from 'react';
import { SectionTitle, Button } from '@/design-system';
import styles from './CTASection.module.css';

/**
 * CTASection - 프로필/프로젝트 페이지로 이동하는 CTA
 */
export const CTASection: React.FC = () => {
  return (
    <section id="cta" className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <SectionTitle level="h2">더 알아보기</SectionTitle>
          <p className={styles.description}>
            프로필과 프로젝트를 자세히 살펴보세요.
          </p>
          <div className={styles.buttonGroup}>
            <Button 
              variant="primary" 
              size="lg"
              href="/profile"
              className={styles.ctaButton}
            >
              프로필 보기
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              href="/projects"
              className={styles.ctaButton}
            >
              프로젝트 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
