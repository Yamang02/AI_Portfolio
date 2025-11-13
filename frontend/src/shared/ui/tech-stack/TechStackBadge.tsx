import React from 'react';
import { TechStackBadgeProps } from '@entities/tech-stack';
import { cn } from '@shared/lib/utils/cn';

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
    return 'inline-flex items-center gap-1 rounded-md border transition-all duration-200 ease-in-out select-none whitespace-nowrap';
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
        return 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-700 text-white font-semibold';
      case 'filter':
        return cn(
          'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300',
          onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500',
          selected && 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600 text-white'
        );
      case 'compact':
        return 'px-1 py-0.5 text-[0.6875rem] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400';
      default:
        return 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300';
    }
  };

  const getLevelClasses = () => {
    switch (tech.level) {
      case 'expert':
        return 'border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20';
      case 'intermediate':
        return 'border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20';
      case 'beginner':
        return 'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20';
      default:
        return '';
    }
  };

  const getClickableClasses = () => {
    if (!onClick) return '';
    return 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:translate-y-0';
  };

  const getSelectedClasses = () => {
    if (!selected) return '';
    return 'ring-2 ring-blue-500 ring-opacity-50';
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

