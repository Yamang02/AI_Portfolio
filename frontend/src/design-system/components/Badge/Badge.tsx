import React from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  showCount?: boolean;
  count?: number;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  onClick,
  selected = false,
  showCount = false,
  count,
}) => {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    onClick && styles.clickable,
    selected && styles.selected,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    };

    return (
      <button
        type="button"
        className={classNames}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-pressed={selected}
      >
        <span className={styles.content}>{children}</span>
        {showCount && count !== undefined && (
          <span className={styles.count}>{count}</span>
        )}
      </button>
    );
  }

  return (
    <div className={classNames}>
      <span className={styles.content}>{children}</span>
      {showCount && count !== undefined && (
        <span className={styles.count}>{count}</span>
      )}
    </div>
  );
};
