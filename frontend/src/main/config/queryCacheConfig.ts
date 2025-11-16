/**
 * React Query 캐시 설정 중앙 관리
 *
 * - 모든 Query의 staleTime을 한 곳에서 관리
 * - 도메인별로 다른 캐시 전략 적용 가능
 * - 환경별로 다른 캐시 시간 사용
 */

const isDevelopment = import.meta.env.DEV;

/**
 * 캐시 시간 상수 (밀리초)
 */
export const CACHE_TIME = {
  /** 1분 */
  ONE_MINUTE: 1 * 60 * 1000,
  /** 3분 */
  THREE_MINUTES: 3 * 60 * 1000,
  /** 5분 */
  FIVE_MINUTES: 5 * 60 * 1000,
  /** 10분 */
  TEN_MINUTES: 10 * 60 * 1000,
  /** 30분 */
  THIRTY_MINUTES: 30 * 60 * 1000,
  /** 1시간 */
  ONE_HOUR: 60 * 60 * 1000,
  /** 24시간 */
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * 도메인별 캐시 전략
 *
 * - STATIC: 거의 변경되지 않는 데이터 (10분)
 * - DYNAMIC: 자주 변경될 수 있는 데이터 (3분)
 * - REALTIME: 실시간성이 중요한 데이터 (1분)
 */
export const QUERY_STALE_TIME = {
  // 포트폴리오 데이터 (관리자 수정 후 10분 이내 반영)
  EDUCATION: CACHE_TIME.TEN_MINUTES,
  EXPERIENCE: CACHE_TIME.TEN_MINUTES,
  CERTIFICATION: CACHE_TIME.TEN_MINUTES,
  PROJECT: CACHE_TIME.TEN_MINUTES,
  TECH_STACK: CACHE_TIME.TEN_MINUTES,

  // 관리자 페이지 (빠른 피드백)
  ADMIN: CACHE_TIME.FIVE_MINUTES,

  // GitHub 데이터 (외부 API, 자주 변경 안 됨)
  GITHUB: CACHE_TIME.TEN_MINUTES,

  // 캐시 현황 (실시간성 중요)
  CACHE_STATUS: CACHE_TIME.ONE_MINUTE,
} as const;

/**
 * 전역 QueryClient 기본 캐시 시간
 * - 개발 환경: 5분 (빠른 디버깅)
 * - 프로덕션: 24시간 (localStorage persistence용)
 */
export const DEFAULT_CACHE_TIME = isDevelopment
  ? CACHE_TIME.FIVE_MINUTES
  : CACHE_TIME.ONE_DAY;

/**
 * 캐시 버전
 * - 환경변수로 관리하여 배포 시 동적으로 변경 가능
 * - 스키마 변경 시 package.json version과 동기화
 */
export const CACHE_VERSION = import.meta.env.VITE_CACHE_VERSION || '1.1.0';

/**
 * localStorage 캐시 키
 */
export const CACHE_KEYS = {
  QUERY_CACHE: 'AI_PORTFOLIO_QUERY_CACHE',
  CACHE_VERSION: 'AI_PORTFOLIO_CACHE_VERSION',
} as const;
