import React from 'react';
import { Badge, SectionTitle } from '@/design-system';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './CategoryFilterBar.module.css';

export interface CategoryFilterBarProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string | undefined) => void;
  articleCounts?: Record<string, number>;
}

/**
 * 카테고리 필터 바 컴포넌트
 */
export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  onCategorySelect,
  articleCounts = {},
}) => {
  const handleCategoryClick = (category: string | undefined) => {
    if (onCategorySelect) {
      onCategorySelect(category === selectedCategory ? undefined : category);
    }
  };

  // 전체 개수 계산
  const totalCount = Object.values(articleCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={styles.filterBar}>
      <SectionTitle level="h3" className={styles.title}>
        카테고리
      </SectionTitle>
      
      <div className={styles.categories}>
        <Badge
          variant={selectedCategory === undefined ? 'primary' : 'outline'}
          size="md"
          onClick={() => handleCategoryClick(undefined)}
          selected={selectedCategory === undefined}
          showCount={true}
          count={totalCount}
          className={styles.categoryBadge}
        >
          전체
        </Badge>

        {Object.entries(ARTICLE_CATEGORIES).map(([key, label]) => {
          const count = articleCounts[key] || 0;
          const isSelected = selectedCategory === key;

          return (
            <Badge
              key={key}
              variant={isSelected ? 'primary' : 'outline'}
              size="md"
              onClick={() => handleCategoryClick(key)}
              selected={isSelected}
              showCount={true}
              count={count}
              className={styles.categoryBadge}
            >
              {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
