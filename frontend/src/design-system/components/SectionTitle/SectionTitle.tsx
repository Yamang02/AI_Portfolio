import React from 'react';
import styles from './SectionTitle.module.css';

type SectionTitleLevel = 'h1' | 'h2' | 'h3' | 'h4';

export interface SectionTitleProps {
  level: SectionTitleLevel;
  children: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  level,
  children,
  className,
}) => {
  const Tag = level;
  const classNames = [styles.sectionTitle, styles[level], className]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classNames}>{children}</Tag>;
};
