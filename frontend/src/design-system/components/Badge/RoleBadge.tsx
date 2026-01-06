import React from 'react';
import styles from './RoleBadge.module.css';

export type RoleBadgeSize = 'sm' | 'md' | 'lg';

export interface RoleBadgeProps {
  role: string;
  size?: RoleBadgeSize;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  className,
}) => {
  const classNames = [
    styles.badge,
    styles[size],
    styles.team,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <span className={styles.text}>{role}</span>
    </div>
  );
};
