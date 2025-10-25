/**
 * Cache Entity Types
 * 캐시 관련 타입 정의
 */

/**
 * 캐시 통계 정보
 */
export interface CacheStats {
  totalKeys: number;
  sessionKeys: number;
  cacheKeys: number;
  usedMemory: string;
  usedMemoryPeak: string;
  memoryFragmentationRatio: string;
}

/**
 * 캐시 삭제 요청
 */
export interface ClearCacheRequest {
  pattern: string;
}

/**
 * Redis 서버 정보
 */
export interface RedisServerInfo {
  [key: string]: string;
}
