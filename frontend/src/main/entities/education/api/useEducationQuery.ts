/**
 * 교육 React Query 훅들
 */

import { useQuery } from '@tanstack/react-query';
import { educationApi } from './educationApi';

// 쿼리 키 상수
export const EDUCATION_QUERY_KEYS = {
  all: ['education'] as const,
  lists: () => [...EDUCATION_QUERY_KEYS.all, 'list'] as const,
} as const;

/**
 * 교육 목록 조회 훅
 */
export const useEducationQuery = () => {
  return useQuery({
    queryKey: EDUCATION_QUERY_KEYS.lists(),
    queryFn: () => educationApi.getEducation(),
    staleTime: 24 * 60 * 60 * 1000, // 24시간 - 콜드스타트 보완을 위해 긴 캐시 유지
  });
};
