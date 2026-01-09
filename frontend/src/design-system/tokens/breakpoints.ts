/**
 * Breakpoint Tokens
 *
 * Phase 3: Design System Minimalization
 * 반응형 디자인을 위한 breakpoint 토큰을 정의합니다.
 */

export const breakpoints = {
  /** 모바일: 0px ~ 767px */
  mobile: '767px',
  /** 태블릿 시작: 768px */
  tablet: '768px',
  /** 태블릿 끝: 1023px */
  tabletMax: '1023px',
  /** 데스크톱: 1024px 이상 */
  desktop: '1024px',
} as const;

/**
 * 미디어 쿼리 헬퍼 함수
 * CSS 변수로 사용할 수 있도록 문자열로 반환합니다.
 */
export const mediaQueries = {
  /** 모바일 이하 (max-width: 767px) */
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  /** 태블릿 이상 (min-width: 768px) */
  tabletUp: `@media (min-width: ${breakpoints.tablet})`,
  /** 태블릿 이하 (max-width: 1023px) */
  tabletDown: `@media (max-width: ${breakpoints.tabletMax})`,
  /** 데스크톱 이상 (min-width: 1024px) */
  desktopUp: `@media (min-width: ${breakpoints.desktop})`,
} as const;

/**
 * CSS 변수로 사용할 수 있는 breakpoint 값
 * CSS에서 var(--breakpoint-mobile) 형태로 사용
 */
export const breakpointCSSVars = {
  mobile: 'var(--breakpoint-mobile)',
  tablet: 'var(--breakpoint-tablet)',
  tabletMax: 'var(--breakpoint-tablet-max)',
  desktop: 'var(--breakpoint-desktop)',
} as const;

export type Breakpoint = keyof typeof breakpoints;
