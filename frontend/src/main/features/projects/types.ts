// Re-export types from entities layer
export type {
  Project,
  Experience, 
  Education,
  Certification,
  ProjectType,
  ProjectCategory,
  ProjectSource
} from '../../entities';

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