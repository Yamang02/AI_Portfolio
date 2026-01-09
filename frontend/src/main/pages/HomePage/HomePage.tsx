import React from 'react';
import { HeroSection } from '@/main/widgets/hero-section';
import { AboutSection1, AboutSection2 } from '@/main/widgets/about-section';
import { FeaturedProjectsSection } from '@/main/widgets/featured-projects-section';
import { CTASection } from '@/main/widgets/cta-section';
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
