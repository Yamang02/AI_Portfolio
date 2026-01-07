/**
 * Project 엔티티 타입 정의
 */

export interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  type: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
  isTeam?: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  type: string;
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
}

// 프로젝트 - 기술스택 관계
export interface ProjectTechStackRelationship {
  id: number;
  projectId: number;
  techStackId: number;
  techStackName: string;
  isPrimary: boolean;
  usageDescription?: string;
}

// 엔티티 - 프로젝트 관계 (Experience, Education 등에서 사용)
export interface EntityProjectRelationship {
  id: number;
  projectBusinessId: string;  // Business ID (PRJ001, PRJ002...)
  projectTitle: string;
  isPrimary: boolean;
  usageDescription?: string;
  roleInProject?: string; // Experience-Project용
  contributionDescription?: string; // Experience-Project용
  projectType?: string; // Education-Project용
  grade?: string; // Education-Project용
}

