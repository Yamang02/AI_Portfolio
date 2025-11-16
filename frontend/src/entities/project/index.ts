/**
 * Project 엔티티 Barrel Export
 */

// Types
export type {
  Project,
  ProjectCategory,
  ProjectStatus,
  ProjectSource,
  ProjectDetail,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectFilter,
  ProjectListParams,
  ProjectScreenshot,
  BaseItem,
} from './model/project.types';

// API
export { projectApi } from './api/projectApi';

// React Query Hooks
export {
  PROJECT_QUERY_KEYS,
  useProjectsQuery,
  useProjectQuery,
  useAdminProjectsQuery,
  useAdminProjectQuery,
  useGitHubProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  usePrefetchProject,
} from './api/useProjectQuery';

