import React from 'react';
import styles from './HeaderIconButton.module.css';

export interface HeaderIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  isActive?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Header 전용 아이콘 버튼 컴포넌트
 * Header 네비게이션 버튼의 스타일을 디자인시스템으로 추출
 */
export const HeaderIconButton: React.FC<HeaderIconButtonProps> = ({
  children,
  onClick,
  ariaLabel,
  className,
  isActive = false,
  type = 'button',
}) => {
  const classNames = [
    styles.headerIconButton,
    isActive && styles.active,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      className={classNames}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};
