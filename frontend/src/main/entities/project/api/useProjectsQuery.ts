/**
 * 프로젝트 React Query 훅들
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from './projectApi';
import { QUERY_STALE_TIME, STALE_TIME } from '../../../config/queryCacheConfig';
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectFilter
} from '../model/project.types';

// 쿼리 키 상수
export const PROJECT_QUERY_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_QUERY_KEYS.all, 'list'] as const,
  list: (filter: ProjectFilter) => [...PROJECT_QUERY_KEYS.lists(), filter] as const,
  details: () => [...PROJECT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...PROJECT_QUERY_KEYS.details(), id] as const,
  admin: () => [...PROJECT_QUERY_KEYS.all, 'admin'] as const,
  github: () => [...PROJECT_QUERY_KEYS.all, 'github'] as const,
} as const;

/**
 * 프로젝트 목록 조회 훅
 */
export const useProjectsQuery = (params?: {
  type?: 'project' | 'certification';
  source?: 'github' | 'local' | 'certification';
  isTeam?: boolean;
}) => {
  return useQuery({
    queryKey: [...PROJECT_QUERY_KEYS.lists(), params],
    queryFn: () => projectApi.getProjects(params),
    staleTime: QUERY_STALE_TIME.PROJECT,
  });
};

/**
 * 프로젝트 상세 조회 훅
 */
export const useProjectQuery = (id: string) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => projectApi.getProjectById(id),
    enabled: !!id,
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 관리자용 프로젝트 목록 조회 훅
 */
export const useAdminProjectsQuery = (filter: ProjectFilter = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(filter),
    queryFn: () => projectApi.getAdminProjects(filter),
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * 관리자용 프로젝트 상세 조회 훅
 */
export const useAdminProjectQuery = (id: number) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => projectApi.getAdminProject(id),
    enabled: !!id,
    staleTime: STALE_TIME.NONE,
  });
};

/**
 * GitHub 프로젝트 목록 조회 훅
 */
export const useGitHubProjectsQuery = () => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.github(),
    queryFn: () => projectApi.getGitHubProjects(),
    staleTime: QUERY_STALE_TIME.GITHUB,
  });
};

/**
 * 프로젝트 생성 뮤테이션 훅
 */
export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectCreateRequest) => projectApi.createProject(project),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.lists() });
    },
  });
};

/**
 * 프로젝트 수정 뮤테이션 훅
 */
export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, project }: { id: number; project: ProjectUpdateRequest }) =>
      projectApi.updateProject(id, project),
    onSuccess: (_, { id }) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.lists() });
    },
  });
};

/**
 * 프로젝트 삭제 뮤테이션 훅
 */
export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => projectApi.deleteProject(id),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.admin() });
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEYS.lists() });
    },
  });
};

/**
 * 프로젝트 프리페치 훅
 */
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: PROJECT_QUERY_KEYS.detail(id),
      queryFn: () => projectApi.getProjectById(id),
      staleTime: STALE_TIME.NONE,
    });
  };
};
