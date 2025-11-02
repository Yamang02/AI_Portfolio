/**
 * 경험 React Query 훅들
 */

import { useQuery } from '@tanstack/react-query';
import { experienceApi } from './experienceApi';

// 쿼리 키 상수
export const EXPERIENCE_QUERY_KEYS = {
  all: ['experiences'] as const,
  lists: () => [...EXPERIENCE_QUERY_KEYS.all, 'list'] as const,
} as const;

/**
 * 경험 목록 조회 훅
 */
export const useExperiencesQuery = () => {
  return useQuery({
    queryKey: EXPERIENCE_QUERY_KEYS.lists(),
    queryFn: () => experienceApi.getExperiences(),
    staleTime: 24 * 60 * 60 * 1000, // 24시간 - 콜드스타트 보완을 위해 긴 캐시 유지
  });
};
