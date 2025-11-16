/**
 * Experience 엔티티 타입 정의
 * Main과 Admin에서 공통으로 사용하는 경험 타입
 */

import { BaseItem } from '../../project/model/project.types';

// Experience 타입 ENUM
export enum ExperienceType {
  FULL_TIME = 'FULL_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  PART_TIME = 'PART_TIME',
  INTERNSHIP = 'INTERNSHIP',
  OTHER = 'OTHER',
}

// Experience 타입 (타입 별칭)
export type ExperienceTypeString = 'FULL_TIME' | 'CONTRACT' | 'PART_TIME' | 'FREELANCE' | 'INTERNSHIP' | 'OTHER';

// Experience 타입 표시명
export const EXPERIENCE_TYPE_LABELS: Record<ExperienceTypeString, string> = {
  FULL_TIME: '정규직',
  CONTRACT: '계약직',
  FREELANCE: '프리랜서',
  PART_TIME: '파트타임',
  INTERNSHIP: '인턴십',
  OTHER: '기타',
};

// Experience 엔티티 (Main용 - BaseItem 확장)
export interface ExperienceMain extends BaseItem {
  organization: string;
  role?: string;
  location?: string;
  type: 'career';
  mainResponsibilities?: string[]; // 주요 담당 업무 목록
  achievements?: string[]; // 주요 성과/업적 목록
  projects?: string[]; // 담당했던 주요 프로젝트명들
}

// Experience 엔티티 (Admin용)
export interface Experience {
  id: string;
  title: string;
  description?: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  type: ExperienceTypeString;
  jobField?: string; // 직무 분야 (개발, 교육, 디자인 등)
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
  type: ExperienceTypeString;
  jobField?: string; // 직무 분야 (개발, 교육, 디자인 등)
  technologies: string[];
  mainResponsibilities: string[];
  achievements: string[];
  projects: string[];
  sortOrder?: number;
}

// Experience 필터
export interface ExperienceFilter {
  searchText?: string;
  type?: ExperienceTypeString | 'all';
  organization?: string;
}

// Experience 통계
export interface ExperienceStats {
  total: number;
  byType: Record<ExperienceTypeString, number>;
}

