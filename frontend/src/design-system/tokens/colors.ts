/**
 * Color Tokens
 *
 * Phase 4.5: Landing Page Enhancement
 * 사용자 정의 색상 팔레트를 정의합니다.
 * 
 * 색상 팔레트: Green/Olive Tones (Revised - More Lively)
 * - Primary: Fresh Olive Green (#7FA874) - 라이트 모드
 * - Primary: Vital Deep Green (#4E7F63) - 다크 모드
 * - Accent: Muted Olive (#9EBF96)
 * - Success: Light Sage (#A8D08D)
 * - Highlight: Soft Green (#EEF5E8)
 * 
 * 상세 정의는 docs/technical/design-system/color-palette.md 참조
 */

export const brandColors = {
  // Primary: Fresh Olive Green (#7FA874) - 라이트 모드
  primary: '#7FA874',        // Fresh Olive Green - CTA 버튼, 강조 (더 생기있고 밝음)
  primaryHover: '#8FBF84',  // Fresh Olive Green (lighter)
  primaryActive: '#678F5E',  // Fresh Olive Green (darker)

  // Accent: Muted Olive (#9EBF96)
  accent: '#9EBF96',         // Muted Olive - 링크, 보조 강조
  accentHover: '#7FA874',   // Fresh Olive Green (darker)
  accentActive: '#B4D4A8',  // Muted Olive (lighter)

  // Success: Light Sage (#A8D08D)
  success: '#A8D08D',       // Light Sage - 성공 메시지
  successHover: '#98C07D',  // Light Sage (darker)

  // Highlight: Soft Green (#EEF5E8)
  highlight: '#EEF5E8',      // Soft Green - 배경 강조
  highlightHover: '#E0EDD8', // Soft Green (darker)

  // Dark Mode - Primary: Vital Deep Green (#4E7F63)
  primaryDark: '#4E7F63',    // Vital Deep Green - 다크모드 CTA (더 그린 중심, 생명력 있음)
  primaryDarkHover: '#5F9A78', // Vital Deep Green (lighter)
  primaryDarkActive: '#3E6650', // Vital Deep Green (darker)
} as const;

export const lightModeColors = {
  background: {
    primary: '#F7F9F4',      // 거의 흰색, 녹색기 아주 미세
    secondary: '#f9fafb',
    tertiary: '#EEF5E8',      // Soft Green (강조 배경)
  },
  text: {
    primary: '#1F2321',      // 더 부드러운 다크 그레이
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  border: {
    default: '#D9E2D6',      // 부드러운 그린 톤
    hover: '#C5D4C0',        // Border hover
    accent: '#9EBF96',       // Muted Olive (강조 테두리)
  },
  link: {
    default: '#9EBF96',     // Muted Olive (Accent)
    hover: '#7FA874',       // Fresh Olive Green (Primary)
    visited: '#678F5E',     // Fresh Olive Green (darker)
  },
  status: {
    info: '#9EBF96',         // Muted Olive
    success: '#A8D08D',       // Light Sage
    warning: '#f59e0b',      // Amber-500
    error: '#ef4444',        // Red-500
  },
} as const;

export const darkModeColors = {
  background: {
    primary: '#0F1A14',      // 그린 기운 아주 약한 다크
    secondary: '#16241C',     // Background Alt
    tertiary: '#1E3328',      // Highlight (그린 톤 다크)
  },
  text: {
    primary: '#E6F1EA',       // 부드러운 라이트 그린 톤
    secondary: '#94a3b8',
    tertiary: '#64748b',
  },
  border: {
    default: '#2E4A3B',      // 그린 톤 다크 보더
    hover: '#3A5A48',        // Border hover
    accent: '#4E7F63',       // Vital Deep Green (강조 테두리)
  },
  link: {
    default: '#7FB89A',       // Accent (lighter for dark mode)
    hover: '#4E7F63',         // Vital Deep Green
    visited: '#3E6650',       // Vital Deep Green (darker)
  },
  status: {
    info: '#7FB89A',          // Accent
    success: '#9FD6B2',       // Success (다크 모드용)
    warning: '#fbbf24',
    error: '#f87171',
  },
} as const;

export type BrandColor = keyof typeof brandColors;
export type LightModeColor = keyof typeof lightModeColors;
export type DarkModeColor = keyof typeof darkModeColors;
