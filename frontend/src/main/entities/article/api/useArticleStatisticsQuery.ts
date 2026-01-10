import { useQuery } from '@tanstack/react-query';
import { articleApi } from './articleApi';

/**
 * 아티클 통계 조회 훅
 */
export const useArticleStatisticsQuery = () => {
  return useQuery({
    queryKey: ['articles', 'statistics'],
    queryFn: () => articleApi.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
