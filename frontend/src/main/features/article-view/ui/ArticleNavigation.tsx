import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@/design-system';
import styles from './ArticleNavigation.module.css';

export interface ArticleNavigationProps {
  articles: Array<{ businessId: string; title: string }>;
  currentArticleId: string;
  onNavigate?: (articleId: string) => void;
}

/**
 * 아티클 네비게이션 컴포넌트 (프로젝트 상세페이지 형식 참고)
 */
export const ArticleNavigation: React.FC<ArticleNavigationProps> = ({
  articles,
  currentArticleId,
  onNavigate,
}) => {
  const navigate = useNavigate();

  // 현재 아티클의 인덱스와 이전/다음 아티클 찾기
  const { prevArticle, nextArticle } = useMemo(() => {
    const currentIndex = articles.findIndex(a => a.businessId === currentArticleId);
    
    if (currentIndex === -1) {
      return { prevArticle: null, nextArticle: null };
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : articles.length - 1;
    const nextIndex = currentIndex < articles.length - 1 ? currentIndex + 1 : 0;

    return {
      prevArticle: articles[prevIndex] || null,
      nextArticle: articles[nextIndex] || null,
    };
  }, [articles, currentArticleId]);

  const handlePrevClick = () => {
    if (prevArticle) {
      if (onNavigate) {
        onNavigate(prevArticle.businessId);
      } else {
        navigate(`/articles/${prevArticle.businessId}`);
      }
    }
  };

  const handleNextClick = () => {
    if (nextArticle) {
      if (onNavigate) {
        onNavigate(nextArticle.businessId);
      } else {
        navigate(`/articles/${nextArticle.businessId}`);
      }
    }
  };

  const handleListClick = () => {
    if (onNavigate) {
      onNavigate('/articles');
    } else {
      navigate('/articles');
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.buttonGroup}>
        {/* 이전 아티클 */}
        <Tooltip content="Previous Article">
          <Button
            variant="icon"
            size="sm"
            onClick={handlePrevClick}
            disabled={!prevArticle}
            ariaLabel="Previous Article"
            className={styles.navButton}
          >
            &lt;
          </Button>
        </Tooltip>

        {/* 아티클 목록 */}
        <Tooltip content="Article List">
          <Button
            variant="icon"
            size="sm"
            onClick={handleListClick}
            ariaLabel="Article List"
            className={styles.navButton}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </Button>
        </Tooltip>

        {/* 다음 아티클 */}
        <Tooltip content="Next Article">
          <Button
            variant="icon"
            size="sm"
            onClick={handleNextClick}
            disabled={!nextArticle}
            ariaLabel="Next Article"
            className={styles.navButton}
          >
            &gt;
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
};
