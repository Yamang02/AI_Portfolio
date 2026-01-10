/**
 * Admin Query 래퍼 훅
 * 
 * React Query의 useQuery를 래핑하여 Admin 공통 옵션을 적용합니다.
 * - placeholderData: keepPreviousData (깜빡임 방지)
 * - staleTime: 5분
 * - gcTime: 10분
 * - retry: 1회
 * - refetchOnWindowFocus: false
 */

import { useQuery, UseQueryOptions, QueryKey, keepPreviousData } from '@tanstack/react-query';

export function useAdminQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    // 기본 옵션
    placeholderData: keepPreviousData, // 리페치 중 이전 데이터 유지 (깜빡임 방지)
    staleTime: 5 * 60 * 1000,          // 5분 (데이터가 신선한 상태로 간주되는 시간)
    gcTime: 10 * 60 * 1000,            // 10분 (캐시 보관 시간)
    retry: 1,                          // 실패 시 1회 재시도
    refetchOnWindowFocus: false,       // 윈도우 포커스 시 리페치 비활성화

    // 사용자 옵션 병합 (사용자 옵션이 우선)
    ...options,
  });
}
