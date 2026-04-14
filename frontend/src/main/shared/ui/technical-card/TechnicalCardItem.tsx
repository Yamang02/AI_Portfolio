import React from 'react';
import { Badge } from '@design-system/components/Badge/Badge';
import styles from './TechnicalCardItem.module.css';

export interface TechnicalCardData {
  id: string;
  title: string;
  category: string;
  problemStatement: string;
  analysis?: string;
  solution: string;
  isPinned?: boolean;
  sortOrder?: number;
}

const ProblemIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const AnalysisIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SolutionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface Props {
  card: TechnicalCardData;
}

export const TechnicalCardItem: React.FC<Props> = ({ card }) => (
  <article className={styles.card}>
    <header className={styles.header}>
      <h3 className={styles.title}>{card.title}</h3>
      <Badge variant="outline" size="sm">{card.category}</Badge>
    </header>
    <div className={styles.body}>
      <div className={styles.section}>
        <span className={styles.label}>
          <ProblemIcon />
          문제
        </span>
        <p className={styles.content}>{card.problemStatement}</p>
      </div>
      {card.analysis && (
        <div className={styles.section}>
          <span className={styles.label}>
            <AnalysisIcon />
            분석
          </span>
          <p className={styles.content}>{card.analysis}</p>
        </div>
      )}
      <div className={styles.section}>
        <span className={styles.label}>
          <SolutionIcon />
          해결
        </span>
        <p className={styles.content}>{card.solution}</p>
      </div>
    </div>
  </article>
);
