import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import styles from './LoadingOverlay.module.css';

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = '로딩 중...',
}) => {
  return (
    <div className={styles.container}>
      {children}
      {isLoading && (
        <div className={styles.overlay}>
          <div className={styles.content}>
            <Spinner size="lg" />
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
