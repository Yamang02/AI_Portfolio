import React from 'react';
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
  return (
    <section id="about-1" className={styles.aboutSection}>
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
