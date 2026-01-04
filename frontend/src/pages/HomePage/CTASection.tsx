import React, { forwardRef, useEffect } from 'react';
import { SectionTitle, Button } from '@/design-system';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from './CTASection.module.css';

export const CTASection = forwardRef<HTMLElement, {}>((props, externalRef) => {
  const [internalRef, isVisible] = useScrollAnimation({
    threshold: 0.3,
  });
  
  // externalRef와 internalRef 병합
  useEffect(() => {
    if (externalRef && internalRef.current) {
      if (typeof externalRef === 'function') {
        externalRef(internalRef.current);
      } else if (externalRef && 'current' in externalRef) {
        (externalRef as React.MutableRefObject<HTMLElement | null>).current = internalRef.current;
      }
    }
  }, [externalRef, internalRef]);
  
  return (
    <section 
      id="cta" 
      ref={internalRef}
      className={`${styles.ctaSection} ${isVisible ? styles.visible : ''}`}
    >
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
