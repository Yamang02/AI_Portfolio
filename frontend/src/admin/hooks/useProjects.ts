import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProjectApi, ProjectCreateRequest, ProjectUpdateRequest, ProjectFilter } from '../api/adminProjectApi';
import { queryClient as mainQueryClient } from '../../main/config/queryClient';
import { STALE_TIME } from '../../main/config/queryCacheConfig';

export const useProjects = (filter: ProjectFilter = {}) => {
  return useQuery({
    queryKey: ['admin-projects', filter],
    queryFn: () => adminProjectApi.getProjects(filter),
    select: (response) => response.data,
    staleTime: STALE_TIME.NONE,
    gcTime: 10 * 60 * 1000, // 10분 후 가비지 컬렉션
  });
};

export const useProject = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-project', id],
    queryFn: () => adminProjectApi.getProject(id),
    select: (response) => response.data,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectCreateRequest) => {
      console.log('[useCreateProject] Creating project:', project);
      return adminProjectApi.createProject(project);
    },
    onSuccess: (response) => {
      console.log('[useCreateProject] Project created successfully:', response);
      // 어드민 캐시 무효화 후 즉시 리패치
      queryClient.invalidateQueries({
        queryKey: ['admin-projects'],
        refetchType: 'active', // 활성 쿼리 즉시 리패치
      });
      // 메인 페이지 캐시도 무효화 (다른 QueryClient이므로 직접 접근)
      mainQueryClient.invalidateQueries({
        queryKey: ['projects'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      console.error('[useCreateProject] Error creating project:', error);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, project }: { id: string; project: ProjectUpdateRequest }) =>
      adminProjectApi.updateProject(id, project),
    onSuccess: (_, { id }) => {
      // 어드민 캐시 무효화 후 즉시 리패치
      queryClient.invalidateQueries({ 
        queryKey: ['admin-projects'],
        refetchType: 'active', // 활성 쿼리 즉시 리패치
      });
      queryClient.invalidateQueries({ 
        queryKey: ['admin-project', id],
        refetchType: 'active',
      });
      // 메인 페이지 캐시도 무효화 (다른 QueryClient이므로 직접 접근)
      mainQueryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'active',
      });
      mainQueryClient.invalidateQueries({ 
        queryKey: ['projects', 'detail', id],
        refetchType: 'active',
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProjectApi.deleteProject(id),
    onSuccess: () => {
      // 어드민 캐시 무효화 후 즉시 리패치
      queryClient.invalidateQueries({ 
        queryKey: ['admin-projects'],
        refetchType: 'active', // 활성 쿼리 즉시 리패치
      });
      // 메인 페이지 캐시도 무효화 (다른 QueryClient이므로 직접 접근)
      mainQueryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'active',
      });
    },
  });
};

