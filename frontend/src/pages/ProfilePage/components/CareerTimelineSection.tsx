import React, { useMemo } from 'react';
import { SkeletonCard } from '@/design-system/components/Skeleton/SkeletonCard';
import { SectionTitle } from '@/design-system/components/SectionTitle';
import { CareerCard } from './CareerCard';
import type { Experience } from '@/main/entities/experience';
import type { Education } from '@/main/entities/education';
import styles from './CareerTimelineSection.module.css';

interface CareerTimelineSectionProps {
  experiences: Experience[];
  educations: Education[];
  isLoadingExperiences: boolean;
  isLoadingEducations: boolean;
}

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

  return (
    <div className={styles.container}>
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
