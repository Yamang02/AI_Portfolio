import React from 'react';
import { SectionTitle } from '@/design-system';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from './AboutSection.module.css';

export const AboutSection1: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation();
  
  return (
    <section 
      id="about-1" 
      ref={ref}
      className={`${styles.aboutSection} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.container}>
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h2">AI 활용 개발</SectionTitle>
          <p className={styles.summary}>
            Cursor, Claude, ChatGPT 등을 프로젝트 설계부터 디버깅까지 전 과정에 적극 활용합니다.
            AI의 도움으로 빠르게 프로토타입을 만들고 반복 개선하여 개발 속도를 높입니다.
          </p>
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
    </section>
  );
};
