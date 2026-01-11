import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@design-system/components/Button';
import { Tooltip } from '@design-system/components/Tooltip';
import styles from './ArticleNavigation.module.css';

export interface ArticleNavigationProps {
  articles: Array<{ businessId: string; title: string }>;
  currentArticleBusinessId: string;
  onNavigate?: (businessId: string) => void;
}

export const ArticleNavigation: React.FC<ArticleNavigationProps> = ({
  articles,
  currentArticleBusinessId,
  onNavigate,
}) => {
  const navigate = useNavigate();

  // 현재 아티클의 인덱스와 이전/다음 아티클 찾기
  const { prevArticle, nextArticle } = useMemo(() => {
    const currentIndex = articles.findIndex(a => a.businessId === currentArticleBusinessId);
    
    if (currentIndex === -1) {
      return { prevArticle: null, nextArticle: null };
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : articles.length - 1;
    const nextIndex = currentIndex < articles.length - 1 ? currentIndex + 1 : 0;

    return {
      prevArticle: articles[prevIndex] || null,
      nextArticle: articles[nextIndex] || null,
    };
  }, [articles, currentArticleBusinessId]);

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
          >
            &gt;
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
};
