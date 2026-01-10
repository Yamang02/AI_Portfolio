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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // ArticleTableRow 컴포넌트 (title 폰트 크기 자동 조정 포함)
  const ArticleTableRow: React.FC<{ article: ArticleListItem; onRowClick: (article: ArticleListItem) => void }> = ({ article, onRowClick }) => {
    const titleRef = useRef<HTMLAnchorElement>(null);
    const [fontSize, setFontSize] = useState<number | undefined>(undefined);

    const categoryLabel = article.category
      ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
      : null;

    // 제목 글자 크기 자동 조정 (한 줄로 제한)
    useEffect(() => {
      const adjustFontSize = () => {
        if (!titleRef.current) return;

        const titleElement = titleRef.current;
        const container = titleElement.closest('td');
        if (!container) return;

        const containerWidth = container.clientWidth - 32; // padding 양쪽 고려
        const minFontSize = 0.75; // 12px
        const maxFontSize = 1; // 16px (var(--font-size-base))

        // 임시 스타일로 실제 너비 측정
        const originalStyles = {
          fontSize: titleElement.style.fontSize,
          whiteSpace: titleElement.style.whiteSpace,
          visibility: titleElement.style.visibility,
          position: titleElement.style.position,
          display: titleElement.style.display,
        };

        // 측정을 위한 임시 스타일
        titleElement.style.fontSize = `${maxFontSize}rem`;
        titleElement.style.whiteSpace = 'nowrap';
        titleElement.style.visibility = 'hidden';
        titleElement.style.position = 'absolute';
        titleElement.style.display = 'block';
        titleElement.style.width = 'auto';

        const textWidth = titleElement.scrollWidth;

        // 원래 스타일 복원
        Object.entries(originalStyles).forEach(([key, value]) => {
          (titleElement.style as any)[key] = value || '';
        });

        let currentFontSize = maxFontSize;

        // 텍스트가 컨테이너보다 크면 크기 조정
        if (textWidth > containerWidth) {
          // 여유 공간을 고려하여 조금 더 작게 조정
          const ratio = (containerWidth / textWidth) * 0.95; // 5% 여유 공간
          currentFontSize = ratio * maxFontSize;
          currentFontSize = Math.max(minFontSize, Math.min(maxFontSize, currentFontSize));
        }

        setFontSize(currentFontSize);
      };

      // 초기 조정 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행)
      const timeoutId = setTimeout(adjustFontSize, 10);

      // 리사이즈 이벤트 리스너
      const resizeObserver = new ResizeObserver(() => {
        adjustFontSize();
      });

      if (titleRef.current?.closest('td')) {
        resizeObserver.observe(titleRef.current.closest('td')!);
      }

      return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
      };
    }, [article.title]);

    return (
      <tr
        key={article.businessId}
        className={styles.row}
        onClick={() => onRowClick(article)}
      >
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
              <div className={styles.featuredBadge} title="추천 아티클">
                <ArticleIcon type="star" size="sm" />
              </div>
            )}
          </div>
          {(article.seriesTitle || article.seriesOrder) && (
            <div className={styles.seriesInfo}>
              {article.seriesTitle && (
                <span className={styles.seriesTitle}>
                  {article.seriesTitle}
                </span>
              )}
              {article.seriesOrder !== undefined && (
                <span className={styles.seriesOrder}>
                  #{article.seriesOrder}
                </span>
              )}
            </div>
          )}
          {article.summary && (
            <div className={styles.summary}>{article.summary}</div>
          )}
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
            <div className={styles.dateInfo}>
              {formatDate(article.publishedAt)}
            </div>
            <div className={styles.viewInfo}>
              <ArticleIcon type="view" size="sm" />
              <span>{article.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </td>
      </tr>
    );
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
