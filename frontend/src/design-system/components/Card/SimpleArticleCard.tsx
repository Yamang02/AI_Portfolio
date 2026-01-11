import React from 'react';
import { Card } from './Card';
import styles from './SimpleArticleCard.module.css';

export interface SimpleArticleCardArticle {
  businessId: string;
  title: string;
  summary?: string;
  publishedAt?: string;
}

export interface SimpleArticleCardProps {
  article: SimpleArticleCardArticle;
  onClick?: () => void;
  className?: string;
}

export const SimpleArticleCard: React.FC<SimpleArticleCardProps> = ({
  article,
  onClick,
  className,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      console.error('formatDate: Error formatting date', error);
      return '';
    }
  };

  return (
    <Card
      variant="default"
      padding="md"
      onClick={onClick}
      className={`${styles.simpleArticleCard} ${onClick ? styles.clickable : ''} ${className || ''}`}
    >
      {/* Title */}
      <h3 className={styles.title} title={article.title}>
        {article.title}
      </h3>

      {/* Summary */}
      {article.summary && (
        <p className={styles.summary}>{article.summary}</p>
      )}

      {/* 발행일 */}
      {article.publishedAt && (
        <div className={styles.date}>
          <span className={styles.dateText}>{formatDate(article.publishedAt)}</span>
        </div>
      )}
    </Card>
  );
};
