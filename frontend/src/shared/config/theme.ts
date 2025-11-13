/**
 * 디자인 토큰 모듈
 * Tailwind 설정과 동기화된 디자인 시스템 토큰
 */

// 색상 팔레트 (Tailwind primary 색상과 동기화)
export const colors = {
  primary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    950: '#2e1065',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  white: '#ffffff',
  black: '#000000',
} as const;

// 간격 (Tailwind spacing과 동기화)
export const spacing = {
  xs: '0.25rem',    // 1
  sm: '0.5rem',     // 2
  md: '1rem',       // 4
  lg: '1.5rem',     // 6
  xl: '2rem',       // 8
  '2xl': '3rem',    // 12
  '3xl': '4rem',    // 16
} as const;

// 애니메이션 지속 시간
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// 애니메이션 이징
export const easing = {
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// 그림자
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

// 테두리 반경
export const borderRadius = {
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  full: '9999px',   // 완전히 둥근 형태
} as const;

// 포커스 링 색상
export const focusRing = {
  color: colors.primary[500],
  width: '2px',
} as const;

// 타입 정의
export type ColorScale = typeof colors.primary;
export type SpacingScale = typeof spacing;
export type TransitionDuration = typeof transitions;
export type EasingFunction = typeof easing;

/**
 * CSS 변수로 사용할 수 있는 헬퍼 함수
 */
export const getThemeVar = (category: string, key: string): string => {
  return `var(--${category}-${key})`;
};

/**
 * Tailwind 클래스 이름 생성 헬퍼
 */
export const getColorClass = (color: keyof typeof colors, shade?: string): string => {
  if (shade) {
    return `${color}-${shade}`;
  }
  return color;
};

/**
 * 전환 효과를 위한 클래스 생성
 */
export const getTransitionClass = (
  duration: keyof typeof transitions = 'normal',
  property: string = 'all',
  easingFn: keyof typeof easing = 'ease-in-out'
): string => {
  return `transition-${property} duration-${duration} ${easingFn}`;
};

