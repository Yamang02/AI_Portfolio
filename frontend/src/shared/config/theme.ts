/**
 * 디자인 토큰 모듈
 * 디자인 시스템 색상과 동기화된 토큰
 * 
 * 업계 표준 컬러 시스템 기반:
 * - Primitive tokens: brandScale, grayScale, semanticColors
 * - Semantic tokens: lightModeSemantic, darkModeSemantic, brandSemantic
 * 
 * 디자인 시스템 색상 정의는 design-system/tokens/colors.ts 참조
 */

import { 
  brandScale, 
  grayScale, 
  semanticColors,
  lightModeSemantic,
  darkModeSemantic,
  brandSemantic,
} from '../../design-system/tokens/colors';

// 색상 팔레트 (Primitive Tokens - 업계 표준 구조)
export const colors = {
  primary: brandScale,
  gray: grayScale,
  blue: semanticColors.blue,
  green: semanticColors.green,
  amber: semanticColors.amber,
  red: semanticColors.red,
  purple: semanticColors.purple,
  yellow: semanticColors.yellow,
  white: '#ffffff',
  black: '#051A0E',  /* brandScale 1000 - #000000 대체 */
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

// 포커스 링 색상 (Semantic Token 사용 - CSS 변수 참조)
export const focusRing = {
  color: brandSemantic.primaryFocus,
  width: '2px',
} as const;

// 라이트 모드 색상 토큰 (Semantic Tokens 사용)
export const lightTheme = {
  background: lightModeSemantic.background.primary,
  backgroundSecondary: lightModeSemantic.background.secondary,
  surface: lightModeSemantic.background.primary,
  surfaceElevated: lightModeSemantic.background.secondary,
  textPrimary: lightModeSemantic.text.primary,
  textSecondary: lightModeSemantic.text.secondary,
  textMuted: lightModeSemantic.text.tertiary,
  border: lightModeSemantic.border.default,
  borderLight: lightModeSemantic.border.hover,
} as const;

// 다크 모드 색상 토큰 (Semantic Tokens 사용)
export const darkTheme = {
  background: darkModeSemantic.background.primary,
  backgroundSecondary: darkModeSemantic.background.secondary,
  surface: darkModeSemantic.background.secondary,
  surfaceElevated: darkModeSemantic.background.tertiary,
  textPrimary: darkModeSemantic.text.primary,
  textSecondary: darkModeSemantic.text.secondary,
  textMuted: darkModeSemantic.text.tertiary,
  border: darkModeSemantic.border.default,
  borderLight: darkModeSemantic.border.hover,
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

