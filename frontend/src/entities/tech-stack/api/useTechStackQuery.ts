/**
 * 기술 스택 React Query 훅
 * Main과 Admin에서 공통으로 사용하는 기술 스택 쿼리 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { techStackApi } from './techStackApi';
import { STALE_TIME } from '../../../main/config/queryCacheConfig';
import type { TechStackFormData } from '../model/tech-stack.types';

// Query Keys
export const TECH_STACK_QUERY_KEYS = {
  all: ['techStacks'] as const,
  lists: () => [...TECH_STACK_QUERY_KEYS.all, 'list'] as const,
  core: () => [...TECH_STACK_QUERY_KEYS.all, 'core'] as const,
  details: () => [...TECH_STACK_QUERY_KEYS.all, 'detail'] as const,
  detail: (name: string) => [...TECH_STACK_QUERY_KEYS.details(), name] as const,
  category: (category: string) => [...TECH_STACK_QUERY_KEYS.lists(), 'category', category] as const,
  admin: () => [...TECH_STACK_QUERY_KEYS.all, 'admin'] as const,
  projects: (techName: string) => [...TECH_STACK_QUERY_KEYS.detail(techName), 'projects'] as const,
} as const;

/**
 * 기술 스택 목록 조회 훅 (Main용)
 */
export const useTechStacksQuery = () => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.lists(),
    queryFn: () => techStackApi.getTechStacks(),
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 핵심 기술 스택 조회 훅 (Main용)
 */
export const useCoreTechStacksQuery = () => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.core(),
    queryFn: () => techStackApi.getCoreTechStacks(),
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 기술 스택 이름으로 조회 훅 (Main용)
 */
export const useTechStackQuery = (name: string) => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.detail(name),
    queryFn: () => techStackApi.getTechStackByName(name),
    enabled: !!name,
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 카테고리별 기술 스택 조회 훅 (Main용)
 */
export const useTechStacksByCategoryQuery = (category: string) => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.category(category),
    queryFn: () => techStackApi.getTechStacksByCategory(category),
    enabled: !!category,
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 관리자용 기술 스택 목록 조회 훅
 */
export const useAdminTechStacksQuery = () => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.admin(),
    queryFn: () => techStackApi.getAdminTechStacks(),
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 기술 스택의 프로젝트 목록 조회 훅
 */
export const useTechStackProjectsQuery = (techName: string | null) => {
  return useQuery({
    queryKey: TECH_STACK_QUERY_KEYS.projects(techName || ''),
    queryFn: () => techStackApi.getTechStackProjects(techName!),
    enabled: !!techName,
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 기술 스택 생성/수정 뮤테이션 훅
 */
export const useTechStackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      editingTech
    }: {
      data: TechStackFormData;
      editingTech: string | null;
    }) => {
      if (editingTech) {
        return techStackApi.updateTechStack(editingTech, data);
      } else {
        return techStackApi.createTechStack(data);
      }
    },
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: TECH_STACK_QUERY_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: TECH_STACK_QUERY_KEYS.lists() });
    },
  });
};

/**
 * 기술 스택 삭제 뮤테이션 훅
 */
export const useDeleteTechStackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => techStackApi.deleteTechStack(name),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: TECH_STACK_QUERY_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: TECH_STACK_QUERY_KEYS.lists() });
    },
  });
};

/**
 * 정렬 순서 업데이트 뮤테이션 훅
 */
export const useUpdateSortOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ techName, newSortOrder }: { techName: string; newSortOrder: number }) =>
      techStackApi.updateSortOrder(techName, newSortOrder),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: TECH_STACK_QUERY_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: TECH_STACK_QUERY_KEYS.lists() });
    },
  });
};

