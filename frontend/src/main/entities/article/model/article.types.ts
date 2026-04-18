/**
 * 아티클 (Public)
 */
export interface ArticleListItem {
  businessId: string;
  title: string;
  summary?: string;
  category?: string;
  projectId?: string; // 프로젝트 businessId
  seriesId?: string;
  seriesTitle?: string; // 시리즈 제목
  seriesOrder?: number; // 시리즈 순서
  tags: string[];
  techStack?: string[]; // 기술스택
  publishedAt?: string;
  viewCount: number;
  isFeatured?: boolean; // 추천 아티클 여부
}

export interface ArticleRelatedTechnicalCard {
  id: string;
  title: string;
  category: string;
  problemStatement: string;
  analysis?: string;
  solution: string;
  isPinned?: boolean;
  sortOrder?: number;
}

export interface ArticleDetail {
  businessId: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags: string[];
  techStack: string[];
  publishedAt?: string;
  updatedAt?: string;
  viewCount: number;
  seriesId?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  project?: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    isTeam: boolean;
    isFeatured?: boolean;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    githubUrl?: string;
    liveUrl?: string;
  };
  technicalCards?: ArticleRelatedTechnicalCard[];
}
