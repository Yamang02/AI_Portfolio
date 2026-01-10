/**
 * 아티클 타입
 */
export interface Article {
  id: number;
  businessId: string;
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags: string[];
  techStack: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  sortOrder: number;
  viewCount: number;
  isFeatured: boolean;
  seriesId?: string;
  seriesTitle?: string;
  seriesOrder?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 아티클 생성 요청
 */
export interface CreateArticleRequest {
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags?: string[];
  techStack?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 아티클 업데이트 요청
 */
export interface UpdateArticleRequest {
  title: string;
  summary?: string;
  content: string;
  projectId?: number;
  category?: string;
  tags?: string[];
  techStack?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  seriesId?: string;
  seriesOrder?: number;
}

/**
 * 카테고리 옵션
 */
export const ARTICLE_CATEGORIES = {
  tutorial: '튜토리얼',
  troubleshooting: '트러블슈팅',
  architecture: '아키텍처',
  insight: '인사이트',
  'development-timeline': '개발 과정',
} as const;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;
