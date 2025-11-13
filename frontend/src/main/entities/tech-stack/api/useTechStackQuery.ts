/**
 * 기술 스택 React Query 훅들
 */

import { useQuery } from '@tanstack/react-query';
import { techStackApi } from './techStackApi';
import { QUERY_STALE_TIME } from '../../../config/queryCacheConfig';

// 쿼리 키 상수
export const TECH_STACK_QUERY_KEYS = {
  all: ['techStacks'] as const,
  lists: () => [...TECH_STACK_QUERY_KEYS.all, 'list'] as const,
  core: () => [...TECH_STACK_QUERY_KEYS.all, 'core'] as const,
  details: () => [...TECH_STACK_QUERY_KEYS.all, 'detail'] as const,
  detail: (name: string) => [...TECH_STACK_QUERY_KEYS.details(), name] as const,
  category: (category: string) => [...TECH_STACK_QUERY_KEYS.lists(), 'category', category] as const,
} as const;

/**
 * 기술 스택 목록 조회 훅
 */
export const useTechStacksQuery = () => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.lists(),
    queryFn: () => techStackApi.getTechStacks(),
    staleTime: QUERY_STALE_TIME.TECH_STACK,
  });
};

/**
 * 핵심 기술 스택 조회 훅
 */
export const useCoreTechStacksQuery = () => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.core(),
    queryFn: () => techStackApi.getCoreTechStacks(),
    staleTime: QUERY_STALE_TIME.TECH_STACK,
  });
};

/**
 * 기술 스택 이름으로 조회 훅
 */
export const useTechStackQuery = (name: string) => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.detail(name),
    queryFn: () => techStackApi.getTechStackByName(name),
    enabled: !!name,
    staleTime: QUERY_STALE_TIME.TECH_STACK,
  });
};

/**
 * 카테고리별 기술 스택 조회 훅
 */
export const useTechStacksByCategoryQuery = (category: string) => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.category(category),
    queryFn: () => techStackApi.getTechStacksByCategory(category),
    enabled: !!category,
    staleTime: QUERY_STALE_TIME.TECH_STACK,
  });
};
