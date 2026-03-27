import React, { useRef, useEffect, useState } from 'react';
import { Badge } from '@/design-system';
import { ArticleIcon } from '@/design-system/components/Icon/ArticleIcon';
import { ArticleListItem } from '@/main/entities/article';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './ArticleTable.module.css';

export interface ArticleTableProps {
  articles: ArticleListItem[];
  onArticleClick?: (article: ArticleListItem) => void;
}

interface ArticleTableRowProps {
  article: ArticleListItem;
  onRowClick: (article: ArticleListItem) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const ArticleTableRow: React.FC<ArticleTableRowProps> = ({ article, onRowClick }) => {
  const titleRef = useRef<HTMLAnchorElement>(null);
  const [fontSize, setFontSize] = useState<number | undefined>(undefined);

  const categoryLabel = article.category
    ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
    : null;

  useEffect(() => {
    const adjustFontSize = () => {
      if (!titleRef.current) return;

      const titleElement = titleRef.current;
      const container = titleElement.closest('td');
      if (!container) return;

      const containerWidth = container.clientWidth - 32;
      const minFontSize = 0.75;
      const maxFontSize = 1;

      const originalStyles = {
        fontSize: titleElement.style.fontSize,
        whiteSpace: titleElement.style.whiteSpace,
        visibility: titleElement.style.visibility,
        position: titleElement.style.position,
        display: titleElement.style.display,
      };

      titleElement.style.fontSize = `${maxFontSize}rem`;
      titleElement.style.whiteSpace = 'nowrap';
      titleElement.style.visibility = 'hidden';
      titleElement.style.position = 'absolute';
      titleElement.style.display = 'block';
      titleElement.style.width = 'auto';

      const textWidth = titleElement.scrollWidth;

      Object.entries(originalStyles).forEach(([key, value]) => {
        (titleElement.style as any)[key] = value || '';
      });

      let currentFontSize = maxFontSize;
      if (textWidth > containerWidth) {
        const ratio = (containerWidth / textWidth) * 0.95;
        currentFontSize = Math.max(minFontSize, Math.min(maxFontSize, ratio * maxFontSize));
      }

      setFontSize(currentFontSize);
    };

    const timeoutId = setTimeout(adjustFontSize, 10);
    const resizeObserver = new ResizeObserver(adjustFontSize);
    const targetCell = titleRef.current?.closest('td');
    if (targetCell) {
      resizeObserver.observe(targetCell);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [article.title]);

  return (
    <tr key={article.businessId} className={styles.row} onClick={() => onRowClick(article)}>
      <td className={styles.colTitle}>
        <div className={styles.titleWrapper}>
          <a
            ref={titleRef}
            href={`/articles/${article.businessId}`}
            className={styles.titleLink}
            onClick={(e) => {
              e.preventDefault();
              onRowClick(article);
            }}
            style={fontSize ? { fontSize: `${fontSize}rem` } : undefined}
          >
            {article.title}
          </a>
          {article.isFeatured && (
            <div className={styles.featuredBadge} title="추천 글">
              <ArticleIcon type="star" size="sm" />
            </div>
          )}
        </div>
        {(article.seriesTitle || article.seriesOrder) && (
          <div className={styles.seriesInfo}>
            {article.seriesTitle && <span className={styles.seriesTitle}>{article.seriesTitle}</span>}
            {article.seriesOrder !== undefined && <span className={styles.seriesOrder}>#{article.seriesOrder}</span>}
          </div>
        )}
        {article.summary && <div className={styles.summary}>{article.summary}</div>}
      </td>
      <td className={styles.colMeta}>
        <div className={styles.metaContent}>
          {categoryLabel && (
            <Badge variant="primary" size="sm" className={styles.categoryBadge}>
              {categoryLabel}
            </Badge>
          )}
        </div>
      </td>
      <td className={styles.colTags}>
        {article.techStack && article.techStack.length > 0 ? (
          <div className={styles.techStack}>
            {article.techStack.slice(0, 2).map((tech) => (
              <Badge key={tech} variant="outline" size="sm" className={styles.techBadge}>
                {tech}
              </Badge>
            ))}
            {article.techStack.length > 2 && (
              <Badge variant="outline" size="sm">
                +{article.techStack.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className={styles.noTechStack}>-</span>
        )}
      </td>
      <td className={styles.colInfo}>
        <div className={styles.infoContent}>
          <div className={styles.dateInfo}>{formatDate(article.publishedAt)}</div>
          <div className={styles.viewInfo}>
            <ArticleIcon type="view" size="sm" />
            <span>{article.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </td>
    </tr>
  );
};

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
            <th className={styles.colMeta}>카테고리</th>
            <th className={styles.colTags}>기술</th>
            <th className={styles.colInfo}>정보</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <ArticleTableRow key={article.businessId} article={article} onRowClick={handleClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
