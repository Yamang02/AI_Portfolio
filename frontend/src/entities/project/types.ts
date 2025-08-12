// 공통 베이스 인터페이스
export interface BaseItem {
  id: string; // 각 영역별 고유 ID (P001, E001 등)
  title: string;
  description: string;
  technologies: string[];
  startDate: string; // YYYY-MM 형식
  endDate?: string | null; // YYYY-MM 형식, 현재 진행 중이면 null
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
  externalUrl?: string;
  // === [추가] 팀/기여 관련 필드 ===
  isTeam: boolean; // 팀 프로젝트 여부
  myContributions?: string[]; // 내가 맡은 역할/기여
  teamSize?: number; // 팀원 수(선택)
  role?: string; // 내 역할(선택)
}