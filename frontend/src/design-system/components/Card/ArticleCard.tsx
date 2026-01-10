import React from 'react';
import { Card } from './Card';
import { Badge } from '../Badge/Badge';
import { ArticleIcon } from '../Icon/ArticleIcon';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import { safeFormatDate } from '@shared/utils/safeStringUtils';
import styles from './ArticleCard.module.css';

export interface ArticleCardArticle {
  businessId: string;
  title: string;
  summary?: string;
  category?: string;
  seriesId?: string;
  seriesTitle?: string;
  tags: string[];
  techStack?: string[];
  publishedAt?: string;
  viewCount: number;
  isFeatured?: boolean;
}

export interface ArticleCardProps {
  article: ArticleCardArticle;
  onClick?: () => void;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  className,
}) => {
  const categoryLabel = article.category
    ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
    : null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    // 프로젝트 카드와 동일한 형식 (YYYY.MM)
    return safeFormatDate(dateString);
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Card
      variant="default"
      padding="md"
      onClick={onClick}
      className={`${styles.articleCard} ${styles.noCardHover} ${onClick ? styles.clickable : ''} ${className || ''}`}
    >
      {/* 헤더 배지 영역 (type, 시리즈, 별 배지) */}
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

      {/* Summary 영역 */}
      {article.summary && (
        <p className={styles.summary}>{article.summary}</p>
      )}

      {/* 기술스택 영역 (summary 아래) */}
      {article.techStack && article.techStack.length > 0 && (
        <div className={styles.techStack}>
          {article.techStack.slice(0, 4).map((tech, index) => (
            <Badge
              key={`${tech}-${index}`}
              variant="default"
              size="sm"
              className={styles.techBadge}
            >
              {tech}
            </Badge>
          ))}
          {article.techStack.length > 4 && (
            <Badge variant="outline" size="sm" className={styles.techBadge}>
              +{article.techStack.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* 하단 영역 (발행일 텍스트 + view 배지) */}
      <div className={styles.footer}>
        {article.publishedAt && (
          <span className={styles.dateText}>{formatDate(article.publishedAt)}</span>
        )}
        {article.viewCount > 0 && (
          <Badge variant="outline" size="sm" className={styles.viewBadge}>
            <ArticleIcon type="view" size="sm" />
            <span className={styles.badgeText}>{formatViewCount(article.viewCount)}</span>
          </Badge>
        )}
      </div>
    </Card>
  );
};
