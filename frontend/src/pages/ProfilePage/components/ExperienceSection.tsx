import React from 'react';
import { Card } from '@/design-system/components/Card';
import { SkeletonCard } from '@/design-system/components/Skeleton/SkeletonCard';
import { formatDateRange } from '@/shared/utils/safeStringUtils';
import { SimpleTechStackList } from '@/shared/ui/tech-stack/TechStackList';
import type { Experience } from '@/entities/experience';
import styles from './ExperienceSection.module.css';

interface ExperienceSectionProps {
  experiences: Experience[];
  isLoading: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 2 }).map((_, index) => (
          <SkeletonCard
            key={index}
            showImage={false}
            showActions={false}
            lines={4}
          />
        ))}
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💼</div>
        <p className={styles.emptyText}>경력 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {experiences.map((experience) => (
        <Card key={experience.id} variant="default" padding="lg" className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h3 className={styles.title}>{experience.title}</h3>
              <p className={styles.organization}>{experience.organization}</p>
              {experience.role && (
                <p className={styles.role}>{experience.role}</p>
              )}
            </div>
            <div className={styles.date}>
              {formatDateRange(experience.startDate, experience.endDate, ' - ')}
            </div>
          </div>

          {experience.description && (
            <p className={styles.description}>{experience.description}</p>
          )}

          {experience.technologies && experience.technologies.length > 0 && (
            <div className={styles.technologies}>
              <SimpleTechStackList technologies={experience.technologies} />
            </div>
          )}

          {experience.location && (
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
              <span>{experience.location}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
