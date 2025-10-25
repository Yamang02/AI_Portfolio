/**
 * 관리자용 Experience React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminExperienceApi } from './adminExperienceApi';
import type { Experience, ExperienceFormData } from '../model/experience.types';
import { message } from 'antd';

// ==================== Query Keys ====================
export const EXPERIENCE_KEYS = {
  all: ['admin-experiences'] as const,
  lists: () => [...EXPERIENCE_KEYS.all, 'list'] as const,
  list: (filter?: any) => [...EXPERIENCE_KEYS.lists(), filter] as const,
  details: () => [...EXPERIENCE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EXPERIENCE_KEYS.details(), id] as const,
};

// ==================== Queries ====================

/**
 * Experience 목록 조회 훅
 */
export const useAdminExperiencesQuery = () => {
  return useQuery({
    queryKey: EXPERIENCE_KEYS.lists(),
    queryFn: () => adminExperienceApi.getExperiences(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * Experience 상세 조회 훅
 */
export const useAdminExperienceQuery = (id: string | null) => {
  return useQuery({
    queryKey: EXPERIENCE_KEYS.detail(id!),
    queryFn: () => adminExperienceApi.getExperienceById(id!),
    enabled: !!id,
  });
};

// ==================== Mutations ====================

/**
 * Experience 생성/수정 Mutation 훅
 */
export const useExperienceMutation = (editingExperience?: Experience | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExperienceFormData) => {
      if (editingExperience) {
        await adminExperienceApi.updateExperience(editingExperience.id, data);
      } else {
        await adminExperienceApi.createExperience(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCE_KEYS.lists() });
      message.success(
        editingExperience ? 'Experience 수정 성공' : 'Experience 생성 성공'
      );
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

/**
 * Experience 삭제 Mutation 훅
 */
export const useDeleteExperienceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminExperienceApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCE_KEYS.lists() });
      message.success('Experience 삭제 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

/**
 * Experience 정렬 순서 업데이트 Mutation 훅
 */
export const useUpdateExperienceSortOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sortOrderUpdates: Record<string, number>) =>
      adminExperienceApi.updateSortOrder(sortOrderUpdates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCE_KEYS.lists() });
      message.success('정렬 순서 업데이트 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};
