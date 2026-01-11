import { useQuery } from '@tanstack/react-query';
import { articleApi } from './articleApi';

/**
 * 아티클 목록 조회 쿼리
 */
export function useArticleListQuery(params: { 
  page: number; 
  size: number; 
  category?: string;
  projectId?: number;
  seriesId?: string;
  searchKeyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isFeatured?: boolean;
}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articleApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 아티클 상세 조회 쿼리
 */
export function useArticleQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !!businessId,
  });
}

/**
 * 아티클 네비게이션 조회 쿼리 (이전/다음 아티클)
 */
export function useArticleNavigationQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId, 'navigation'],
    queryFn: () => articleApi.getNavigation(businessId),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !!businessId,
  });
}