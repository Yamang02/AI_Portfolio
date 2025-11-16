/**
 * Education 엔티티 타입 정의
 * Main과 Admin에서 공통으로 사용하는 교육 타입
 */

import { BaseItem } from '../../project/model/project.types';

// Education 타입
export type EducationType = 'UNIVERSITY' | 'BOOTCAMP' | 'ONLINE_COURSE' | 'CERTIFICATION' | 'OTHER';

// Education 엔티티 (Main용 - BaseItem 확장)
export interface EducationMain extends BaseItem {
  organization: string;
  degree?: string;
  location?: string;
  type: 'education';
  projects?: string[]; // 교육 중 진행한 프로젝트들
}

// Education 엔티티 (Admin용)
export interface Education {
  id: string;
  title: string;
  description?: string;
  organization: string;
  degree?: string;
  major?: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  type: EducationType;
  technologies: string[];
  projects: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Education 생성/수정 폼 데이터
export interface EducationFormData {
  title: string;
  description?: string;
  organization: string;
  degree?: string;
  major?: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
  type: EducationType;
  technologies?: string[];
  projects?: string[];
  sortOrder?: number;
  techStackRelationships: Array<{
    techStackId: number;
    isPrimary?: boolean;
    usageDescription?: string;
  }>;
  projectRelationships: Array<{
    projectBusinessId: string;
    projectType?: string;
    grade?: string;
    isPrimary?: boolean;
    usageDescription?: string;
    roleInProject?: string;
    contributionDescription?: string;
  }>;
}

// Education 필터
export interface EducationFilter {
  searchText?: string;
  type?: EducationType | 'all';
  organization?: string;
}

// Education 통계
export interface EducationStats {
  total: number;
  ongoing: number;
  byType: Record<EducationType, number>;
}

