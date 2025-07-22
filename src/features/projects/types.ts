// 공통 베이스 인터페이스
export interface BaseItem {
  id: string; // 각 영역별 고유 ID (P001, E001 등)
  title: string;
  description: string;
  technologies: string[];
  startDate: string; // YYYY-MM 형식
  endDate?: string; // YYYY-MM 형식, 현재 진행 중이면 undefined
  metadata?: {
    [key: string]: any;
  };
}

// 프로젝트 인터페이스 (GitHub + 로컬 + 자격증 통합)
export interface Project extends BaseItem {
  githubUrl?: string;
  liveUrl?: string;
  readme: string;
  imageUrl: string;
  source: 'github' | 'local' | 'certification';
  type: 'project' | 'certification';
  // 자격증 전용 필드들
  issuer?: string;
}

// 경력 인터페이스
export interface Experience extends BaseItem {
  organization: string;
  role?: string;
  location?: string;
  type: 'career';
  mainResponsibilities?: string[]; // 주요 담당 업무 목록
  achievements?: string[]; // 주요 성과/업적 목록
  projects?: string[]; // 담당했던 주요 프로젝트명들
}

// 교육 인터페이스
export interface Education extends BaseItem {
  organization: string;
  degree?: string;
  location?: string;
  type: 'education';
  projects?: string[]; // 교육 중 진행한 프로젝트들
}

// 자격증 인터페이스
export interface Certification {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  issuer: string;
  startDate: string;
}

// 기존 호환성을 위한 타입들
export type ProjectType = 'project' | 'experience' | 'certification';
export type ProjectSource = 'github' | 'local' | 'experience' | 'certification';

// 히스토리 패널 관련 타입
export interface HistoryItem {
  id: string;
  title: string;
  type: ProjectType;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  isHighlighted?: boolean;
}

export interface HistoryPanelState {
  isOpen: boolean;
  selectedYear?: string;
  highlightedItemId?: string;
} 