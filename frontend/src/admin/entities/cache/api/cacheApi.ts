/**
 * Cache API Client
 * 캐시 관리 API 호출 함수
 */

import type { CacheStats } from '../model/cache.types';

// 환경 변수에서 API Base URL 가져오기 (staging/production은 절대 경로 필요)
const VITE_API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')  // 빈 문자열 = 상대 경로 사용
  : (import.meta.env?.VITE_API_BASE_URL || '');

const API_BASE_URL = `${VITE_API_BASE_URL}/api/admin/cache`;

/**
 * Admin API 응답 형식
 */
interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  timestamp?: number;
}

/**
 * 캐시 통계 정보 조회
 */
export const getCacheStats = async (): Promise<CacheStats> => {
  const response = await fetch(`${API_BASE_URL}/stats`);
  if (!response.ok) {
    throw new Error('캐시 통계 조회에 실패했습니다.');
  }
  const result: AdminApiResponse<CacheStats> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || '캐시 통계 조회에 실패했습니다.');
  }
  return result.data;
};

/**
 * 모든 캐시 키 목록 조회
 */
export const getAllCacheKeys = async (): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/keys`);
  if (!response.ok) {
    throw new Error('캐시 키 목록 조회에 실패했습니다.');
  }
  const result: AdminApiResponse<string[]> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || '캐시 키 목록 조회에 실패했습니다.');
  }
  return result.data;
};

/**
 * 패턴별 캐시 키 목록 조회
 */
export const getCacheKeysByPattern = async (pattern: string): Promise<string[]> => {
  const response = await fetch(`${API_BASE_URL}/keys/${encodeURIComponent(pattern)}`);
  if (!response.ok) {
    throw new Error('패턴별 캐시 키 조회에 실패했습니다.');
  }
  const result: AdminApiResponse<string[]> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.message || '패턴별 캐시 키 조회에 실패했습니다.');
  }
  return result.data;
};

/**
 * 전체 캐시 삭제
 */
export const clearAllCache = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/flush`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('캐시 삭제에 실패했습니다.');
  }
  const result: AdminApiResponse<void> = await response.json();
  if (!result.success) {
    throw new Error(result.message || '캐시 삭제에 실패했습니다.');
  }
};

/**
 * 패턴별 캐시 삭제
 */
export const clearCacheByPattern = async (pattern: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/pattern/${encodeURIComponent(pattern)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('패턴별 캐시 삭제에 실패했습니다.');
  }
  const result: AdminApiResponse<void> = await response.json();
  if (!result.success) {
    throw new Error(result.message || '패턴별 캐시 삭제에 실패했습니다.');
  }
};
