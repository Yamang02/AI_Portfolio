import React from 'react';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { pageMetaDefaults } from '@/shared/config/seo.config';
import { createOrganizationSchema, createPersonSchema, createWebSiteSchema } from '@/main/shared/lib/schema';
import { useExperiencesQuery } from '@/main/entities/experience/api/useExperienceQuery';
import { useEducationQuery } from '@/main/entities/education/api/useEducationQuery';
import { IntroductionSection } from './components/IntroductionSection';
import { CareerTimeline } from './components/CareerTimeline';
import { CareerTimelineSection } from './components/CareerTimelineSection';
import { PageHeader } from '@/main/widgets/page-header';
import styles from './FounderPage.module.css';

export const FounderPage: React.FC = () => {
  const meta = pageMetaDefaults.profile;
  const { data: experiences = [], isLoading: isLoadingExperiences } = useExperiencesQuery();
  const { data: educations = [], isLoading: isLoadingEducations } = useEducationQuery();

  const contactData = {
    githubUrl: 'https://github.com/yamang02',
    email: 'contact@yamangsolution.com',
    linkedInUrl: 'https://www.linkedin.com/in/JeongjunLee/',
  };

  return (
    <div className={styles.page}>
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.canonicalPath}
        jsonLd={[createPersonSchema(), createOrganizationSchema(), createWebSiteSchema()]}
      />
        <PageHeader title="?Ä???åÍ∞ú" />

        {/* Main Content Section: ?êÍ∏∞?åÍ∞ú + ?ΩÎ†• */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.topGrid}>
              {/* ?ºÏ™Ω: ?êÍ∏∞?åÍ∞ú ?πÏÖò */}
              <div className={styles.introColumn}>
                <IntroductionSection {...contactData} />
              </div>

              {/* ?§Î•∏Ï™? ?ΩÎ†• ?Ä?ÑÎùº??*/}
              <div className={styles.timelineColumn}>
                <CareerTimeline
                  experiences={experiences}
                  educations={educations}
                  isLoadingExperiences={isLoadingExperiences}
                  isLoadingEducations={isLoadingEducations}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Work & Other Experience Section */}
        <section className={styles.section}>
          <div className={styles.container}>
            <CareerTimelineSection
              experiences={experiences}
              educations={educations}
              isLoadingExperiences={isLoadingExperiences}
              isLoadingEducations={isLoadingEducations}
            />
          </div>
        </section>
      </div>
  );
};
