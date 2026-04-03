/**
 * 아티클 카테고리 라벨 (Main·Admin 공유)
 */
export const ARTICLE_CATEGORIES = {
  tutorial: '튜토리얼',
  troubleshooting: '트러블슈팅',
  architecture: '아키텍처',
  insight: '인사이트',
  'sns-posts': 'SNS 포스트',
  'development-timeline': '개발 과정',
} as const;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;
