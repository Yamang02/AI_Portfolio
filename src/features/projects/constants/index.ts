import { Project } from '../types';
import { GITHUB_PROJECTS } from './projects';
import { LOCAL_PROJECTS } from './localProjects';
import { EXPERIENCES } from './experiences';

// 모든 프로젝트와 경험을 통합
export const ALL_PROJECTS: Project[] = [
  ...GITHUB_PROJECTS,
  ...LOCAL_PROJECTS,
  ...EXPERIENCES
];

// 각 카테고리별 내보내기
export { GITHUB_PROJECTS } from './projects';
export { LOCAL_PROJECTS } from './localProjects';
export { EXPERIENCES } from './experiences'; 