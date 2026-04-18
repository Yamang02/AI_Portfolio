/**
 * Project Entity Public API
 */

// Types
export type {
  Project,
  ProjectFormData,
  ProjectTechStackRelationship,
  EntityProjectRelationship,
} from './model/project.types';

// API
export { projectApi } from './api/projectApi';

// React Query Hooks
export {
  useProjectsQuery,
  useProjectQuery,
  useProjectMutation,
  useDeleteProjectMutation,
  PROJECT_KEYS,
} from './api/useProjectQuery';

// Admin CRUD API + hooks
export {
  adminProjectApi,
} from './api/adminProjectApi';
export type {
  ProjectFilter,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectTechnicalCard,
} from './api/adminProjectApi';
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from './api/useProjects';

