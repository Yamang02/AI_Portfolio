/**
 * Typography Tokens
 *
 * Phase 3: Design System Minimalization
 * 시스템 폰트 기반 타이포그래피를 정의합니다.
 */

export const fontFamily = {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(', '),
  mono: [
    '"SF Mono"',
    'Monaco',
    '"Cascadia Code"',
    '"Roboto Mono"',
    'Consolas',
    '"Courier New"',
    'monospace',
  ].join(', '),
} as const;

export const fontSize = {
  display: '3.75rem', // 60px
  h1: '2.25rem', // 36px
  h2: '1.875rem', // 30px
  h3: '1.5rem', // 24px
  h4: '1.25rem', // 20px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  sm: '0.875rem', // 14px
  xs: '0.75rem', // 12px
} as const;

export const fontSizeMobile = {
  display: '2.5rem', // 40px
  h1: '1.875rem', // 30px
  h2: '1.5rem', // 24px
  h3: '1.25rem', // 20px
  h4: '1.125rem', // 18px
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const letterSpacing = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
} as const;

export type FontFamily = keyof typeof fontFamily;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type LetterSpacing = keyof typeof letterSpacing;
