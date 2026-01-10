import React, { useRef, useEffect, useState } from 'react';
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<number | undefined>(undefined);

  const categoryLabel = article.category
    ? ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category
    : null;

  // 제목 글자 크기 자동 조정 (한 줄로 제한)
  useEffect(() => {
    const adjustFontSize = () => {
      if (!titleRef.current) return;

      const titleElement = titleRef.current;
      const container = titleElement.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth - 32; // padding 양쪽 고려
      const minFontSize = 0.75; // 12px
      const maxFontSize = 1.125; // 18px (var(--font-size-lg))

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

    if (titleRef.current?.parentElement) {
      resizeObserver.observe(titleRef.current.parentElement);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [article.title]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    // 아티클 카드는 일까지 표시 (YYYY.MM.DD)
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
      <h3
        ref={titleRef}
        className={styles.title}
        title={article.title}
        style={fontSize ? { fontSize: `${fontSize}rem` } : undefined}
      >
        {article.title}
      </h3>

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
