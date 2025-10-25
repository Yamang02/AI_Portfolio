/**
 * Experience 엔티티 타입 정의
 */

// Experience 타입
export type ExperienceType = 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'INTERNSHIP' | 'OTHER';

// Experience 엔티티
export interface Experience {
  id: string;
  title: string;
  description?: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  type: ExperienceType;
  technologies: string[];
  mainResponsibilities: string[];
  achievements: string[];
  projects: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Experience 생성/수정 폼 데이터
export interface ExperienceFormData {
  title: string;
  description?: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  type: ExperienceType;
  technologies: string[];
  mainResponsibilities: string[];
  achievements: string[];
  projects: string[];
  sortOrder?: number;
}

// Experience 필터
export interface ExperienceFilter {
  searchText?: string;
  type?: ExperienceType | 'all';
  organization?: string;
}

// Experience 통계
export interface ExperienceStats {
  total: number;
  ongoing: number;
  byType: Record<ExperienceType, number>;
}
