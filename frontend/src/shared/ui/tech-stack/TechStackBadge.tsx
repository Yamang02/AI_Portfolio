import React from 'react';
import { TechStackBadgeProps } from '@entities/tech-stack';
import { cn } from '@/shared/lib/utils/cn';

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
  const getBaseClasses = () => {
    // 배지처럼 보이도록 스타일 조정 (버튼과 구분)
    return 'inline-flex items-center gap-1 rounded-full border transition-all duration-200 ease-in-out select-none whitespace-nowrap';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-[0.6875rem] gap-0.5';
      case 'lg':
        return 'px-3 py-1.5 text-sm gap-1.5';
      default: // md
        return 'px-2 py-1 text-xs gap-1';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'core':
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold';  /* 기본은 neutral, hover에 브랜드 그린 */
      case 'filter':
        return cn(
          'bg-surface dark:bg-slate-800 border-border text-text-primary',
          onClick && 'cursor-pointer hover:bg-surface-elevated dark:hover:bg-slate-700 hover:border-border',
          selected && 'bg-primary-600 dark:bg-primary-500 border-primary-600 dark:border-primary-500 text-white'
        );
      case 'compact':
        return 'px-1 py-0.5 text-[0.6875rem] bg-surface dark:bg-slate-800 border-border text-text-secondary';
      case 'accent':
        return 'bg-[var(--color-status-success)] border-[var(--color-status-success)] text-white';  /* Success 색상과 동일 (라이트/다크 자동 적용) */
      default:
        return 'bg-surface dark:bg-slate-800 border-border text-text-primary';
    }
  };

  const getLevelClasses = () => {
    switch (tech.level) {
      case 'expert':
        return 'border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20';
      case 'intermediate':
        return 'border-l-4 border-l-gray-400 dark:border-l-gray-500 bg-gray-50 dark:bg-gray-800/50';  /* Neutral Gray */
      case 'beginner':
        return 'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20';
      default:
        return '';
    }
  };

  const getClickableClasses = () => {
    if (!onClick) return '';
    // 배지는 미묘한 hover 효과만 (버튼과 구분)
    // hover 시 테두리에 브랜드 그린 톤 추가
    return 'cursor-pointer hover:opacity-85 hover:scale-105 active:scale-100 hover:border-[#7FAF8A] hover:border-opacity-40';
  };

  const getSelectedClasses = () => {
    if (!selected) return '';
    return 'ring-2 ring-gray-400 dark:ring-gray-500 ring-opacity-50';  /* Neutral Gray */
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const badgeClasses = cn(
    getBaseClasses(),
    getSizeClasses(),
    getVariantClasses(),
    getLevelClasses(),
    getClickableClasses(),
    getSelectedClasses(),
    className
  );

  return (
    <div
      className={badgeClasses}
      onClick={handleClick}
      title={tech.description || `${tech.displayName} (${tech.level})`}
    >
      {/* 기술명 (텍스트만 표시) */}
      <span className="font-inherit">
        {tech.displayName}
      </span>

      {/* 레벨 표시 (core variant인 경우) */}
      {variant === 'core' && (
        <span className="text-[0.625rem] opacity-80 uppercase tracking-wider">
          {tech.level}
        </span>
      )}

      {/* 카운트 표시 (filter variant인 경우) */}
      {showCount && count !== undefined && (
        <span className="bg-black/10 dark:bg-white/10 rounded px-1 text-[0.625rem] font-semibold min-w-[1rem] text-center">
          {count}
        </span>
      )}
    </div>
  );
};

