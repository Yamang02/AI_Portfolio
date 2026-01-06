import React from 'react';
import styles from './SectionTitle.module.css';

type SectionTitleLevel = 'h1' | 'h2' | 'h3' | 'h4';

export interface SectionTitleProps {
  level: SectionTitleLevel;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  level,
  children,
  className,
  id,
}) => {
  const Tag = level;
  const classNames = [styles.sectionTitle, styles[level], className]
    .filter(Boolean)
    .join(' ');

  return <Tag id={id} className={classNames}>{children}</Tag>;
};
