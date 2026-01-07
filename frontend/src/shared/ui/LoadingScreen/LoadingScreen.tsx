import React from 'react';
import { Spinner } from '@/design-system/components';
import styles from './LoadingScreen.module.css';

export interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  loadingStates?: {
    projects?: boolean;
    experiences?: boolean;
    educations?: boolean;
    certifications?: boolean;
  };
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = '포트폴리오를 불러오는 중...',
  showProgress = false,
  loadingStates,
}) => {
  const getLoadingItems = () => {
    if (!loadingStates) return [];
    
    const items = [];
    if (loadingStates.projects) items.push('프로젝트');
    if (loadingStates.experiences) items.push('경력');
    if (loadingStates.educations) items.push('교육');
    if (loadingStates.certifications) items.push('자격증');
    return items;
  };

  const loadingItems = getLoadingItems();

  return (
    <div 
      className={styles.container}
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
      }}
    >
      <div className={styles.content}>
        <Spinner size="lg" ariaLabel={message} />
        <p className={styles.message}>{message}</p>
        
        {showProgress && loadingItems.length > 0 && (
          <div className={styles.progress}>
            <p className={styles.progressLabel}>로딩 중인 데이터:</p>
            <ul className={styles.progressList}>
              {loadingItems.map((item, index) => (
                <li key={index} className={styles.progressItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
