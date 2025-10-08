import { useMemo } from 'react';
import { categorizeTechStack, getTechBadgeClass } from '../utils/techStackCategorization';

export interface UseTechStackCategorizationReturn {
  categorizedTech: Array<{ name: string; techs: string[] }>;
  getBadgeClass: (tech: string) => string;
}

/**
 * 기술 스택 분류를 최적화하는 훅
 */
export const useTechStackCategorization = (technologies: string[]): UseTechStackCategorizationReturn => {
  // 기술 스택 분류 메모이제이션
  const categorizedTech = useMemo(() => {
    if (!technologies || technologies.length === 0) {
      return [];
    }
    return categorizeTechStack(technologies);
  }, [technologies]);

  // 배지 클래스 반환 함수 메모이제이션
  const getBadgeClass = useMemo(() => {
    return (tech: string) => getTechBadgeClass(tech);
  }, []);

  return {
    categorizedTech,
    getBadgeClass
  };
};
