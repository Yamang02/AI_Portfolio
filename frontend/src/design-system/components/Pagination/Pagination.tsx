import React, { useMemo } from 'react';
import { Button } from '@/design-system';
import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
}

/**
 * 페이지네이션 컴포넌트
 * 처음/끝 페이지 버튼과 둥근 페이지 번호 버튼들을 포함
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className,
}) => {
  // 표시할 페이지 번호들 계산
  const visiblePages = useMemo(() => {
    if (totalPages <= 0) return [];
    if (totalPages === 1) return [1];
    
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 항상 첫 페이지 표시
      pages.push(1);
      
      // 현재 페이지 주변 계산
      const halfVisible = Math.floor((maxVisiblePages - 2) / 2); // 첫/마지막 제외
      let start = Math.max(2, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);
      
      // 범위 조정: 시작이 너무 앞이면 끝을 늘림
      if (start === 2) {
        end = Math.min(totalPages - 1, start + (maxVisiblePages - 3));
      }
      // 끝이 너무 뒤면 시작을 앞당김
      if (end === totalPages - 1) {
        start = Math.max(2, end - (maxVisiblePages - 3));
      }
      
      // 시작 부분 ellipsis
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // 끝 부분 ellipsis
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // 항상 마지막 페이지 표시
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  const handleFirstClick = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastClick = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  // totalPages가 0 이하면 표시하지 않음
  if (totalPages <= 0) {
    return null;
  }

  return (
    <nav className={`${styles.pagination} ${className || ''}`}>
      <div className={styles.navigationGroup}>
        {/* 처음 페이지 버튼 */}
        <Button
          variant="icon"
          size="sm"
          onClick={handleFirstClick}
          disabled={currentPage === 1 || totalPages <= 1}
          ariaLabel="첫 페이지"
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
            <path d="M11 18l-6-6 6-6M18 18l-6-6 6-6" />
          </svg>
        </Button>

        {/* 이전 페이지 버튼 */}
        <Button
          variant="icon"
          size="sm"
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          ariaLabel="이전 페이지"
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
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>

        {/* 페이지 번호 버튼들 */}
        {visiblePages.length > 0 && (
          <div className={styles.pageButtons}>
            {visiblePages.map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                    ...
                  </span>
                );
              }
              
              const isActive = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handlePageClick(page)}
                  className={styles.pageButton}
                  ariaLabel={`${page}페이지`}
                  ariaCurrent={isActive ? 'page' : undefined}
                >
                  {page}
                </Button>
              );
            })}
          </div>
        )}

        {/* 다음 페이지 버튼 */}
        <Button
          variant="icon"
          size="sm"
          onClick={handleNextClick}
          disabled={currentPage >= totalPages}
          ariaLabel="다음 페이지"
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
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>

        {/* 마지막 페이지 버튼 */}
        <Button
          variant="icon"
          size="sm"
          onClick={handleLastClick}
          disabled={currentPage >= totalPages || totalPages <= 1}
          ariaLabel="마지막 페이지"
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
            <path d="M13 18l6-6-6-6M6 18l6-6-6-6" />
          </svg>
        </Button>
      </div>
    </nav>
  );
};
