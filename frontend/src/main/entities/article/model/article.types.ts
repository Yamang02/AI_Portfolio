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
  publishedAt?: string;
  viewCount: number;
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
