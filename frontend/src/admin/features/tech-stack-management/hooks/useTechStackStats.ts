/**
 * 기술 스택 통계 계산 커스텀 훅
 */

import { useMemo } from 'react';
import type { TechStackMetadata, TechStackStats } from '../../entities/tech-stack';

export const useTechStackStats = (techStacks: TechStackMetadata[] = []) => {
  const stats = useMemo((): TechStackStats => {
    const total = techStacks.length;
    const active = techStacks.filter(t => t.isActive).length;
    const core = techStacks.filter(t => t.isCore).length;
    const categories = [...new Set(techStacks.map(t => t.category))].length;

    return {
      total,
      active,
      core,
      categories,
    };
  }, [techStacks]);

  return stats;
};
