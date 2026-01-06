import React, { useMemo } from 'react';
import { SkeletonCard } from '@/design-system/components/Skeleton/SkeletonCard';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { CareerCard } from './CareerCard';
import { formatDateRange } from '@/shared/utils/safeStringUtils';
import type { Experience } from '@/main/entities/experience';
import type { Education } from '@/main/entities/education';
import styles from './CareerTimelineSection.module.css';

interface CareerTimelineSectionProps {
  experiences: Experience[];
  educations: Education[];
  isLoadingExperiences: boolean;
  isLoadingEducations: boolean;
}

// 타임라인 아이템 타입
type TimelineItem = {
  id: string;
  type: 'experience' | 'education';
  period: string;
  organization: string;
  role: string;
};

export const CareerTimelineSection: React.FC<CareerTimelineSectionProps> = ({
  experiences,
  educations,
  isLoadingExperiences,
  isLoadingEducations,
}) => {
  // 경력 정렬 (최신순)
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      const dateA = parseDate(a.startDate).getTime();
      const dateB = parseDate(b.startDate).getTime();
      return dateB - dateA; // 최신순
    });
  }, [experiences]);

  // 교육 정렬 (최신순)
  const sortedEducations = useMemo(() => {
    return [...educations].sort((a, b) => {
      const dateA = parseDate(a.startDate).getTime();
      const dateB = parseDate(b.startDate).getTime();
      return dateB - dateA; // 최신순
    });
  }, [educations]);

  // 경력과 교육을 합쳐서 날짜순으로 정렬 (타임라인용)
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // 경력 추가
    experiences.forEach((exp) => {
      items.push({
        id: exp.id,
        type: 'experience',
        period: formatDateRange(exp.startDate, exp.endDate, ' ~ '),
        organization: exp.organization,
        role: exp.role || '',
      });
    });

    // 교육 추가
    educations.forEach((edu) => {
      items.push({
        id: edu.id,
        type: 'education',
        period: formatDateRange(edu.startDate, edu.endDate, ' ~ '),
        organization: edu.organization,
        role: '수강',
      });
    });

    // 날짜순 정렬 (최신순)
    return items.sort((a, b) => {
      const itemA = a.type === 'experience'
        ? experiences.find((e) => e.id === a.id)!
        : educations.find((e) => e.id === a.id)!;
      const itemB = b.type === 'experience'
        ? experiences.find((e) => e.id === b.id)!
        : educations.find((e) => e.id === b.id)!;
      
      const dateA = parseDate(itemA.startDate).getTime();
      const dateB = parseDate(itemB.startDate).getTime();
      return dateB - dateA; // 최신순
    });
  }, [experiences, educations]);

  return (
    <div className={styles.container}>
      {/* 통합 타임라인 섹션 */}
      <div className={styles.timelineSection}>
        <SectionTitle level="h3" className={styles.sectionTitle}>
          약력
        </SectionTitle>
        
        {isLoadingExperiences || isLoadingEducations ? (
          <div className={styles.timeline}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.timelineItem}>
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
        ) : timelineItems.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>약력 정보가 없습니다.</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* 기존 경력/교육 상세 섹션 */}
      <div className={styles.detailSection}>
        {/* 2열 그리드: Work | Other Experience */}
        <div className={styles.grid}>
          {/* 왼쪽: Work (경력) */}
          <div className={styles.column}>
            <SectionTitle level="h3" className={styles.sectionTitle}>
              Work
            </SectionTitle>
            {isLoadingExperiences ? (
              <div className={styles.cards}>
                {Array.from({ length: 2 }).map((_, index) => (
                  <SkeletonCard
                    key={index}
                    showImage={false}
                    showActions={false}
                    lines={4}
                  />
                ))}
              </div>
            ) : sortedExperiences.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>경력 정보가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.cards}>
                {sortedExperiences.map((experience) => (
                  <CareerCard
                    key={experience.id}
                    type="experience"
                    data={experience}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: Other Experience (교육) */}
          <div className={styles.column}>
            <SectionTitle level="h3" className={styles.sectionTitle}>
              Other Experience
            </SectionTitle>
            {isLoadingEducations ? (
              <div className={styles.cards}>
                {Array.from({ length: 2 }).map((_, index) => (
                  <SkeletonCard
                    key={index}
                    showImage={false}
                    showActions={false}
                    lines={4}
                  />
                ))}
              </div>
            ) : sortedEducations.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>교육 정보가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.cards}>
                {sortedEducations.map((education) => (
                  <CareerCard
                    key={education.id}
                    type="education"
                    data={education}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 날짜 파싱 헬퍼 함수
function parseDate(dateStr: unknown): Date {
  if (!dateStr) {
    return new Date();
  }

  // 배열 형태 [YYYY, MM, DD]
  if (Array.isArray(dateStr)) {
    if (dateStr.length >= 2 && typeof dateStr[0] === 'number' && typeof dateStr[1] === 'number') {
      const year = dateStr[0];
      const month = dateStr[1];
      return new Date(year, month - 1, 1);
    }
    return new Date();
  }

  // 문자열 형태 YYYY-MM
  if (typeof dateStr === 'string') {
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    }
    return new Date(dateStr);
  }

  return new Date();
}
