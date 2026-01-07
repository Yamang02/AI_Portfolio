import React from 'react';
import { Card } from './Card';
import styles from './EmptyCard.module.css';

export interface EmptyCardProps {
  message?: string;
  className?: string;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({
  message = '등록된 프로젝트가 없습니다',
  className,
}) => {
  return (
    <Card
      variant="default"
      padding="none"
      className={`${styles.emptyCard} ${styles.noCardHover} ${className || ''}`}
    >
      {/* 상단 이미지/아이콘 영역 */}
      <div className={styles.imageContainer}>
        <div className={styles.iconContainer}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.icon}
          >
            <path
              d="M9 12h6M9 16h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 본문 */}
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
    </Card>
  );
};
