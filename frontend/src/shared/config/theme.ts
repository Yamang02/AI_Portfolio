/**
 * 디자인 토큰 모듈
 * 디자인 시스템 색상과 동기화된 토큰
 * 
 * 디자인 시스템 색상 정의는 design-system/tokens/colors.ts 참조
 */

import { brandColors, lightModeColors, darkModeColors } from '../../design-system/tokens/colors';

// 색상 팔레트 (디자인 시스템 - 브랜드 그린 #7FAF8A 기반)
export const colors = {
  primary: {
    50: '#f0f9f4',   // 매우 연한 그린
    100: '#dcf4e6',  // 연한 그린
    200: '#b8e9cd',  // 밝은 그린
    300: '#94deb4',  // 중간 밝기 그린
    400: '#7FAF8A',  // 브랜드 그린 (primary)
    500: '#6FA07A',  // 약간 진한 그린 (hover)
    600: '#5F9070',  // 진한 그린 (active)
    700: '#4F8060',  // 더 진한 그린
    800: '#3F7050',  // 매우 진한 그린
    900: '#2F6040',  // 가장 진한 그린
    950: '#1F5030',  // 최대 진한 그린
  },
  gray: {
    50: '#f9fafb',   // lightModeColors.background.secondary
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',  // lightModeColors.text.tertiary
    500: '#6b7280',  // lightModeColors.text.secondary
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

// 포커스 링 색상 (디자인 시스템 primary 사용)
export const focusRing = {
  color: brandColors.primary,
  width: '2px',
} as const;

// 라이트 모드 색상 토큰 (디자인 시스템 색상 사용)
export const lightTheme = {
  background: lightModeColors.background.primary,
  backgroundSecondary: lightModeColors.background.secondary,
  surface: lightModeColors.background.primary,
  surfaceElevated: lightModeColors.background.secondary,
  textPrimary: lightModeColors.text.primary,
  textSecondary: lightModeColors.text.secondary,
  textMuted: lightModeColors.text.tertiary,
  border: lightModeColors.border.default,
  borderLight: lightModeColors.border.hover,
} as const;

// 다크 모드 색상 토큰 (디자인 시스템 색상 사용)
export const darkTheme = {
  background: darkModeColors.background.primary,
  backgroundSecondary: darkModeColors.background.secondary,
  surface: darkModeColors.background.secondary,
  surfaceElevated: darkModeColors.background.tertiary,
  textPrimary: darkModeColors.text.primary,
  textSecondary: darkModeColors.text.secondary,
  textMuted: darkModeColors.text.tertiary,
  border: darkModeColors.border.default,
  borderLight: darkModeColors.border.hover,
} as const;

// Demon Slayer 테마 색상 토큰 (무한성편) - 따뜻한 오렌지/레드 톤
export const demonSlayerTheme = {
  background: '#0f172a', // 어두운 배경
  backgroundSecondary: '#1a0f0f', // 따뜻한 어두운 배경
  surface: '#1e1a1a', // 따뜻한 표면
  surfaceElevated: '#2a1f1f', // 높은 표면
  textPrimary: '#fff5e6', // 따뜻한 흰색
  textSecondary: '#ffd4a3', // 따뜻한 베이지
  textMuted: '#ffb366', // 따뜻한 오렌지
  border: '#3d2a1a', // 따뜻한 어두운 테두리
  borderLight: '#4a3320', // 밝은 테두리
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

