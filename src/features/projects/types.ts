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
  date: string;
  description: string;
  technologies: string[];
}

export interface HistoryPanelState {
  isOpen: boolean;
  selectedYear?: string;
} 