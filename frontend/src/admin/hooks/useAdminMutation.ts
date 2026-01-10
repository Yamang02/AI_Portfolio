/**
 * Admin Mutation 래퍼 훅
 * 
 * React Query의 useMutation을 래핑하여 Admin 공통 옵션을 적용합니다.
 */

import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export function useAdminMutation<TData = unknown, TError = Error, TVariables = void>(
  options: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation<TData, TError, TVariables>({
    // 기본 성공 메시지
    onSuccess: (data, variables, context) => {
      // 사용자 정의 onSuccess가 있으면 먼저 실행
      options.onSuccess?.(data, variables, context);
    },

    // 기본 에러 처리 (adminApiClient에서 이미 처리되므로 추가 로직 불필요)
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },

    // 사용자 옵션 병합
    ...options,
  });
}
