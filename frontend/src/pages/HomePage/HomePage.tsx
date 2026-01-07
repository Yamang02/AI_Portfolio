import React from 'react';
import { HeroSection, AboutSection1, AboutSection2, FeaturedProjectsSection, CTASection } from './';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  return (
    <div className={styles.homePageContent}>
      <HeroSection />
      <AboutSection1 />
      <AboutSection2 />
      <FeaturedProjectsSection />
      <CTASection />
    </div>
  );
};
