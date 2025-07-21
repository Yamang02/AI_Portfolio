export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  readme: string;
  imageUrl: string;
  type: 'project' | 'experience';
  source: 'github' | 'local' | 'experience';
  startDate: string; // YYYY-MM 형식
  endDate?: string; // YYYY-MM 형식, 현재 진행 중이면 undefined
  metadata?: {
    [key: string]: any;
  };
}

export type ProjectType = 'project' | 'experience';
export type ProjectSource = 'github' | 'local' | 'experience';

// 히스토리 패널 관련 타입
export interface HistoryItem {
  id: number;
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
  highlightedItemId?: number;
} 