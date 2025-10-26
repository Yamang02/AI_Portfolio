/**
 * 관리자용 Education React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminEducationApi } from './adminEducationApi';
import type { Education, EducationFormData } from '../model/education.types';
import { message } from 'antd';

// ==================== Query Keys ====================
export const EDUCATION_KEYS = {
  all: ['admin-educations'] as const,
  lists: () => [...EDUCATION_KEYS.all, 'list'] as const,
  list: (filter?: any) => [...EDUCATION_KEYS.lists(), filter] as const,
  details: () => [...EDUCATION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EDUCATION_KEYS.details(), id] as const,
};

// ==================== Queries ====================

/**
 * Education 목록 조회 훅
 */
export const useAdminEducationsQuery = () => {
  return useQuery({
    queryKey: EDUCATION_KEYS.lists(),
    queryFn: () => adminEducationApi.getEducations(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * Education 상세 조회 훅
 */
export const useAdminEducationQuery = (id: string | null) => {
  return useQuery({
    queryKey: EDUCATION_KEYS.detail(id!),
    queryFn: () => adminEducationApi.getEducationById(id!),
    enabled: !!id,
  });
};

// ==================== Mutations ====================

/**
 * Education 생성/수정 Mutation 훅
 */
export const useEducationMutation = (editingEducation?: Education | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EducationFormData) => {
      if (editingEducation) {
        return await adminEducationApi.updateEducation(editingEducation.id, data);
      } else {
        return await adminEducationApi.createEducation(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEYS.lists() });
      message.success(
        editingEducation ? 'Education 수정 성공' : 'Education 생성 성공'
      );
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

/**
 * Education 삭제 Mutation 훅
 */
export const useDeleteEducationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminEducationApi.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEYS.lists() });
      message.success('Education 삭제 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

/**
 * Education 정렬 순서 업데이트 Mutation 훅
 */
export const useUpdateEducationSortOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sortOrderUpdates: Record<string, number>) =>
      adminEducationApi.updateSortOrder(sortOrderUpdates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEYS.lists() });
      message.success('정렬 순서 업데이트 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};
