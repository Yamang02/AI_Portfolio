import React from 'react';
import { Card } from './Card';
import { Badge } from '../Badge/Badge';
import { ArticleIcon } from '../Icon/ArticleIcon';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './FeaturedArticleCard.module.css';

export interface FeaturedArticleCardArticle {
  businessId: string;
  title: string;
  category?: string;
  seriesId?: string;
  seriesTitle?: string;
  isFeatured?: boolean;
}

export interface FeaturedArticleCardProps {
  article: FeaturedArticleCardArticle;
  onClick?: () => void;
  className?: string;
}

/**
 * 추천 아티클 카드 컴포넌트 (간소화 버전)
 * 타이틀, 아티클 타입 배지, 시리즈 배지, 별 배지 표시
 */
export const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({
  article,
  onClick,
  className,
}) => {
  const categoryLabel = article.category
    ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
    : null;

  return (
    <Card
      variant="default"
      padding="md"
      onClick={onClick}
      className={`${styles.featuredArticleCard} ${onClick ? styles.clickable : ''} ${className || ''}`}
    >
      {/* 배지 영역 (타입, 시리즈, 별 배지) */}
      <div className={styles.badgeArea}>
        <div className={styles.badgeLeft}>
          {categoryLabel && (
            <Badge variant="primary" size="sm" className={styles.categoryBadge}>
              {categoryLabel}
            </Badge>
          )}
          {article.seriesId && (
            <Badge variant="default" size="sm" className={styles.seriesBadge}>
              {article.seriesTitle || '시리즈'}
            </Badge>
          )}
        </div>
        <div className={styles.badgeRight}>
          {article.isFeatured && (
            <Badge variant="accent" size="sm" className={styles.featuredBadge} title="추천 아티클">
              <ArticleIcon type="star" size="sm" />
            </Badge>
          )}
        </div>
      </div>

      {/* Title 영역 */}
      <h3 className={styles.title}>{article.title}</h3>
    </Card>
  );
};
