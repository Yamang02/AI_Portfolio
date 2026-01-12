/**
 * 교육 React Query 훅들
 */

import { useQuery } from '@tanstack/react-query';
import { educationApi } from './educationApi';
import { QUERY_STALE_TIME } from '@/shared/config/queryCacheConfig';

// 쿼리 키 상수
export const EDUCATION_QUERY_KEYS = {
  all: ['education'] as const,
  lists: () => [...EDUCATION_QUERY_KEYS.all, 'list'] as const,
} as const;

/**
 * 교육 목록 조회 훅
 */
export const useEducationQuery = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: EDUCATION_QUERY_KEYS.lists(),
    queryFn: () => educationApi.getEducation(),
    staleTime: QUERY_STALE_TIME.EDUCATION,
    enabled: options?.enabled !== false, // 기본값은 true
  });
};
