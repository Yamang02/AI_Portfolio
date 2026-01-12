/**
 * 경험 React Query 훅들
 */

import { useQuery } from '@tanstack/react-query';
import { experienceApi } from './experienceApi';
import { QUERY_STALE_TIME } from '@/shared/config/queryCacheConfig';

// 쿼리 키 상수
export const EXPERIENCE_QUERY_KEYS = {
  all: ['experiences'] as const,
  lists: () => [...EXPERIENCE_QUERY_KEYS.all, 'list'] as const,
} as const;

/**
 * 경험 목록 조회 훅 (Main용 - 공개 API 사용)
 */
export const useExperiencesQuery = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: EXPERIENCE_QUERY_KEYS.lists(),
    queryFn: () => experienceApi.getExperiencesMain(),
    staleTime: QUERY_STALE_TIME.EXPERIENCE,
    enabled: options?.enabled !== false, // 기본값은 true
  });
};
