import React from 'react';
import { useExperiencesQuery } from '@/main/entities/experience/api/useExperienceQuery';
import { useEducationQuery } from '@/main/entities/education/api/useEducationQuery';
import { CareerTimelineSection } from './components/CareerTimelineSection';
import { PageLayout } from '@widgets/layout';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { data: experiences = [], isLoading: isLoadingExperiences } = useExperiencesQuery();
  const { data: educations = [], isLoading: isLoadingEducations } = useEducationQuery();

  return (
    <PageLayout>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>개발자 프로필</h1>
          <p className={styles.heroSubtitle}>
            경력과 교육을 통해 제가 누구인지 알아보세요.
          </p>
        </section>

        {/* Career Timeline Section (경력 + 교육) */}
        <section className={styles.section}>
          <CareerTimelineSection
            experiences={experiences}
            educations={educations}
            isLoadingExperiences={isLoadingExperiences}
            isLoadingEducations={isLoadingEducations}
          />
        </section>
      </div>
    </PageLayout>
  );
};
