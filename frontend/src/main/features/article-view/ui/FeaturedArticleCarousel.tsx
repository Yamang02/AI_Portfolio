import React from 'react';
import { FeaturedArticleCard } from '@/design-system';
import { ArticleListItem } from '../../entities/article';
import styles from './FeaturedArticleCarousel.module.css';

export interface FeaturedArticleCarouselProps {
  articles: ArticleListItem[];
  onArticleClick?: (article: ArticleListItem) => void;
  className?: string;
}

/**
 * 추천 아티클 캐러셀 컴포넌트 (가로 스크롤)
 */
export const FeaturedArticleCarousel: React.FC<FeaturedArticleCarouselProps> = ({
  articles,
  onArticleClick,
  className,
}) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  const handleArticleClick = (article: ArticleListItem) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  return (
    <section className={`${styles.carouselSection} ${className || ''}`}>
      <div className={styles.carouselContainer}>
        <div className={styles.carousel}>
          {articles.map((article) => (
            <div key={article.businessId} className={styles.cardWrapper}>
              <FeaturedArticleCard
                article={{
                  businessId: article.businessId,
                  title: article.title,
                  category: article.category,
                  seriesId: article.seriesId,
                  seriesTitle: article.seriesTitle,
                  isFeatured: article.isFeatured,
                }}
                onClick={() => handleArticleClick(article)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
