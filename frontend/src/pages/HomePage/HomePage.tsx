import React from 'react';
import { HeroSection, AboutSection, FeaturedProjectsSection } from './';
import { Footer } from '@widgets/layout/Footer';

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedProjectsSection />
      <Footer />
    </>
  );
};
