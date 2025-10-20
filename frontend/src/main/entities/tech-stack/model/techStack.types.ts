/**
 * 기술 스택 엔티티 타입 정의
 */

import { BaseEntity, TechStackCategory } from '../../shared/types';

// 기술 스택 엔티티
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

// 기술 스택 생성 요청
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

// 기술 스택 수정 요청
export interface TechStackUpdateRequest extends Partial<TechStackCreateRequest> {}

// 기술 스택 필터
export interface TechStackFilter {
  category?: TechStackCategory | 'all';
  isCore?: boolean;
  search?: string;
  sortBy?: 'name' | 'category' | 'proficiencyLevel' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

// 기술 스택 통계
export interface TechStackStats {
  totalTechStacks: number;
  coreTechStacks: number;
  categoryCounts: Record<TechStackCategory, number>;
  averageProficiency: number;
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
