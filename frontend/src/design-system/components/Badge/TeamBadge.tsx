import React from 'react';
import styles from './TeamBadge.module.css';

export type TeamBadgeSize = 'sm' | 'md' | 'lg';

export interface TeamBadgeProps {
  isTeam: boolean;
  size?: TeamBadgeSize;
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  isTeam,
  size = 'md',
  className,
}) => {
  const classNames = [
    styles.badge,
    styles[size],
    isTeam ? styles.team : styles.individual,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className={styles.icon}>
        {isTeam ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        ) : (
          <svg
            className={styles.svg}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>
      <span className={styles.text}>{isTeam ? '팀' : '개인'}</span>
    </div>
  );
};
