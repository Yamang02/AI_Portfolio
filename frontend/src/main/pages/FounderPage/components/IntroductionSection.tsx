import React from 'react';
import { Card } from '@/design-system';
import { CertificationSection } from './CertificationSection';
import { ContactSection } from './ContactSection';
import { useProfileIntroductionQuery } from '@/main/entities/profile-introduction';
import { MarkdownRenderer } from '@/main/shared/ui/markdown/MarkdownRenderer';
import styles from './IntroductionSection.module.css';

interface IntroductionSectionProps {
  githubUrl?: string;
  email?: string;
  linkedInUrl?: string;
}

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({
  githubUrl,
  email,
  linkedInUrl,
}) => {
  const { data: introduction, isLoading, error } = useProfileIntroductionQuery();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
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
            <p className="text-red-500">?ê¸°?Œê°œë¥?ë¶ˆëŸ¬?¤ëŠ”???¤íŒ¨?ˆìŠµ?ˆë‹¤.</p>
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
              AI?€ ?¨ê»˜, ?¹ì‹ ??ê¿ˆì„ ?¤í˜„?©ë‹ˆ??
            </p>
          </Card>
        )}
      </div>

      {/* ?°ë½ì²??¹ì…˜ */}
      <ContactSection
        githubUrl={githubUrl}
        email={email}
        linkedInUrl={linkedInUrl}
      />

      {/* ?ê²©ì¦??¹ì…˜ */}
      <CertificationSection />
    </div>
  );
};
