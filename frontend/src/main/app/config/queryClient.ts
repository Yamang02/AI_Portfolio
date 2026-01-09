import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { DEFAULT_CACHE_TIME, CACHE_VERSION, CACHE_KEYS, STALE_TIME } from '@/shared/config/queryCacheConfig';

/**
 * React Query 클라이언트 설정 (Main 앱 전용)
 * - localStorage에 캐시를 저장하여 콜드스타트 문제 해결
 * - 개발 환경에서는 짧은 캐시 시간, 프로덕션에서는 긴 캐시 시간 사용
 */
const isDevelopment = import.meta.env.DEV;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME.NONE, // stale time 제거 - 항상 최신 데이터 확인
      gcTime: DEFAULT_CACHE_TIME,
      retry: 3, // 최대 3회 재시도
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리프레시 비활성화 (캐시 우선)
      refetchOnMount: isDevelopment ? true : false, // 개발 환경에서는 마운트 시 리프레시
      refetchOnReconnect: true, // 네트워크 재연결 시 리프레시
    },
  },
});

/**
 * localStorage Persister 구현
 * React Query v5에서는 persister 인터페이스를 직접 구현해야 합니다.
 * 캐시 버전 관리 추가로 오래된 캐시 자동 무효화
 */
const createLocalStoragePersister = (): Persister => {
  return {
    persistClient: async (persistedClient: PersistedClient) => {
      try {
        localStorage.setItem(CACHE_KEYS.QUERY_CACHE, JSON.stringify(persistedClient));
        localStorage.setItem(CACHE_KEYS.CACHE_VERSION, CACHE_VERSION);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to persist query client:', error);
        }
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        // 버전 확인
        const cachedVersion = localStorage.getItem(CACHE_KEYS.CACHE_VERSION);
        if (cachedVersion !== CACHE_VERSION) {
          // 버전이 다르면 오래된 캐시 제거
          localStorage.removeItem(CACHE_KEYS.QUERY_CACHE);
          localStorage.removeItem(CACHE_KEYS.CACHE_VERSION);
          return undefined;
        }

        const cached = localStorage.getItem(CACHE_KEYS.QUERY_CACHE);
        if (cached) {
          const parsed = JSON.parse(cached) as PersistedClient;

          // 캐시가 너무 오래되었는지 확인 (maxAge 체크)
          if (parsed.timestamp) {
            const age = Date.now() - parsed.timestamp;
            const maxAge = DEFAULT_CACHE_TIME;
            if (age > maxAge) {
              // 오래된 캐시 제거
              localStorage.removeItem(CACHE_KEYS.QUERY_CACHE);
              localStorage.removeItem(CACHE_KEYS.CACHE_VERSION);
              return undefined;
            }
          }

          return parsed;
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to restore query client:', error);
        }
        // 오류 발생 시 캐시 제거
        localStorage.removeItem(CACHE_KEYS.QUERY_CACHE);
        localStorage.removeItem(CACHE_KEYS.CACHE_VERSION);
      }
      return undefined;
    },
    removeClient: async () => {
      try {
        localStorage.removeItem(CACHE_KEYS.QUERY_CACHE);
        localStorage.removeItem(CACHE_KEYS.CACHE_VERSION);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to remove query client:', error);
        }
      }
    },
  };
};

/**
 * QueryClient에 Persistence 적용
 * 앱 시작 시 localStorage에서 캐시 복원
 */
if (typeof window !== 'undefined') {
  const persister = createLocalStoragePersister();
  persistQueryClient({
    queryClient,
    persister,
    maxAge: DEFAULT_CACHE_TIME, // 환경에 따라 다른 캐시 시간 사용
  });
}
