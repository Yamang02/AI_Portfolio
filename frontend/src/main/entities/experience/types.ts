import { BaseItem } from '../project';

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