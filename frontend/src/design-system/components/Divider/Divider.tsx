import React from 'react';
import styles from './Divider.module.css';

type DividerVariant = 'horizontal' | 'vertical';

export interface DividerProps {
  variant?: DividerVariant;
  spacing?: number; // spacing token key (multiplied by 4px)
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'horizontal',
  spacing = 6, // 24px default
  className,
}) => {
  const classNames = [styles.divider, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  const style = {
    ...(variant === 'horizontal' && {
      marginTop: `${spacing * 4}px`,
      marginBottom: `${spacing * 4}px`,
    }),
    ...(variant === 'vertical' && {
      marginLeft: `${spacing * 4}px`,
      marginRight: `${spacing * 4}px`,
    }),
  };

  return <hr className={classNames} style={style} />;
};
