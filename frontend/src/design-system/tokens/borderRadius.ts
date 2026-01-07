/**
 * Border Radius Tokens
 *
 * Phase 3: Design System Minimalization
 */

export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  full: '9999px', // 완전한 원형
} as const;

export type BorderRadius = keyof typeof borderRadius;
