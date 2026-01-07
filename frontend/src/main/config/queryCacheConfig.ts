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
 * StaleTime 상수 (밀리초)
 * - React Query에서 데이터가 stale로 간주되기까지의 시간
 * - 0으로 설정하면 항상 최신 데이터로 간주
 */
export const STALE_TIME = {
  /** staleTime 없음 - 항상 최신 데이터 확인 */
  NONE: 0,
  /** 1분 */
  ONE_MINUTE: CACHE_TIME.ONE_MINUTE,
  /** 3분 */
  THREE_MINUTES: CACHE_TIME.THREE_MINUTES,
  /** 5분 */
  FIVE_MINUTES: CACHE_TIME.FIVE_MINUTES,
  /** 10분 */
  TEN_MINUTES: CACHE_TIME.TEN_MINUTES,
  /** 30분 */
  THIRTY_MINUTES: CACHE_TIME.THIRTY_MINUTES,
  /** 1시간 */
  ONE_HOUR: CACHE_TIME.ONE_HOUR,
  /** 24시간 */
  ONE_DAY: CACHE_TIME.ONE_DAY,
} as const;

/**
 * 도메인별 캐시 전략
 *
 * - 자주 변경되는 데이터: NONE (항상 최신 데이터 확인)
 * - 상대적으로 안정적인 데이터: 적절한 staleTime 설정
 * - 필요시 STALE_TIME 상수를 사용하여 개별 도메인별로 조정 가능
 */
export const QUERY_STALE_TIME = {
  // 포트폴리오 데이터
  // - 프로젝트: 자주 업데이트될 수 있으므로 NONE
  // - 교육/경력/자격증: 상대적으로 안정적이므로 5분
  // - 기술 스택: 자주 변경되지 않으므로 10분
  EDUCATION: STALE_TIME.FIVE_MINUTES,
  EXPERIENCE: STALE_TIME.FIVE_MINUTES,
  CERTIFICATION: STALE_TIME.FIVE_MINUTES,
  PROJECT: STALE_TIME.NONE, // 프로젝트는 자주 업데이트될 수 있음
  TECH_STACK: STALE_TIME.TEN_MINUTES,

  // 관리자 페이지 - 항상 최신 데이터 필요
  ADMIN: STALE_TIME.NONE,

  // GitHub 데이터 - 외부 API이므로 적절한 캐싱
  GITHUB: STALE_TIME.FIVE_MINUTES,

  // 캐시 현황 - 항상 최신 상태 확인 필요
  CACHE_STATUS: STALE_TIME.NONE,
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
