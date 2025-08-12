import { BaseItem } from '../project';

// 교육 인터페이스
export interface Education extends BaseItem {
  organization: string;
  degree?: string;
  location?: string;
  type: 'education';
  projects?: string[]; // 교육 중 진행한 프로젝트들
}