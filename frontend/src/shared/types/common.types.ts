/**
 * 공통 타입 정의
 */

// 기본 API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// 필터 옵션
export interface FilterOptions {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 에러 타입
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

// 로딩 상태
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// 기본 엔티티 인터페이스
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// 날짜 범위
export interface DateRange {
  startDate: string;
  endDate?: string;
}

// 기술 스택 카테고리
export type TechStackCategory = 
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'mobile'
  | 'ai'
  | 'other';

// 프로젝트 타입
export type ProjectType = 'BUILD' | 'LAB' | 'MAINTENANCE';

// 프로젝트 상태
export type ProjectStatus = 'completed' | 'in_progress' | 'maintenance';

// 팀 여부
export type TeamType = 'team' | 'individual';

// 정렬 방향
export type SortOrder = 'asc' | 'desc';

// 화면 크기 타입
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

// 테마 타입
export type Theme = 'light' | 'dark';

// 언어 타입
export type Language = 'ko' | 'en';




