/**
 * Project React Query 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { projectApi } from './projectApi';
import { Project } from '../model/project.types';
import { queryClient as mainQueryClient } from '../../../../main/config/queryClient';

// Query Keys
export const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  list: (filter?: any) => [...PROJECT_KEYS.lists(), filter] as const,
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROJECT_KEYS.details(), id] as const,
};

// Queries
export const useProjectsQuery = () => {
  return useQuery({
    queryKey: PROJECT_KEYS.lists(),
    queryFn: () => projectApi.getProjects(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useProjectQuery = (id: number | null) => {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id!),
    queryFn: () => projectApi.getProjectById(id!),
    enabled: !!id,
  });
};

// Mutations
export const useProjectMutation = (editingProject?: Project | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      if (editingProject) {
        await projectApi.updateProject(editingProject.id, data);
      } else {
        await projectApi.createProject(data);
      }
    },
    onSuccess: () => {
      // 어드민 캐시 무효화
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      // 메인 페이지 캐시도 무효화
      mainQueryClient.invalidateQueries({ queryKey: ['projects'] });
      message.success(editingProject ? '프로젝트 수정 성공' : '프로젝트 생성 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectApi.deleteProject(id),
    onSuccess: () => {
      // 어드민 캐시 무효화
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      // 메인 페이지 캐시도 무효화
      mainQueryClient.invalidateQueries({ queryKey: ['projects'] });
      message.success('프로젝트 삭제 성공');
    },
    onError: (error: Error) => {
      message.error(error.message);
    },
  });
};

