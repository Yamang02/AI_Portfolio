import React from 'react';
import { Button } from '@/design-system';
import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  className?: string;
}

/**
 * 페이지네이션 컴포넌트
 * 이전/다음 버튼과 페이지 정보를 표시
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className,
}) => {
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

  return (
    <nav className={`${styles.pagination} ${className || ''}`}>
      <div className={styles.buttonGroup}>
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrevClick}
          disabled={currentPage === 1}
          ariaLabel="이전 페이지"
        >
          이전
        </Button>
        
        {showPageInfo && (
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
        )}
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNextClick}
          disabled={currentPage >= totalPages}
          ariaLabel="다음 페이지"
        >
          다음
        </Button>
      </div>
    </nav>
  );
};
