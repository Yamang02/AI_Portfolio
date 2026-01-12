import React from 'react';
import { Skeleton } from './Skeleton';
import { Spinner } from '../Spinner/Spinner';
import styles from './SkeletonCard.module.css';

export interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
  isLoading?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
  lines = 3,
  isLoading = true,
}) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      {showImage && (
        <div className={styles.image}>
          <Skeleton variant="rectangular" height="100%" />
        </div>
      )}
      
      <div className={styles.content}>
        {showTitle && (
          <div className={styles.title}>
            <Skeleton variant="text" height="24px" width="60%" />
          </div>
        )}
        
        {showDescription && (
          <div className={styles.description}>
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                height="16px"
                width={index === lines - 1 ? '40%' : '100%'}
                className={styles.line}
              />
            ))}
          </div>
        )}
        
        {showActions && (
          <div className={styles.actions}>
            <Skeleton variant="rectangular" height="32px" width="80px" />
            <Skeleton variant="rectangular" height="32px" width="60px" />
          </div>
        )}
      </div>

      {/* 로딩 스피너 오버레이 */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
};
