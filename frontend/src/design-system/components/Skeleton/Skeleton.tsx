import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const toDimension = (value?: string | number): string | undefined => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
  variant = 'rectangular',
}) => {
  const style: React.CSSProperties = {
    width: toDimension(width),
    height: toDimension(height),
  };

  const classNames = [
    styles.skeleton,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      style={style}
      aria-busy="true"
      aria-label="Loading"
    />
  );
};
