/**
 * Color Tokens
 *
 * 80% 표준 + 20% 브랜드 접근법
 * 
 * 브랜드 컬러: #7FAF8A (하나만 사용)
 * - Primary 버튼
 * - Hover / Focus 상태
 * - 강조 링크 (제한적)
 * 
 * 나머지는 표준 색상 사용 (Tailwind/Material 계열)
 */

export const brandColors = {
  // 브랜드 그린: #7FAF8A (하나만 사용)
  primary: '#7FAF8A',        // 브랜드 그린 - Primary CTA 버튼, Focus, 강조 링크
  primaryHover: '#6FA07A',   // 약간 진한 hover
  primaryActive: '#5F9070',  // Active 상태
  primaryFocus: '#7FAF8A',   // Focus ring
  
  // 다크 모드용 (약간 밝게 조정)
  primaryDark: '#6FA07A',    // 다크 모드 Primary
  primaryDarkHover: '#7FAF8A',
  primaryDarkActive: '#5F9070',
} as const;

export const lightModeColors = {
  background: {
    primary: '#ffffff',      // 순수 흰색 (neutral)
    secondary: '#f9fafb',     // Gray-50 (표준)
    tertiary: '#f3f4f6',     // Gray-100 (표준)
  },
  text: {
    primary: '#111827',       // Gray-900 (표준)
    secondary: '#6b7280',    // Gray-500 (표준)
    tertiary: '#9ca3af',     // Gray-400 (표준)
  },
  border: {
    default: '#e5e7eb',      // Gray-200 (표준 neutral)
    hover: '#d1d5db',        // Gray-300 (표준)
    accent: '#e5e7eb',        // Gray-200 (브랜드 색상 제거)
  },
  link: {
    default: '#6b7280',      // Gray-500 (neutral, 브랜드 제거)
    hover: '#7FAF8A',        // 브랜드 그린 (강조 링크만)
    visited: '#6b7280',      // Gray-500 (neutral)
  },
  status: {
    info: '#3b82f6',         // Blue-500 (표준)
    success: '#10b981',      // Green-500 (표준, 브랜드 그린 아님)
    warning: '#f59e0b',       // Amber-500 (표준)
    error: '#ef4444',        // Red-500 (표준)
  },
} as const;

export const darkModeColors = {
  background: {
    primary: '#111827',       // Gray-900 (표준 neutral)
    secondary: '#1f2937',     // Gray-800 (표준)
    tertiary: '#374151',      // Gray-700 (표준)
  },
  text: {
    primary: '#f9fafb',       // Gray-50 (표준)
    secondary: '#d1d5db',    // Gray-300 (표준)
    tertiary: '#9ca3af',      // Gray-400 (표준)
  },
  border: {
    default: '#374151',       // Gray-700 (표준 neutral)
    hover: '#4b5563',         // Gray-600 (표준)
    accent: '#374151',         // Gray-700 (브랜드 색상 제거)
  },
  link: {
    default: '#d1d5db',       // Gray-300 (neutral, 브랜드 제거)
    hover: '#6FA07A',         // 브랜드 그린 (다크 모드용, 약간 어둡게)
    visited: '#9ca3af',       // Gray-400 (neutral)
  },
  status: {
    info: '#60a5fa',          // Blue-400 (표준)
    success: '#34d399',        // Green-400 (표준, 브랜드 그린 아님)
    warning: '#fbbf24',       // Amber-400 (표준)
    error: '#f87171',         // Red-400 (표준)
  },
} as const;

export type BrandColor = keyof typeof brandColors;
export type LightModeColor = keyof typeof lightModeColors;
export type DarkModeColor = keyof typeof darkModeColors;
