/**
 * Project 엔티티 타입 정의
 * Main과 Admin에서 공통으로 사용하는 프로젝트 타입
 */

// 프로젝트 카테고리 타입
export type ProjectCategory = 'BUILD' | 'LAB' | 'MAINTENANCE';

// 프로젝트 상태 타입
export type ProjectStatus = 'completed' | 'in_progress' | 'maintenance';

// 프로젝트 소스 타입
export type ProjectSource = 'github' | 'local' | 'certification';

// 공통 베이스 인터페이스
export interface BaseItem {
  id: string; // 각 영역별 고유 ID (P001, E001 등) 또는 숫자 ID
  title: string;
  description: string;
  technologies: string[];
  startDate: string; // YYYY-MM 형식
  endDate?: string | null; // YYYY-MM 형식, 현재 진행 중이면 null
  metadata?: {
    [key: string]: any;
  };
}

// 프로젝트 인터페이스 (Main과 Admin 통합)
export interface Project extends BaseItem {
  // 기본 정보
  githubUrl?: string;
  liveUrl?: string;
  readme: string;
  imageUrl: string;
  source: ProjectSource;
  type: ProjectCategory;
  status?: ProjectStatus | string; // 프로젝트 상태
  sortOrder?: number; // 정렬 순서
  
  // 자격증 전용 필드들
  issuer?: string;
  externalUrl?: string;
  
  // 팀/기여 관련 필드
  isTeam: boolean; // 팀 프로젝트 여부
  myContributions?: string[]; // 내가 맡은 역할/기여
  teamSize?: number; // 팀원 수(선택)
  role?: string; // 내 역할(선택)
  screenshots?: string[] | ProjectScreenshot[]; // 추가 스크린샷 URL 배열
  
  // 타임스탬프
  createdAt?: string;
  updatedAt?: string;
}

// 프로젝트 스크린샷 인터페이스
export interface ProjectScreenshot {
  id: number;
  imageUrl: string;
  cloudinaryPublicId?: string;
  displayOrder: number;
}

// 프로젝트 상세 정보 (Main에서 사용)
export interface ProjectDetail extends Project {
  // 추가 상세 정보가 필요한 경우 확장
}

// 프로젝트 생성 요청 (Admin)
export interface ProjectCreateRequest {
  title: string;
  description: string;
  readme?: string;
  type: ProjectCategory;
  status: ProjectStatus;
  isTeam?: boolean;
  teamSize?: number;
  role?: string;
  myContributions?: string[];
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  screenshots?: string[];
  githubUrl?: string;
  liveUrl?: string;
  externalUrl?: string;
  technologies: string[];
  sortOrder?: number;
}

// 프로젝트 수정 요청 (Admin)
export interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {}

// 프로젝트 필터 (Admin)
export interface ProjectFilter {
  search?: string;
  isTeam?: 'all' | 'team' | 'individual';
  projectType?: 'all' | ProjectCategory;
  status?: 'all' | ProjectStatus;
  techs?: string[];
  sortBy?: 'startDate' | 'endDate' | 'title' | 'status' | 'sortOrder' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

// 프로젝트 목록 조회 파라미터 (Main)
export interface ProjectListParams {
  type?: 'project' | 'certification';
  source?: ProjectSource;
  isTeam?: boolean;
}

