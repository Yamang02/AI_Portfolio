/**
 * 프로젝트 React Query 훅
 * Main과 Admin에서 공통으로 사용하는 프로젝트 쿼리 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from './projectApi';
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectFilter,
  ProjectListParams
} from '../model/project.types';

// Query Keys
export const PROJECT_QUERY_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_QUERY_KEYS.all, 'list'] as const,
  list: (filter?: ProjectFilter | ProjectListParams) => [...PROJECT_QUERY_KEYS.lists(), filter] as const,
  details: () => [...PROJECT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...PROJECT_QUERY_KEYS.details(), id] as const,
  admin: () => [...PROJECT_QUERY_KEYS.all, 'admin'] as const,
  github: () => [...PROJECT_QUERY_KEYS.all, 'github'] as const,
} as const;

/**
 * 프로젝트 목록 조회 훅 (Main용)
 */
export const useProjectsQuery = (params?: ProjectListParams) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(params),
    queryFn: () => projectApi.getProjects(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 프로젝트 상세 조회 훅 (Main용)
 */
export const useProjectQuery = (id: string) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => projectApi.getProjectById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 관리자용 프로젝트 목록 조회 훅
 */
export const useAdminProjectsQuery = (filter: ProjectFilter = {}) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.list(filter),
    queryFn: () => projectApi.getAdminProjects(filter),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 관리자용 프로젝트 상세 조회 훅
 */
export const useAdminProjectQuery = (id: number | string) => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.detail(id),
    queryFn: () => projectApi.getAdminProject(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * GitHub 프로젝트 목록 조회 훅
 */
export const useGitHubProjectsQuery = () => {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.github(),
    queryFn: () => projectApi.getGitHubProjects(),
    staleTime: 10 * 60 * 1000, // 10분
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
    mutationFn: ({ id, project }: { id: number | string; project: ProjectUpdateRequest }) =>
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
    mutationFn: (id: number | string) => projectApi.deleteProject(id),
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
      staleTime: 5 * 60 * 1000,
    });
  };
};

