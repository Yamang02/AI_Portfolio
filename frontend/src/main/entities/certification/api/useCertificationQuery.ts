/**
 * 자격증 React Query 훅들
 */

import { useQuery } from '@tanstack/react-query';
import { certificationApi } from './certificationApi';
import { QUERY_STALE_TIME } from '@/shared/config/queryCacheConfig';

// 쿼리 키 상수
export const CERTIFICATION_QUERY_KEYS = {
  all: ['certifications'] as const,
  lists: () => [...CERTIFICATION_QUERY_KEYS.all, 'list'] as const,
} as const;

/**
 * 자격증 목록 조회 훅 (Main용 - 공개 API 사용)
 */
export const useCertificationsQuery = (options?: {
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: CERTIFICATION_QUERY_KEYS.lists(),
    queryFn: () => certificationApi.getCertificationsMain(),
    staleTime: QUERY_STALE_TIME.CERTIFICATION,
    enabled: options?.enabled !== false, // 기본값은 true
  });
};
