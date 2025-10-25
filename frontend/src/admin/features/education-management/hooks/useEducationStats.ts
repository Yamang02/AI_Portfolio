/**
 * Education 통계 계산 커스텀 훅
 */

import { useMemo } from 'react';
import type { Education, EducationStats, EducationType } from '@/admin/entities/education';

export const useEducationStats = (educations: Education[] = []): EducationStats => {
  return useMemo(() => {
    const total = educations.length;
    const ongoing = educations.filter(e => !e.endDate).length;

    const byType: Record<EducationType, number> = {
      UNIVERSITY: 0,
      BOOTCAMP: 0,
      ONLINE_COURSE: 0,
      CERTIFICATION: 0,
      OTHER: 0,
    };

    educations.forEach(education => {
      if (education.type) {
        byType[education.type] = (byType[education.type] || 0) + 1;
      }
    });

    return {
      total,
      ongoing,
      byType,
    };
  }, [educations]);
};
