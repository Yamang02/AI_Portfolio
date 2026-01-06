import React, { useEffect, useRef } from 'react';
import { HeroSection, AboutSection1, AboutSection2, FeaturedProjectsSection, CTASection } from './';
import { PageLayout } from '@widgets/layout';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const pageRef = useRef<HTMLDivElement>(null);
  const [ctaRef, isCtaVisible] = useScrollAnimation({
    threshold: 0.3,
  });

  useEffect(() => {
    const calculateGradient = () => {
      if (!pageRef.current) return;

      const hero = document.querySelector('#hero') as HTMLElement | null;
      const about1 = document.querySelector('#about-1') as HTMLElement | null;
      const about2 = document.querySelector('#about-2') as HTMLElement | null;
      const featuredProjects = document.querySelector('#featured-projects') as HTMLElement | null;

      if (!hero || !about1 || !about2 || !featuredProjects) return;

      // 각 섹션의 오프셋과 높이 계산
      const heroRect = hero.getBoundingClientRect();
      const about1Rect = about1.getBoundingClientRect();
      const about2Rect = about2.getBoundingClientRect();
      const featuredProjectsRect = featuredProjects.getBoundingClientRect();

      // 페이지 최상단 기준 오프셋 계산
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const heroTop = heroRect.top + scrollTop;
      const about1Top = about1Rect.top + scrollTop;
      const about2Top = about2Rect.top + scrollTop;
      const featuredProjectsTop = featuredProjectsRect.top + scrollTop;

      // AboutSection2 중간 지점부터 그라데이션 시작 (더 넓은 범위로 자연스러운 전환)
      const gradientStartPos = about2Top + (about2Rect.height * 0.3);

      // Featured Projects 섹션 시작 지점에서 그라데이션 완료
      // Featured Projects를 볼 때는 이미 배경색이 모두 적용되어 있어야 함
      const gradientEndPos = featuredProjectsTop;

      // 전체 페이지 높이
      const totalHeight = pageRef.current.scrollHeight;

      // 퍼센트 계산
      const startPercent = (gradientStartPos / totalHeight) * 100;
      const endPercent = (gradientEndPos / totalHeight) * 100;

      // CSS 변수로 설정
      pageRef.current.style.setProperty('--gradient-start', `${startPercent}%`);
      pageRef.current.style.setProperty('--gradient-end', `${endPercent}%`);
      pageRef.current.style.setProperty('--total-height', `${totalHeight}px`);
    };

    // 초기 계산 (DOM 렌더링 완료 대기)
    const timer = setTimeout(calculateGradient, 100);

    // 윈도우 리사이즈 시 재계산
    const handleResize = () => {
      calculateGradient();
    };

    window.addEventListener('resize', handleResize);

    // 이미지 로드 후 재계산
    const images = Array.from(document.images);
    const imageLoadPromises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      // 이미지 로드 후 재계산
      setTimeout(calculateGradient, 100);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <PageLayout 
      showFooter={true} 
      footerVisible={isCtaVisible}
      className={styles.homePage}
    >
      <div ref={pageRef} className={styles.homePageContent}>
        <HeroSection />
        <AboutSection1 />
        <AboutSection2 />
        <FeaturedProjectsSection />
        <CTASection ref={ctaRef} />
      </div>
    </PageLayout>
  );
};
