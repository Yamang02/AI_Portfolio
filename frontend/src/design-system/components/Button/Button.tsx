import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'brand';
type ButtonSize = 'sm' | 'md' | 'lg';
type BrandType = 'github' | 'live' | 'notion';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  brandType?: BrandType; // brand variant일 때 사용
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: '_blank' | '_self';
  ariaLabel?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  brandType,
  disabled = false,
  children,
  onClick,
  href,
  target = '_self',
  ariaLabel,
  className,
  type = 'button',
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    variant === 'brand' && brandType ? styles[brandType] : null,
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={classNames}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
    >
      {children}
    </button>
  );
};
