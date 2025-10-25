/**
 * 관리자용 기술 스택 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTechStackApi } from './adminTechStackApi';
import type { 
  TechStackFormData, 
  TechStackSortOrderUpdate 
} from '../model/techStack.types';

// 기술 스택 목록 조회
export const useAdminTechStacksQuery = () => {
  return useQuery({
    queryKey: ['admin-tech-stacks'],
    queryFn: () => adminTechStackApi.getTechStacks(),
    staleTime: 5 * 60 * 1000, // 5분
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
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
    },
  });
};

// 기술 스택 삭제 뮤테이션
export const useDeleteTechStackMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => adminTechStackApi.deleteTechStack(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
    },
  });
};

// 정렬 순서 업데이트 뮤테이션
export const useUpdateSortOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TechStackSortOrderUpdate) => adminTechStackApi.updateSortOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tech-stacks'] });
    },
  });
};
