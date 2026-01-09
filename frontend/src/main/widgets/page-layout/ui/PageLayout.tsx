import React from 'react';
import { Header } from '@/main/widgets/header';
import { Footer } from '@/main/widgets/footer';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  footerVisible?: boolean;
  className?: string;
  contentClassName?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showFooter = true,
  footerVisible = true,
  className,
  contentClassName,
}) => {
  return (
    <div className={`${styles.layout} ${className || ''}`}>
      <Header />
      <main className={`${styles.content} ${contentClassName || ''}`}>
        {children}
      </main>
      {showFooter && <Footer isVisible={footerVisible} />}
    </div>
  );
};
