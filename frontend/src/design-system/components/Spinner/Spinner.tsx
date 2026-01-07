import React from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  ariaLabel = 'Loading',
}) => {
  const classNames = [
    styles.spinner,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <div className={styles.dot}></div>
      <div className={styles.dot} style={{ animationDelay: '0.1s' }}></div>
      <div className={styles.dot} style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};
