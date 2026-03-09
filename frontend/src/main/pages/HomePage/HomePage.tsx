import React from 'react';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { pageMetaDefaults } from '@/shared/config/seo.config';
import { createOrganizationSchema, createWebSiteSchema } from '@/shared/lib/schema';
import { HeroSection } from '@/main/widgets/hero-section';
import { AboutSection1, AboutSection2 } from '@/main/widgets/about-section';
import { FeaturedProjectsSection } from '@/main/widgets/featured-projects-section';
import { CTASection } from '@/main/widgets/cta-section';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const meta = pageMetaDefaults.home;
  return (
    <div className={styles.homePageContent}>
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.canonicalPath}
        jsonLd={[createOrganizationSchema(), createWebSiteSchema()]}
      />
      <HeroSection />
      <AboutSection1 />
      <AboutSection2 />
      <FeaturedProjectsSection />
      <CTASection />
    </div>
  );
};
