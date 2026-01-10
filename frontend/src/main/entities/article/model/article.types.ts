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
  tags: string[];
  techStack?: string[]; // 기술스택
  publishedAt?: string;
  viewCount: number;
  isFeatured?: boolean; // 추천 아티클 여부
}

export interface ArticleDetail {
  businessId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  techStack: string[];
  publishedAt?: string;
  viewCount: number;
}
