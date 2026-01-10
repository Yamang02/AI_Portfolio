import React from 'react';
import { Badge } from '@/design-system';
import { ArticleListItem } from '@/main/entities/article';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './ArticleTable.module.css';

export interface ArticleTableProps {
  articles: ArticleListItem[];
  onArticleClick?: (article: ArticleListItem) => void;
}

/**
 * 아티클 테이블 컴포넌트 (테이블 뷰용)
 */
export const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  onArticleClick,
}) => {
  const handleClick = (article: ArticleListItem) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  return (
    <div className={styles.table}>
      <table className={styles.tableElement}>
        <thead>
          <tr>
            <th className={styles.colTitle}>제목</th>
            <th className={styles.colCategory}>카테고리</th>
            <th className={styles.colTags}>태그</th>
            <th className={styles.colDate}>발행일</th>
            <th className={styles.colViews}>조회수</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => {
            const categoryLabel = article.category
              ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
              : null;

            return (
              <tr
                key={article.businessId}
                className={styles.row}
                onClick={() => handleClick(article)}
              >
                <td className={styles.colTitle}>
                  <a
                    href={`/articles/${article.businessId}`}
                    className={styles.titleLink}
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(article);
                    }}
                  >
                    {article.title}
                  </a>
                  {article.summary && (
                    <div className={styles.summary}>{article.summary}</div>
                  )}
                </td>
                <td className={styles.colCategory}>
                  {categoryLabel && (
                    <Badge variant="outline" size="sm">
                      {categoryLabel}
                    </Badge>
                  )}
                </td>
                <td className={styles.colTags}>
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
                </td>
                <td className={styles.colDate}>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('ko-KR')
                    : '-'}
                </td>
                <td className={styles.colViews}>{article.viewCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
