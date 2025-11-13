import React from 'react';
import { TechStackBadgeProps } from '../../../entities/techstack';

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
        return '';
    }
  };

  const getCategoryClass = () => {
    return `tech-badge--${tech.category}`;
  };

  const getBadgeStyle = () => {
    const style: React.CSSProperties = {};
    
    // 색상 제거 - 모든 배지는 기본 스타일 사용
    if (selected) {
      style.boxShadow = `0 0 0 2px #3b82f6`;
    }
    
    return style;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const badgeClasses = [
    'tech-badge',
    getVariantClass(),
    getSizeClass(),
    getLevelClass(),
    getCategoryClass(),
    selected ? 'tech-badge--selected' : '',
    onClick ? 'tech-badge--clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={badgeClasses}
      style={getBadgeStyle()}
      onClick={handleClick}
      title={tech.description || `${tech.displayName} (${tech.level})`}
    >
      {/* 기술명 (텍스트만 표시) */}
      <span className="tech-badge__name">
        {tech.displayName}
      </span>

      {/* 레벨 표시 (core variant인 경우) */}
      {variant === 'core' && (
        <span className="tech-badge__level">
          {tech.level}
        </span>
      )}

      {/* 카운트 표시 (filter variant인 경우) */}
      {showCount && count !== undefined && (
        <span className="tech-badge__count">
          {count}
        </span>
      )}
    </div>
  );
};
