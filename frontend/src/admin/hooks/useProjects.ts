import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProjectApi, ProjectCreateRequest, ProjectUpdateRequest, ProjectFilter } from '../api/adminProjectApi';

export const useProjects = (filter: ProjectFilter = {}) => {
  return useQuery({
    queryKey: ['admin-projects', filter],
    queryFn: () => adminProjectApi.getProjects(filter),
    select: (response) => response.data,
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
    mutationFn: (project: ProjectCreateRequest) => adminProjectApi.createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, project }: { id: string; project: ProjectUpdateRequest }) =>
      adminProjectApi.updateProject(id, project),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-project', id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminProjectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
  });
};

