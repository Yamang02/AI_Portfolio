import React from 'react';
import { SectionTitle, Card } from '@/design-system';
import { CertificationSection } from './CertificationSection';
import { ContactSection } from './ContactSection';
import { useProfileIntroductionQuery } from '@/main/entities/profile-introduction';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';
import styles from './IntroductionSection.module.css';

interface IntroductionSectionProps {
  introduction?: string; // 레거시 호환성 유지 (사용 안 함)
  githubUrl?: string;
  email?: string;
  linkedInUrl?: string;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  introduction: _legacyIntroduction, // 레거시 prop (사용 안 함)
  githubUrl,
  email,
  linkedInUrl,
}) => {
  const { data: introduction, isLoading, error } = useProfileIntroductionQuery();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <SectionTitle level="h3" className={styles.sectionTitle}>
          자기소개
        </SectionTitle>

        {isLoading && (
          <Card variant="default" padding="lg" className={styles.introCard}>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </Card>
        )}

        {error && (
          <Card variant="default" padding="lg" className={styles.introCard}>
            <p className="text-red-500">자기소개를 불러오는데 실패했습니다.</p>
          </Card>
        )}

        {!isLoading && !error && introduction && (
          <Card variant="default" padding="lg" className={styles.introCard}>
            <MarkdownRenderer content={introduction.content} />
          </Card>
        )}

        {!isLoading && !error && !introduction && (
          <Card variant="default" padding="lg" className={styles.introCard}>
            <p className={styles.introduction}>
              AI와 함께 성장하는 개발자입니다. 효율적인 개발과 사용자 경험 개선에 관심이 많습니다.
            </p>
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
