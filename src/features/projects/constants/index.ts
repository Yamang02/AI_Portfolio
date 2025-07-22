import { Project, Experience, Education, Certification } from '../types';
import { GITHUB_PROJECTS } from './projects';
import { LOCAL_PROJECTS } from './localProjects';
import { EXPERIENCES, EDUCATIONS } from './experiences';
import { CERTIFICATIONS } from './certifications';

// 모든 프로젝트 통합 (GitHub + 로컬)
export const ALL_PROJECTS: Project[] = [
  ...GITHUB_PROJECTS,
  ...LOCAL_PROJECTS
];

// 모든 경력 항목
export const ALL_EXPERIENCES: Experience[] = [
  ...EXPERIENCES
];

// 모든 교육 항목
export const ALL_EDUCATIONS: Education[] = [
  ...EDUCATIONS
];

// 모든 자격증 항목
export const ALL_CERTIFICATIONS: Certification[] = [
  ...CERTIFICATIONS
];

// 각 카테고리별 내보내기
export { GITHUB_PROJECTS } from './projects';
export { LOCAL_PROJECTS } from './localProjects';
export { EXPERIENCES, EDUCATIONS } from './experiences';
export { CERTIFICATIONS } from './certifications'; 