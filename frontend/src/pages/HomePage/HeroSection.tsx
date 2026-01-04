import React from 'react';
import { SectionTitle, Button } from '@/design-system';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-1');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h1">이준경</SectionTitle>
          <SectionTitle level="h2">AI 적극 활용 개발자</SectionTitle>
          <p className={styles.intro}>
            AI 도구를 적극 활용하여 개발 효율성과 사용자 경험을 개선하는 개발자입니다.
          </p>
          <div className={styles.cta}>
            <Button variant="primary" href="/projects">
              프로젝트 보기
            </Button>
            <Button variant="secondary" onClick={scrollToAbout} ariaLabel="더 알아보기">
              더 알아보기 ↓
            </Button>
          </div>
        </div>
        
        {/* 오른쪽: 이미지 */}
        <div className={styles.imageWrapper}>
          <img 
            src="/images/hero-image.jpg" 
            alt="Hero" 
            className={styles.image}
            onError={(e) => {
              // 이미지가 없을 경우 placeholder 표시
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement) {
                target.parentElement.innerHTML = '<div class="' + styles.imagePlaceholder + '"><span>👨‍💻</span></div>';
              }
            }}
          />
        </div>
      </div>
    </section>
  );
};
