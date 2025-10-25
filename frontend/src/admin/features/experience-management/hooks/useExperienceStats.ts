/**
 * Experience 통계 계산 커스텀 훅
 */

import { useMemo } from 'react';
import type { Experience, ExperienceStats, ExperienceType } from '@/admin/entities/experience';

export const useExperienceStats = (experiences: Experience[] = []): ExperienceStats => {
  return useMemo(() => {
    const total = experiences.length;
    const ongoing = experiences.filter(e => !e.endDate).length;

    const byType: Record<ExperienceType, number> = {
      FULL_TIME: 0,
      PART_TIME: 0,
      FREELANCE: 0,
      INTERNSHIP: 0,
      OTHER: 0,
    };

    experiences.forEach(experience => {
      if (experience.type) {
        byType[experience.type] = (byType[experience.type] || 0) + 1;
      }
    });

    return {
      total,
      ongoing,
      byType,
    };
  }, [experiences]);
};
