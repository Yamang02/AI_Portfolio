/**
 * Tech Stack 엔티티 타입 정의
 * Main과 Admin에서 공통으로 사용하는 기술 스택 타입
 */

import { BaseEntity } from '../../../shared/types/common.types';

// 기술 스택 카테고리 타입 (Main과 Admin 통합)
export type TechStackCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'mobile'
  | 'ai'
  | 'language'
  | 'framework'
  | 'tool'
  | 'other';

// 기술 스택 레벨 타입
export type TechStackLevel = 'core' | 'general' | 'learning';

// 기술 스택 엔티티 (Main용)
export interface TechStack extends BaseEntity {
  name: string;
  category: TechStackCategory;
  description?: string;
  iconUrl?: string;
  proficiencyLevel?: number; // 1-5 레벨
  isCore: boolean; // 핵심 기술 여부
  sortOrder: number;
  color?: string; // UI에서 사용할 색상
  websiteUrl?: string;
  documentationUrl?: string;
}

// 기술 스택 메타데이터 (Admin용)
export interface TechStackMetadata {
  id?: number;
  name: string;
  displayName: string;
  category: string;
  level: string;
  isCore: boolean;
  isActive: boolean;
  colorHex?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 기술 스택 생성 요청 (Main)
export interface TechStackCreateRequest {
  name: string;
  category: TechStackCategory;
  description?: string;
  iconUrl?: string;
  proficiencyLevel?: number;
  isCore?: boolean;
  sortOrder?: number;
  color?: string;
  websiteUrl?: string;
  documentationUrl?: string;
}

// 기술 스택 수정 요청 (Main)
export interface TechStackUpdateRequest extends Partial<TechStackCreateRequest> {}

// 기술 스택 폼 데이터 (Admin)
export interface TechStackFormData {
  name: string;
  displayName: string;
  category: string;
  level: string;
  isCore: boolean;
  isActive: boolean;
  colorHex: string;
  description: string;
  sortOrder: number;
}

// 기술 스택 필터
export interface TechStackFilter {
  category?: TechStackCategory | 'all';
  isCore?: boolean;
  search?: string;
  sortBy?: 'name' | 'category' | 'proficiencyLevel' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

// 기술 스택 통계 (Admin용)
export interface TechStackStats {
  totalTechStacks?: number;
  coreTechStacks?: number;
  categoryCounts?: Record<TechStackCategory, number>;
  averageProficiency?: number;
  // Admin용 통계
  total?: number;
  active?: number;
  core?: number;
  categories?: number;
}

// 기술 스택 카테고리별 그룹
export interface TechStackGroup {
  category: TechStackCategory;
  techStacks: TechStack[];
  count: number;
}

// 기술 스택 사용 빈도
export interface TechStackUsage {
  techStack: TechStack;
  projectCount: number;
  usagePercentage: number;
}

// 기술 스택 프로젝트 정보
export interface TechStackProject {
  id: number;
  title: string;
  description: string;
  status: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  startDate: string;
  endDate?: string;
}

// 기술 스택 정렬 순서 업데이트 요청
export interface TechStackSortOrderUpdate {
  techName: string;
  newSortOrder: number;
}

// 기술 스택 배지 컴포넌트용 Props
export interface TechStackBadgeProps {
  tech: TechStackMetadata;
  variant?: 'default' | 'core' | 'filter' | 'compact' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

// 기술 스택 통계 (shared/techStackApi.ts용)
export interface TechStackStatistics {
  totalTechnologies: number;
  coreTechnologies: number;
  activeTechnologies: number;
  categoryCounts: CategoryCount[];
  levelCounts: LevelCount[];
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface LevelCount {
  level: string;
  count: number;
}
