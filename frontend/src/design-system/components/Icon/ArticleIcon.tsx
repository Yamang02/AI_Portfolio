import React from 'react';
import styles from './ArticleIcon.module.css';

export type ArticleIconType = 'view' | 'calendar' | 'star';

export type ArticleIconSize = 'sm' | 'md' | 'lg';

export interface ArticleIconProps {
  type: ArticleIconType;
  size?: ArticleIconSize;
  className?: string;
}

export const ArticleIcon: React.FC<ArticleIconProps> = ({
  type,
  size = 'md',
  className,
}) => {
  const classNames = [styles.icon, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const getIcon = () => {
    switch (type) {
      case 'view':
        return (
          <svg
            className={styles.svg}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case 'calendar':
        return (
          <svg
            className={styles.svg}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'star':
        return (
          <svg
            className={styles.svg}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return <div className={classNames}>{getIcon()}</div>;
};
