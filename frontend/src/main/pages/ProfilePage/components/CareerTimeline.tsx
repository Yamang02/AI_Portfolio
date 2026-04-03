import React, { useMemo } from 'react';
import { SkeletonCard } from '@/design-system/components/Skeleton/SkeletonCard';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { formatDateRange } from '@/shared/utils/safeStringUtils';
import { startOfMonthTimeMs } from '@/shared/utils/flexibleMonthDate';
import type { Experience } from '@/main/entities/experience';
import type { Education } from '@/main/entities/education';
import styles from './CareerTimeline.module.css';

interface CareerTimelineProps {
  experiences: Experience[];
  educations: Education[];
  isLoadingExperiences: boolean;
  isLoadingEducations: boolean;
}

type TimelineItem = {
  id: string;
  type: 'experience' | 'education';
  sortKeyMs: number;
  period: string;
  organization: string;
  role: string;
};

export const CareerTimeline: React.FC<CareerTimelineProps> = ({
  experiences,
  educations,
  isLoadingExperiences,
  isLoadingEducations,
}) => {
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    experiences.forEach((exp) => {
      items.push({
        id: exp.id,
        type: 'experience',
        sortKeyMs: startOfMonthTimeMs(exp.startDate),
        period: formatDateRange(exp.startDate, exp.endDate, ' ~ '),
        organization: exp.organization,
        role: exp.role || '',
      });
    });

    educations.forEach((edu) => {
      items.push({
        id: edu.id,
        type: 'education',
        sortKeyMs: startOfMonthTimeMs(edu.startDate),
        period: formatDateRange(edu.startDate, edu.endDate, ' ~ '),
        organization: edu.organization,
        role: '과정 이수',
      });
    });

    return items.sort((left, right) => right.sortKeyMs - left.sortKeyMs);
  }, [experiences, educations]);

  const timelineBody = (() => {
    if (isLoadingExperiences || isLoadingEducations) {
      return (
        <div className={styles.timeline}>
          {['career-skeleton-1', 'career-skeleton-2', 'career-skeleton-3'].map((key) => (
            <div key={key} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <SkeletonCard
                  showImage={false}
                  showActions={false}
                  lines={3}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (timelineItems.length === 0) {
      return (
        <div className={styles.empty}>
          <p className={styles.emptyText}>약력 정보가 없습니다.</p>
        </div>
      );
    }
    return (
      <div className={styles.timeline}>
        {timelineItems.map((item) => (
          <div key={item.id} className={styles.timelineItem}>
            <div className={styles.timelineDot} />
            <div className={styles.timelineContent}>
              <div className={styles.timelinePeriod}>{item.period}</div>
              <div className={styles.timelineOrganization}>{item.organization}</div>
              {item.role && (
                <div className={styles.timelineRole}>{item.role}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  })();

  return (
    <div className={styles.container}>
      <SectionTitle level="h3" className={styles.sectionTitle}>
        약력
      </SectionTitle>

      {timelineBody}
    </div>
  );
};
