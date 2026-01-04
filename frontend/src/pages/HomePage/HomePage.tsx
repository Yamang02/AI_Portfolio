import React from 'react';
import { HeroSection, AboutSection1, AboutSection2, FeaturedProjectsSection, CTASection } from './';
import { Footer } from '@widgets/layout/Footer';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export const HomePage: React.FC = () => {
  const [ctaRef, isCtaVisible] = useScrollAnimation({
    threshold: 0.3,
  });

  return (
    <>
      <HeroSection />
      <AboutSection1 />
      <AboutSection2 />
      <FeaturedProjectsSection />
      <CTASection ref={ctaRef} />
      <Footer isVisible={isCtaVisible} />
    </>
  );
};
