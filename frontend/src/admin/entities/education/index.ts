/**
 * Education Entity Public API
 */

// Types
export type {
  Education,
  EducationFormData,
  EducationFilter,
  EducationStats,
  EducationType,
} from './model/education.types';

// API
export { adminEducationApi } from './api/adminEducationApi';

// React Query Hooks
export {
  useAdminEducationsQuery,
  useAdminEducationQuery,
  useEducationMutation,
  useDeleteEducationMutation,
  useUpdateEducationSortOrderMutation,
  EDUCATION_KEYS,
} from './api/useAdminEducationQuery';
