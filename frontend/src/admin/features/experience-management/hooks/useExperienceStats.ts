/**
 * Experience 통계 계산 커스텀 훅
 */

import { useMemo } from 'react';
import type { Experience, ExperienceStats, ExperienceTypeString } from '@/admin/entities/experience';

export const useExperienceStats = (experiences: Experience[] = []): ExperienceStats => {
  return useMemo(() => {
    const total = experiences.length;

    const byType: Record<ExperienceTypeString, number> = {
      FULL_TIME: 0,
      CONTRACT: 0,
      FREELANCE: 0,
      PART_TIME: 0,
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
      byType,
    };
  }, [experiences]);
};
