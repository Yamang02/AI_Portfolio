import React from 'react';
import { useExperiencesQuery } from '@/main/entities/experience/api/useExperienceQuery';
import { useEducationQuery } from '@/main/entities/education/api/useEducationQuery';
import { IntroductionSection } from './components/IntroductionSection';
import { CareerTimeline } from './components/CareerTimeline';
import { CareerTimelineSection } from './components/CareerTimelineSection';
import { PageHeader } from '@/main/widgets/page-header';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { data: experiences = [], isLoading: isLoadingExperiences } = useExperiencesQuery();
  const { data: educations = [], isLoading: isLoadingEducations } = useEducationQuery();

  const contactData = {
    githubUrl: 'https://github.com/yamang02',
    email: 'ljj0210@gmail.com',
    linkedInUrl: 'https://www.linkedin.com/in/JeongjunLee/',
  };

  return (
    <div className={styles.page}>
        <PageHeader title="대표 소개" />

        {/* Main Content Section: 자기소개 + 약력 */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.topGrid}>
              {/* 왼쪽: 자기소개 섹션 */}
              <div className={styles.introColumn}>
                <IntroductionSection {...contactData} />
              </div>

              {/* 오른쪽: 약력 타임라인 */}
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
