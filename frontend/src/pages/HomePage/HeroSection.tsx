import React, { useState, useEffect } from 'react';
import { SectionTitle, Button } from '@/design-system';
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  const [showContainer, setShowContainer] = useState(false);
  const [showYamang02, setShowYamang02] = useState(false);
  const [showH2, setShowH2] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // 영역이 아래에서 위로 fade-in
    const containerTimer = setTimeout(() => {
      setShowContainer(true);
    }, 100);

    // 영역이 나타난 후 텍스트 등장 시작
    const timer1 = setTimeout(() => {
      setShowYamang02(true);
    }, 800);

    // Yamang02 나타난 후 0.6초 뒤에 h2 나타나기
    const timer2 = setTimeout(() => {
      setShowH2(true);
    }, 1400);

    // h2 나타난 후 0.6초 뒤에 intro 나타나기
    const timer3 = setTimeout(() => {
      setShowIntro(true);
    }, 2000);

    // intro 나타난 후 0.6초 뒤에 버튼 나타나기
    const timer4 = setTimeout(() => {
      setShowButton(true);
    }, 2600);

    return () => {
      clearTimeout(containerTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-1');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className={styles.hero}>
      <div className={`${styles.container} ${showContainer ? styles.show : ''}`}>
        <div className={styles.content}>
          <div className={styles.nameContainer}>
            <SectionTitle level="h1">이정준</SectionTitle>
            <h1 className={`${styles.secondaryName} ${showYamang02 ? styles.show : ''}`}>
              Yamang02
            </h1>
          </div>
          <SectionTitle level="h2" className={`${styles.sequentialItem} ${showH2 ? styles.show : ''}`}>
            Software Engineer
          </SectionTitle>
          <p className={`${styles.intro} ${styles.sequentialItem} ${showIntro ? styles.show : ''}`}>
            AI와 함께 성장하는 개발자 이정준입니다
          </p>
          <div className={`${styles.cta} ${styles.sequentialItem} ${showButton ? styles.show : ''}`}>
            <Button variant="primary" onClick={scrollToAbout} ariaLabel="더 알아보기">
              <span>더 알아보기</span>
              <svg 
                className={styles.arrowIcon}
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 13l5 5 5-5" />
                <path d="M7 6l5 5 5-5" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
