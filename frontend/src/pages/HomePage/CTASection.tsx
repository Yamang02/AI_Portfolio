import React, { forwardRef } from 'react';
import { SectionTitle, Button } from '@/design-system';
import styles from './CTASection.module.css';

/**
 * CTASection - 프로필/프로젝트 페이지로 이동하는 CTA
 * 
 * CSS Scroll-Driven Animations 사용 (Pure CSS)
 * - Chrome/Edge/Firefox: 스크롤 기반 fade-in 애니메이션
 * - Safari: 정적 표시 (애니메이션 없음, 콘텐츠는 정상 표시)
 */
export const CTASection = forwardRef<HTMLElement, {}>((props, ref) => {
  return (
    <section id="cta" ref={ref} className={styles.ctaSection}>
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
});
