import { QueryClient } from '@tanstack/react-query';

/**
 * 어드민 페이지용 React Query 클라이언트 설정
 * - localStorage 캐시 없음 (항상 최신 데이터 유지)
 * - 어드민 페이지는 실시간 데이터가 중요하므로 캐싱 최소화
 */
export const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // 항상 최신 데이터 확인
      gcTime: 0, // 캐시 즉시 제거
      retry: 1, // 최소한의 재시도만
      refetchOnWindowFocus: true, // 브라우저 포커스 시 재검증
      refetchOnMount: true, // 마운트 시 재검증
      refetchOnReconnect: true, // 네트워크 재연결 시 리프레시
    },
  },
});

