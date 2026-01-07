import React from 'react';
import { Spinner } from '@/design-system/components';
import styles from './LoadingState.module.css';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
  className?: string;
}

/**
 * 개별 섹션이나 컴포넌트에서 사용할 수 있는 로딩 상태 표시 컴포넌트
 * 인라인으로 사용하거나 독립적으로 사용할 수 있습니다.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'md',
  inline = false,
  className,
}) => {
  const containerClass = inline
    ? `${styles.inlineContainer} ${className || ''}`
    : `${styles.container} ${className || ''}`;

  return (
    <div className={containerClass}>
      <Spinner size={size} ariaLabel={message || '로딩 중'} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};
