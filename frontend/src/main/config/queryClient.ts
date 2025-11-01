import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';

/**
 * React Query 클라이언트 설정
 * - localStorage에 캐시를 저장하여 콜드스타트 문제 해결
 * - 24시간 캐시 유지
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 24 * 60 * 60 * 1000, // 24시간 - 캐시된 데이터를 fresh로 유지
      gcTime: 24 * 60 * 60 * 1000, // 24시간 - 캐시 유지 시간 (이전 cacheTime)
      retry: 3, // 최대 3회 재시도
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리프레시 비활성화 (캐시 우선)
      refetchOnMount: false, // 마운트 시 자동 리프레시 비활성화 (캐시 우선)
      refetchOnReconnect: true, // 네트워크 재연결 시 리프레시
    },
  },
});

/**
 * localStorage Persister 구현
 * React Query v5에서는 persister 인터페이스를 직접 구현해야 합니다.
 */
const createLocalStoragePersister = (): Persister => {
  const key = 'AI_PORTFOLIO_QUERY_CACHE';

  return {
    persistClient: async (persistedClient: PersistedClient) => {
      try {
        localStorage.setItem(key, JSON.stringify(persistedClient));
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to persist query client:', error);
        }
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          return JSON.parse(cached) as PersistedClient;
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to restore query client:', error);
        }
        // 오류 발생 시 캐시 제거
        localStorage.removeItem(key);
      }
      return undefined;
    },
    removeClient: async () => {
      try {
        localStorage.removeItem(key);
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
    maxAge: 24 * 60 * 60 * 1000, // 24시간
  });
}

