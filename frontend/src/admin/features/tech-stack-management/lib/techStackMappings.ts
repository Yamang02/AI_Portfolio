/**
 * 기술 스택 매핑 유틸리티
 */

import type { TechStackCategory, TechStackLevel } from '../../../entities/tech-stack';

// 카테고리 표시명 매핑
export const categoryNames: Record<TechStackCategory, string> = {
  language: '언어',
  framework: '프레임워크',
  database: '데이터베이스',
  tool: '도구',
  other: '기타',
};

// 레벨 표시명 매핑
export const levelMapping: Record<TechStackLevel, string> = {
  core: '핵심',
  general: '일반',
  learning: '학습중',
};

// 카테고리 색상 매핑
export const getCategoryColor = (category: TechStackCategory): string => {
  const colors: Record<TechStackCategory, string> = {
    language: '#1890ff',
    framework: '#52c41a',
    database: '#fa8c16',
    tool: '#722ed1',
    other: '#8c8c8c',
  };
  return colors[category] || '#8c8c8c';
};
