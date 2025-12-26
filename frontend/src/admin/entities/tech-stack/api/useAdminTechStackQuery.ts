/**
 * 관리자용 기술 스택 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTechStackApi } from './adminTechStackApi';
import { STALE_TIME } from '../../../../main/config/queryCacheConfig';
import type {
  TechStackFormData
} from '../model/techStack.types';
import { queryClient as mainQueryClient } from '../../../../main/config/queryClient';

// 기술 스택 목록 조회
export const useAdminTechStacksQuery = () => {
  return useQuery({
    queryKey: ['admin-tech-stacks'],
    queryFn: () => adminTechStackApi.getTechStacks(),
    staleTime: STALE_TIME.NONE,
  });
};

// 기술 스택 프로젝트 조회
export const useTechStackProjectsQuery = (techName: string | null) => {
  return useQuery({
    queryKey: ['tech-stack-projects', techName],
    queryFn: () => adminTechStackApi.getTechStackProjects(techName!),
    enabled: !!techName,
  });
};

// 기술 스택 생성/수정 뮤테이션
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
        return adminTechStackApi.updateTechStack(editingTech, data);
      } else {
        return adminTechStackApi.createTechStack(data);
      }
    },
    onSuccess: () => {
      // 어드민 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
      // 메인 페이지 캐시도 무효화
      mainQueryClient.invalidateQueries({ queryKey: ['techStacks'] });
    },
  });
};

// 기술 스택 삭제 뮤테이션
export const useDeleteTechStackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminTechStackApi.deleteTechStack(name),
    onSuccess: () => {
      // 어드민 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
      // 메인 페이지 캐시도 무효화
      mainQueryClient.invalidateQueries({ queryKey: ['techStacks'] });
    },
  });
};

// 정렬 순서 업데이트 뮤테이션
export const useUpdateSortOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ techName, newSortOrder }: { techName: string; newSortOrder: number }) =>
      adminTechStackApi.updateSortOrder(techName, newSortOrder),
    onSuccess: () => {
      // 어드민 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
      // 메인 페이지 캐시도 무효화
      mainQueryClient.invalidateQueries({ queryKey: ['techStacks'] });
    },
  });
};
