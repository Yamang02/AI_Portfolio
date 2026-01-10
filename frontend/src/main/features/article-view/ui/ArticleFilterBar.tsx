import React, { useState } from 'react';
import { Button, SectionTitle } from '@/design-system';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './ArticleFilterBar.module.css';

export interface ArticleFilterBarProps {
  selectedCategory?: string;
  selectedProjectId?: number; // 필터용 임시 ID (프로젝트 인덱스)
  selectedSeriesId?: string;
  onCategorySelect?: (category: string | undefined) => void;
  onProjectSelect?: (projectId: number | undefined) => void; // 필터용 임시 ID 전달
  onSeriesSelect?: (seriesId: string | undefined) => void;
  projects?: Array<{ id: number; businessId: string; title: string }>;
  series?: Array<{ id: string; title: string }>;
  articleCounts?: {
    categories?: Record<string, number>;
    projects?: Record<number, number>;
    series?: Record<string, number>;
  };
}

/**
 * 아티클 필터 바 컴포넌트 (프로젝트/시리즈/카테고리)
 */
export const ArticleFilterBar: React.FC<ArticleFilterBarProps> = ({
  selectedCategory,
  selectedProjectId,
  selectedSeriesId,
  onCategorySelect,
  onProjectSelect,
  onSeriesSelect,
  projects = [],
  series = [],
  articleCounts = {},
}) => {
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [isSeriesExpanded, setIsSeriesExpanded] = useState(true);

  const handleCategoryClick = (category: string | undefined) => {
    if (onCategorySelect) {
      onCategorySelect(category === selectedCategory ? undefined : category);
    }
  };

  const handleProjectClick = (projectId: number | undefined) => {
    if (onProjectSelect) {
      onProjectSelect(projectId === selectedProjectId ? undefined : projectId);
    }
  };

  const handleSeriesClick = (seriesId: string | undefined) => {
    if (onSeriesSelect) {
      onSeriesSelect(seriesId === selectedSeriesId ? undefined : seriesId);
    }
  };

  const totalCount = Object.values(articleCounts.categories || {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className={styles.filterBar}>
      {/* 카테고리 필터 */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <SectionTitle level="h3" className={styles.title}>
            카테고리
          </SectionTitle>
          <Button
            variant="icon"
            size="sm"
            onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
            ariaLabel={isCategoryExpanded ? '축소' : '확대'}
            className={styles.expandButton}
          >
            {isCategoryExpanded ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
          </Button>
        </div>
        {isCategoryExpanded && (
          <div className={styles.buttonGroup}>
          <Button
            variant={selectedCategory === undefined ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleCategoryClick(undefined)}
            className={styles.filterButton}
          >
            <span className={styles.filterButtonText}>전체</span>
            {totalCount > 0 && (
              <span className={styles.filterBadge}>{totalCount}</span>
            )}
          </Button>
          {Object.entries(ARTICLE_CATEGORIES).map(([key, label]) => {
            const count = articleCounts.categories?.[key] || 0;
            const isSelected = selectedCategory === key;
            return (
              <Button
                key={key}
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleCategoryClick(key)}
                className={styles.filterButton}
              >
                <span className={styles.filterButtonText}>{label}</span>
                {count > 0 && (
                  <span className={styles.filterBadge}>{count}</span>
                )}
              </Button>
            );
          }          )}
          </div>
        )}
      </div>

      {/* 프로젝트 필터 */}
      {projects.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.sectionHeader}>
            <SectionTitle level="h3" className={styles.title}>
              프로젝트
            </SectionTitle>
            <Button
              variant="icon"
              size="sm"
              onClick={() => setIsProjectExpanded(!isProjectExpanded)}
              ariaLabel={isProjectExpanded ? '축소' : '확대'}
              className={styles.expandButton}
            >
              {isProjectExpanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </Button>
          </div>
          {isProjectExpanded && (
            <div className={styles.buttonGroup}>
            <Button
              variant={selectedProjectId === undefined ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleProjectClick(undefined)}
              className={styles.filterButton}
            >
              전체
            </Button>
            {projects.map((project) => {
              const count = articleCounts.projects?.[project.id] || 0;
              const isSelected = selectedProjectId === project.id;
              return (
                <Button
                  key={project.id}
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleProjectClick(project.id)}
                  className={styles.filterButton}
                >
                  <span className={styles.filterButtonText}>{project.title}</span>
                  {count > 0 && (
                    <span className={styles.filterBadge}>{count}</span>
                  )}
                </Button>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* 시리즈 필터 */}
      {series.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.sectionHeader}>
            <SectionTitle level="h3" className={styles.title}>
              시리즈
            </SectionTitle>
            <Button
              variant="icon"
              size="sm"
              onClick={() => setIsSeriesExpanded(!isSeriesExpanded)}
              ariaLabel={isSeriesExpanded ? '축소' : '확대'}
              className={styles.expandButton}
            >
              {isSeriesExpanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </Button>
          </div>
          {isSeriesExpanded && (
            <div className={styles.buttonGroup}>
            <Button
              variant={selectedSeriesId === undefined ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleSeriesClick(undefined)}
              className={styles.filterButton}
            >
              전체
            </Button>
            {series.map((s) => {
              const count = articleCounts.series?.[s.id] || 0;
              const isSelected = selectedSeriesId === s.id;
              return (
                <Button
                  key={s.id}
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleSeriesClick(s.id)}
                  className={styles.filterButton}
                >
                  <span className={styles.filterButtonText}>{s.title}</span>
                  {count > 0 && (
                    <span className={styles.filterBadge}>{count}</span>
                  )}
                </Button>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
