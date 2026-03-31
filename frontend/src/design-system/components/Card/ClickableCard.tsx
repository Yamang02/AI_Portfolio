import React from 'react';
import styles from './Card.module.css';
import type { CardPadding, CardVariant } from './Card';

export interface ClickableCardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const ClickableCard: React.FC<ClickableCardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  onClick,
  className,
}) => {
  const classNames = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    styles.clickable,
    styles.clickableCard,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classNames} onClick={onClick}>
      {children}
    </button>
  );
};
