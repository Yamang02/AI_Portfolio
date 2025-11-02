/**
 * 관리자용 기술 스택 엔티티 타입 정의
 */

// 관리자용 기술 스택 메타데이터
export interface TechStackMetadata {
  id?: number; // 추가: 백엔드에서 받는 ID
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

// 기술 스택 폼 데이터
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

// 기술 스택 카테고리 타입
export type TechStackCategory = 'language' | 'framework' | 'database' | 'tool' | 'other';

// 기술 스택 레벨 타입
export type TechStackLevel = 'core' | 'general' | 'learning';

// 기술 스택 통계
export interface TechStackStats {
  total: number;
  active: number;
  core: number;
  categories: number;
}

// 기술 스택 정렬 순서 업데이트 요청
export interface TechStackSortOrderUpdate {
  techName: string;
  newSortOrder: number;
}
