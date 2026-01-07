import React from 'react';
import styles from './Text.module.css';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg';
export type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'muted';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps {
  size?: TextSize;
  variant?: TextVariant;
  weight?: TextWeight;
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export const Text: React.FC<TextProps> = ({
  size = 'base',
  variant = 'primary',
  weight = 'regular',
  children,
  className,
  as: Component = 'p',
}) => {
  const classNames = [
    styles.text,
    styles[size],
    styles[variant],
    styles[weight],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={classNames}>{children}</Component>;
};
