import React from 'react';
import { SectionTitle } from '@/design-system';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  /** 타이틀 오른쪽에 표시할 액션 (예: 검색 버튼) */
  actions?: React.ReactNode;
  /** 타이틀 아래에 표시할 부가 정보 (예: "총 N개의 작업물") */
  description?: React.ReactNode;
}

/**
 * 페이지 타이틀 영역을 통일하는 공통 헤더.
 * 대표 소개, 작업물, 글 등 모든 페이지에서 동일한 위치에 타이틀을 표시합니다.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actions,
  description,
}) => {
  return (
    <section className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <SectionTitle level="h1">{title}</SectionTitle>
              {actions}
            </div>
            {description && <div className={styles.description}>{description}</div>}
          </div>
        </div>
      </div>
    </section>
  );
};
