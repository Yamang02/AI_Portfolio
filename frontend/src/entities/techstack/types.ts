// 기술 스택 메타데이터 타입 정의
export interface TechStackMetadata {
  name: string;
  displayName: string;
  category: TechStackCategory;
  level: TechStackLevel;
  isCore: boolean;
  isActive: boolean;
  iconUrl?: string;
  colorHex?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// 기술 스택 카테고리
export type TechStackCategory = 
  | 'language'      // 언어
  | 'framework'     // 프레임워크
  | 'runtime'       // 런타임
  | 'platform'      // 플랫폼
  | 'database'      // 데이터베이스
  | 'tool'          // 도구
  | 'web'           // 웹 기술
  | 'api'           // API/서비스
  | 'ai_ml'         // AI/ML 라이브러리
  | 'testing'       // 테스팅
  | 'scraping'      // 스크래핑
  | 'utility'       // 유틸리티
  | 'service'       // 서비스
  | 'template'      // 템플릿
  | 'library'       // 라이브러리
  | 'vcs'           // 버전 관리
  | 'erp'           // ERP
  | 'system'        // 시스템
  | 'data'          // 데이터
  | 'technique'     // 기술
  | 'hosting'       // 호스팅
  | 'other';        // 기타

// 기술 스택 레벨 (단순화)
export type TechStackLevel = 'core' | 'general' | 'learning';

// 기술 스택 통계
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

// 기술 스택 배지 컴포넌트용 Props
export interface TechStackBadgeProps {
  tech: TechStackMetadata;
  variant?: 'default' | 'core' | 'filter' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

// 기술 스택 필터 상태
export interface TechStackFilterState {
  selectedTechs: string[];
  categoryFilter: TechStackCategory[];
  levelFilter: TechStackLevel[];
  showCoreOnly: boolean;
  searchQuery: string;
}

// 기술 스택 그룹 (카테고리별)
export interface TechStackGroup {
  category: TechStackCategory;
  displayName: string;
  techs: TechStackMetadata[];
  count: number;
}

// 기술 스택 사용 통계 (프로젝트별)
export interface TechStackUsageStats {
  techName: string;
  projectCount: number;
  isPrimary: boolean;
  lastUsed?: string;
}
