import React from 'react';
import styles from './BackgroundRefetchIndicator.module.css';

/**
 * 백그라운드 리페치 인디케이터
 * React Query의 백그라운드 리페치 중임을 사용자에게 알립니다.
 */
export function BackgroundRefetchIndicator() {
  return (
    <div className={styles.indicator} role="status" aria-live="polite">
      <span className={styles.text}>업데이트 중...</span>
    </div>
  );
}
