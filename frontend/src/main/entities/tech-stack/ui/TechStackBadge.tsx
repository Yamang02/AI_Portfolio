import React from 'react';
import './TechStackBadge.css';

// 기술 스택 타입 정의
export interface TechStack {
  name: string;
  category: string;
  level: 'expert' | 'intermediate' | 'beginner';
  iconUrl?: string;
  color?: string;
}

// 기술 스택 배지 Props
export interface TechStackBadgeProps {
  tech: TechStack;
  variant?: 'default' | 'core' | 'filter' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 기술 스택 배지 컴포넌트
 * 기술 스택을 시각적으로 표현하는 배지 컴포넌트
 */
export const TechStackBadge: React.FC<TechStackBadgeProps> = ({
  tech,
  variant = 'default',
  size = 'md',
  showCount = false,
  count,
  selected = false,
  onClick,
  className = ''
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'core':
        return 'tech-badge--core';
      case 'filter':
        return 'tech-badge--filter';
      case 'compact':
        return 'tech-badge--compact';
      default:
        return 'tech-badge--default';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'tech-badge--sm';
      case 'lg':
        return 'tech-badge--lg';
      default:
        return 'tech-badge--md';
    }
  };

  const getLevelClass = () => {
    switch (tech.level) {
      case 'expert':
        return 'tech-badge--expert';
      case 'intermediate':
        return 'tech-badge--intermediate';
      case 'beginner':
        return 'tech-badge--beginner';
      default:
        return 'tech-badge--general';
    }
  };

  const getClickableClass = () => {
    return onClick ? 'tech-badge--clickable' : '';
  };

  const getSelectedClass = () => {
    return selected ? 'tech-badge--selected' : '';
  };

  const badgeClasses = [
    'tech-badge',
    getVariantClass(),
    getSizeClass(),
    getLevelClass(),
    getClickableClass(),
    getSelectedClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={badgeClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {tech.iconUrl && (
        <img
          src={tech.iconUrl}
          alt={`${tech.name} icon`}
          className="tech-badge__icon"
          loading="lazy"
        />
      )}
      <span className="tech-badge__name">{tech.name}</span>
      {variant === 'core' && (
        <span className="tech-badge__core-indicator">★</span>
      )}
      {showCount && typeof count === 'number' && (
        <span className="tech-badge__count">{count}</span>
      )}
    </span>
  );
};
