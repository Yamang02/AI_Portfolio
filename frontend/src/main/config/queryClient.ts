import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';

/**
 * React Query 클라이언트 설정
 * - localStorage에 캐시를 저장하여 콜드스타트 문제 해결
 * - 개발 환경에서는 짧은 캐시 시간, 프로덕션에서는 긴 캐시 시간 사용
 */
const isDevelopment = import.meta.env.DEV;
const cacheTime = isDevelopment 
  ? 5 * 60 * 1000 // 개발 환경: 5분
  : 24 * 60 * 60 * 1000; // 프로덕션: 24시간

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: cacheTime,
      gcTime: cacheTime,
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
  const key = 'AI_PORTFOLIO_QUERY_CACHE';
  const versionKey = 'AI_PORTFOLIO_CACHE_VERSION';
  const currentVersion = '1.0.0'; // 캐시 버전 (스키마 변경 시 업데이트)

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      try {
        localStorage.setItem(key, JSON.stringify(persistedClient));
        localStorage.setItem(versionKey, currentVersion);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to persist query client:', error);
        }
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        // 버전 확인
        const cachedVersion = localStorage.getItem(versionKey);
        if (cachedVersion !== currentVersion) {
          // 버전이 다르면 오래된 캐시 제거
          localStorage.removeItem(key);
          localStorage.removeItem(versionKey);
          return undefined;
        }

        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached) as PersistedClient;
          
          // 캐시가 너무 오래되었는지 확인 (maxAge 체크)
          if (parsed.timestamp) {
            const age = Date.now() - parsed.timestamp;
            const maxAge = cacheTime;
            if (age > maxAge) {
              // 오래된 캐시 제거
              localStorage.removeItem(key);
              localStorage.removeItem(versionKey);
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
        localStorage.removeItem(key);
        localStorage.removeItem(versionKey);
      }
      return undefined;
    },
    removeClient: async () => {
      try {
        localStorage.removeItem(key);
        localStorage.removeItem(versionKey);
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
    maxAge: cacheTime, // 환경에 따라 다른 캐시 시간 사용
  });
}

