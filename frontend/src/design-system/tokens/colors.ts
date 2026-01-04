/**
 * Color Tokens
 *
 * Phase 3: Design System Minimalization
 * 사용자 정의 색상 팔레트를 정의합니다.
 * 
 * 색상 팔레트: Green/Olive Tones
 * - Primary: Dark Olive (#89986D)
 * - Accent: Muted Olive (#9CAB84)
 * - Success: Light Sage (#C5D89D)
 * - Highlight: Cream Beige (#F6F0D7)
 * 
 * 상세 정의는 docs/technical/design-system/color-palette.md 참조
 */

export const brandColors = {
  // Primary: Dark Olive (#89986D)
  primary: '#89986D',        // Dark Olive - CTA 버튼, 강조
  primaryHover: '#9CAB84',   // Muted Olive (lighter)
  primaryActive: '#6F7D56',  // Dark Olive + 20% darker

  // Accent: Muted Olive (#9CAB84)
  accent: '#9CAB84',         // Muted Olive - 링크, 보조 강조
  accentHover: '#89986D',    // Dark Olive (darker)
  accentActive: '#B4C4A0',   // Muted Olive + 15% lighter

  // Success: Light Sage (#C5D89D)
  success: '#C5D89D',        // Light Sage - 성공 메시지
  successHover: '#B4C88A',   // Light Sage + 10% darker

  // Highlight: Cream Beige (#F6F0D7)
  highlight: '#F6F0D7',      // Cream Beige - 배경 강조
  highlightHover: '#EDE7C8', // Cream Beige + 5% darker

  // Dark Mode - Primary: Deep Teal (#5A7863)
  primaryDark: '#5A7863',    // Deep Teal - 다크모드 CTA
  primaryDarkHover: '#6B8F75', // Deep Teal + 15% lighter
  primaryDarkActive: '#4A6352', // Deep Teal + 15% darker
} as const;

export const lightModeColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#F6F0D7',      // Cream Beige (강조 배경)
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  border: {
    default: '#e5e7eb',
    hover: '#d1d5db',
    accent: '#9CAB84',        // Muted Olive (강조 테두리)
  },
  link: {
    default: '#9CAB84',       // Muted Olive (Accent)
    hover: '#89986D',         // Dark Olive (Primary)
    visited: '#6F7D56',       // Dark Olive (darker)
  },
  status: {
    info: '#9CAB84',          // Muted Olive
    success: '#C5D89D',       // Light Sage
    warning: '#f59e0b', // Amber-500
    error: '#ef4444', // Red-500
  },
} as const;

export const darkModeColors = {
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#3B4953',      // Dark Forest (사용자 정의)
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    tertiary: '#64748b',
  },
  border: {
    default: '#334155',
    hover: '#475569',
    accent: '#5A7863',        // Deep Teal (강조 테두리)
  },
  link: {
    default: '#90AB8B',       // Soft Green (lighter for dark mode)
    hover: '#5A7863',         // Deep Teal
    visited: '#4A6352',       // Deep Teal (darker)
  },
  status: {
    info: '#90AB8B',          // Soft Green
    success: '#C5D89D',       // Light Sage (라이트 모드와 동일)
    warning: '#fbbf24',
    error: '#f87171',
  },
} as const;

export type BrandColor = keyof typeof brandColors;
export type LightModeColor = keyof typeof lightModeColors;
export type DarkModeColor = keyof typeof darkModeColors;
