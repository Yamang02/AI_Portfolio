/**
 * Color Tokens - 업계 표준 컬러 시스템
 * 
 * 구조:
 * 1. Primitive Tokens: 기본 컬러 팔레트 (gray, brand, semantic colors)
 * 2. Semantic Tokens: 의미 기반 컬러 (background, text, border, status 등)
 * 
 * 단일 소스 원칙:
 * - 실제 컬러 값은 globals.css의 CSS 변수(--color-*)가 단일 소스
 * - 이 파일은 TypeScript 타입 정의와 CSS 변수 참조만 제공
 * - 컴포넌트는 CSS 변수를 직접 사용하거나 이 파일의 타입을 참조
 */

// ============================================================================
// Primitive Color Scales (기본 컬러 팔레트)
// ============================================================================

/**
 * Gray Scale - 중립 색상 팔레트
 * Tailwind CSS 표준 gray scale 기반
 */
export const grayScale = {
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
  950: '#030712',
} as const;

/**
 * Brand Color Scale - 브랜드 그린 (#7FAF8A) 기반
 * Primary 컬러의 다양한 명도/채도 변형
 */
export const brandScale = {
  50: '#f0f9f4',
  100: '#dcf4e6',
  200: '#b8e9cd',
  300: '#94deb4',
  400: '#7FAF8A',  // 브랜드 Primary
  500: '#6FA07A',  // Hover
  600: '#5F9070',  // Active
  700: '#4F8060',  // Dark text
  800: '#3F7050',
  900: '#2F6040',
  950: '#1F5030',
} as const;

/**
 * Semantic Color Scales - 상태/의미 기반 색상
 */
export const semanticColors = {
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Info
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#34d399',  // Success (다크 모드)
    500: '#10b981',  // Success (라이트 모드)
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',  // Warning (다크 모드)
    500: '#f59e0b',  // Warning (라이트 모드)
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',  // Error (다크 모드)
    500: '#ef4444',  // Error (라이트 모드)
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#6e5494',  // GitHub purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#f5c842',  // Featured badge
    600: '#eab308',
    700: '#ca8a04',
    800: '#a16207',
    900: '#854d0e',
  },
} as const;

// ============================================================================
// Semantic Color Tokens (의미 기반 컬러)
// ============================================================================

/**
 * Light Mode Semantic Tokens
 * CSS 변수(--color-*)를 참조하는 타입 정의
 */
export const lightModeSemantic = {
  // Background
  background: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-bg-tertiary)',
  },
  // Text
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
  },
  // Border
  border: {
    default: 'var(--color-border-default)',
    hover: 'var(--color-border-hover)',
    accent: 'var(--color-border-accent)',
  },
  // Link
  link: {
    default: 'var(--color-link-default)',
    hover: 'var(--color-link-hover)',
    visited: 'var(--color-link-visited)',
  },
  // Status
  status: {
    info: 'var(--color-status-info)',
    success: 'var(--color-status-success)',
    warning: 'var(--color-status-warning)',
    error: 'var(--color-status-error)',
  },
} as const;

/**
 * Dark Mode Semantic Tokens
 */
export const darkModeSemantic = {
  // Background
  background: {
    primary: 'var(--color-bg-primary)',
    secondary: 'var(--color-bg-secondary)',
    tertiary: 'var(--color-bg-tertiary)',
  },
  // Text
  text: {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
  },
  // Border
  border: {
    default: 'var(--color-border-default)',
    hover: 'var(--color-border-hover)',
    accent: 'var(--color-border-accent)',
  },
  // Link
  link: {
    default: 'var(--color-link-default)',
    hover: 'var(--color-link-hover)',
    visited: 'var(--color-link-visited)',
  },
  // Status
  status: {
    info: 'var(--color-status-info)',
    success: 'var(--color-status-success)',
    warning: 'var(--color-status-warning)',
    error: 'var(--color-status-error)',
  },
} as const;

/**
 * Brand Semantic Tokens
 */
export const brandSemantic = {
  primary: 'var(--color-primary)',
  primaryHover: 'var(--color-primary-hover)',
  primaryActive: 'var(--color-primary-active)',
  primaryFocus: 'var(--color-primary-focus)',
  primaryText: 'var(--color-primary-text)',
  primaryDark: 'var(--color-primary-dark)',
} as const;

/**
 * Utility Colors (라이트/다크 모드 공통)
 */
export const utilitySemantic = {
  white: 'var(--color-white)',
  black: 'var(--color-black)',
  tooltip: {
    background: 'var(--color-tooltip-bg)',
    text: 'var(--color-tooltip-text)',
  },
  shadow: {
    light: 'var(--color-shadow-light)',
    medium: 'var(--color-shadow-medium)',
    heavy: 'var(--color-shadow-heavy)',
    tooltip: 'var(--color-shadow-tooltip)',
  },
  glass: {
    light: 'var(--color-glass-light)',
    medium: 'var(--color-glass-medium)',
  },
} as const;

/**
 * Special Purpose Colors (히어로, Featured 등)
 */
export const specialSemantic = {
  hero: {
    background: 'var(--color-hero-bg)',
    title: 'var(--color-hero-title)',
    subtext: 'var(--color-hero-subtext)',
    ctaText: 'var(--color-hero-cta-text)',
    badge: 'var(--color-hero-badge)',
  },
  featured: {
    badge: 'var(--color-featured-badge)',
    background: 'var(--color-featured-bg)',
    header: 'var(--color-featured-header)',
    text: 'var(--color-featured-text)',
    link: 'var(--color-featured-link)',
    divider: 'var(--color-featured-divider)',
  },
  github: 'var(--color-github)',
  githubHover: 'var(--color-github-hover)',
  live: 'var(--color-live)',
  liveHover: 'var(--color-live-hover)',
  notion: 'var(--color-notion)',
  notionHover: 'var(--color-notion-hover)',
  disabled: 'var(--color-disabled)',
  buttonText: 'var(--color-button-text)',
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type GrayScale = typeof grayScale;
export type BrandScale = typeof brandScale;
export type SemanticColors = typeof semanticColors;
export type LightModeSemantic = typeof lightModeSemantic;
export type DarkModeSemantic = typeof darkModeSemantic;
export type BrandSemantic = typeof brandSemantic;
export type UtilitySemantic = typeof utilitySemantic;
export type SpecialSemantic = typeof specialSemantic;
