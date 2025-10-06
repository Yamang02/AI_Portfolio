// Projects
export type { Project, BaseItem } from './project';

// Experience
export type { Experience } from './experience';

// Education  
export type { Education } from './education';

// Certification
export type { Certification } from './certification';

// TechStack
export * from './techstack';

// Legacy types for backward compatibility
export type ProjectType = 'project' | 'experience' | 'certification';
export type ProjectSource = 'github' | 'local' | 'experience' | 'certification';