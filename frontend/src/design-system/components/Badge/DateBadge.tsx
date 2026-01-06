import React from 'react';
import { formatDateRange as formatDateRangeUtil } from '@shared/lib/string/stringUtils';
import styles from './DateBadge.module.css';

export type DateBadgeSize = 'sm' | 'md' | 'lg';

export interface DateBadgeProps {
  startDate: string;
  endDate?: string | null;
  size?: DateBadgeSize;
  className?: string;
}

export const DateBadge: React.FC<DateBadgeProps> = ({
  startDate,
  endDate,
  size = 'md',
  className,
}) => {
  const dateRangeText = formatDateRangeUtil(startDate, endDate);

  const classNames = [
    styles.badge,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className={styles.icon}>
        <svg
          className={styles.svg}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <span className={styles.text}>{dateRangeText}</span>
    </div>
  );
};
