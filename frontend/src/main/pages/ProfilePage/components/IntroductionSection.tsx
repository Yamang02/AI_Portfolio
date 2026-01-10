import React from 'react';
import { SectionTitle, Card } from '@/design-system';
import { CertificationSection } from './CertificationSection';
import { ContactSection } from './ContactSection';
import styles from './IntroductionSection.module.css';

interface IntroductionSectionProps {
  introduction?: string;
  githubUrl?: string;
  email?: string;
  linkedInUrl?: string;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  introduction = 'AI와 함께 성장하는 개발자입니다. 효율적인 개발과 사용자 경험 개선에 관심이 많습니다.',
  githubUrl,
  email,
  linkedInUrl,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <SectionTitle level="h3" className={styles.sectionTitle}>
          자기소개
        </SectionTitle>

        {introduction && (
          <Card variant="default" padding="lg" className={styles.introCard}>
            <p className={styles.introduction}>{introduction}</p>
          </Card>
        )}
      </div>

      {/* 연락처 섹션 */}
      <ContactSection
        githubUrl={githubUrl}
        email={email}
        linkedInUrl={linkedInUrl}
      />

      {/* 자격증 섹션 */}
      <CertificationSection />
    </div>
  );
};
