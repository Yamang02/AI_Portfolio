import React from 'react';
import styles from './TextLink.module.css';

export interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  underline?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const TextLink: React.FC<TextLinkProps> = ({
  href,
  children,
  external = false,
  underline = false,
  ariaLabel,
  className,
}) => {
  const classNames = [styles.textLink, underline && styles.underline, className]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : undefined}
      className={classNames}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
    >
      {children}
      {external && <span className={styles.srOnly}> (새 탭에서 열기)</span>}
    </a>
  );
};
