import React from 'react';
import { Card, Badge } from '@/design-system';
import { ArticleListItem } from '@/main/entities/article';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './ArticleCard.module.css';

export interface ArticleCardProps {
  article: ArticleListItem;
  onClick?: () => void;
  className?: string;
}

/**
 * 아티클 카드 컴포넌트 (갤러리 뷰용)
 */
export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  className,
}) => {
  const categoryLabel = article.category
    ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
    : null;

  return (
    <Card
      variant="elevated"
      padding="md"
      className={`${styles.card} ${onClick ? styles.clickable : ''} ${className || ''}`}
      onClick={onClick}
    >
      <div className={styles.header}>
        {categoryLabel && (
          <Badge variant="outline" size="sm" className={styles.category}>
            {categoryLabel}
          </Badge>
        )}
        <span className={styles.viewCount}>조회 {article.viewCount}</span>
      </div>

      <h3 className={styles.title}>
        {article.title}
      </h3>

      {article.summary && (
        <p className={styles.summary}>{article.summary}</p>
      )}

      <div className={styles.footer}>
        {article.publishedAt && (
          <span className={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString('ko-KR')}
          </span>
        )}
        {article.tags.length > 0 && (
          <div className={styles.tags}>
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
            {article.tags.length > 3 && (
              <Badge variant="outline" size="sm">
                +{article.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
