import React from 'react';
import { Card } from '@/design-system/components/Card';
import { SkeletonCard } from '@/design-system/components/Skeleton/SkeletonCard';
import { formatDateRange } from '@/main/shared/utils/safeStringUtils';
import { SimpleTechStackList } from '@/main/shared/ui/tech-stack/TechStackList';
import type { Education } from '@/main/entities/education';
import styles from './EducationSection.module.css';

interface EducationSectionProps {
  educations: Education[];
  isLoading: boolean;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  educations,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {['edu-skeleton-1', 'edu-skeleton-2'].map((key) => (
          <SkeletonCard
            key={key}
            showImage={false}
            showActions={false}
            lines={4}
          />
        ))}
      </div>
    );
  }

  if (educations.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎓</div>
        <p className={styles.emptyText}>교육 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {educations.map((education) => (
        <Card key={education.id} variant="default" padding="lg" className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h3 className={styles.title}>{education.title}</h3>
              <p className={styles.organization}>{education.organization}</p>
              {education.degree && (
                <p className={styles.degree}>{education.degree}</p>
              )}
            </div>
            <div className={styles.date}>
              {formatDateRange(education.startDate, education.endDate, ' - ')}
            </div>
          </div>

          {education.description && (
            <p className={styles.description}>{education.description}</p>
          )}

          {education.technologies && education.technologies.length > 0 && (
            <div className={styles.technologies}>
              <SimpleTechStackList technologies={education.technologies} />
            </div>
          )}

          {education.location && (
            <div className={styles.location}>
              <svg
                className={styles.locationIcon}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{education.location}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
