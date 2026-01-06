import React from 'react';
import { useExperiencesQuery } from '@/main/entities/experience/api/useExperienceQuery';
import { useEducationQuery } from '@/main/entities/education/api/useEducationQuery';
import { SectionTitle } from '@/design-system';
import { IntroductionSection } from './components/IntroductionSection';
import { CareerTimeline } from './components/CareerTimeline';
import { CareerTimelineSection } from './components/CareerTimelineSection';
import { PageLayout } from '@widgets/layout';
import styles from './ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
  const { data: experiences = [], isLoading: isLoadingExperiences } = useExperiencesQuery();
  const { data: educations = [], isLoading: isLoadingEducations } = useEducationQuery();

  const introductionData = {
    introduction: '안녕하세요. 저는 국어, 개발, 미술 등 다양한 분야에 관심이 많습니다. 스몰토크, 커피챗 대환영! \n소통과 협의를 통해 함께 문제를 해결해 나가는 과정을 중요하게 생각합니다.',
    githubUrl: 'https://github.com/yamang02',
    email: 'ljj0210@gmail.com',
    linkedInUrl: 'https://www.linkedin.com/in/JeongjunLee/',
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Header Section */}
        <section className={styles.header}>
          <div className={styles.container}>
            <SectionTitle level="h1">이정준 Profile</SectionTitle>
          </div>
        </section>

        {/* Main Content Section: 자기소개 + 약력 */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.topGrid}>
              {/* 왼쪽: 자기소개 섹션 */}
              <div className={styles.introColumn}>
                <IntroductionSection {...introductionData} />
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
    </PageLayout>
  );
};
