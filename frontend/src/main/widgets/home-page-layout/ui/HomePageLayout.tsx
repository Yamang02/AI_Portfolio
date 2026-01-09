import React from 'react';
import { Header } from '@/main/widgets/header';
import { Footer } from '@/main/widgets/footer';
import styles from './HomePageLayout.module.css';

interface HomePageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

/**
 * 홈페이지 전용 레이아웃 컴포넌트
 * 
 * 일반 PageLayout과의 차이점:
 * - CSS scroll-driven animations 지원을 위해 overflow 제어 없음
 * - flex 레이아웃 대신 block 레이아웃 사용
 * - AnimatedRoutes(페이지 전환 효과) 미적용
 * - 윈도우 기반 스크롤 사용
 */
export const HomePageLayout: React.FC<HomePageLayoutProps> = ({
  children,
  showFooter = true,
  className,
}) => {
  return (
    <div className={`${styles.layout} ${className || ''}`}>
      <Header />
      <main className={styles.content}>
        {children}
      </main>
      {showFooter && <Footer isVisible={true} />}
    </div>
  );
};
