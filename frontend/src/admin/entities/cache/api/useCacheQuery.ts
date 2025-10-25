/**
 * Cache React Query Hooks
 * 캐시 관련 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import * as cacheApi from './cacheApi';

/**
 * 캐시 통계 조회 훅
 */
export const useCacheStats = () => {
  return useQuery({
    queryKey: ['cache', 'stats'],
    queryFn: cacheApi.getCacheStats,
    refetchInterval: 5000, // 5초마다 자동 갱신
  });
};

/**
 * 모든 캐시 키 목록 조회 훅
 */
export const useAllCacheKeys = () => {
  return useQuery({
    queryKey: ['cache', 'keys'],
    queryFn: cacheApi.getAllCacheKeys,
    enabled: false, // 수동으로만 호출
  });
};

/**
 * 전체 캐시 삭제 훅
 */
export const useClearAllCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cacheApi.clearAllCache,
    onSuccess: () => {
      message.success('모든 캐시가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
    },
    onError: (error: Error) => {
      message.error(`캐시 삭제 실패: ${error.message}`);
    },
  });
};

/**
 * 패턴별 캐시 삭제 훅
 */
export const useClearCacheByPattern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cacheApi.clearCacheByPattern,
    onSuccess: () => {
      message.success('패턴별 캐시가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['cache'] });
    },
    onError: (error: Error) => {
      message.error(`패턴별 캐시 삭제 실패: ${error.message}`);
    },
  });
};
