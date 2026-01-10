import { useQuery } from '@tanstack/react-query';
import { profileIntroductionApi } from './profileIntroductionApi';

/**
 * 프로필 자기소개 조회 쿼리
 */
export function useProfileIntroductionQuery() {
  return useQuery({
    queryKey: ['profile-introduction'],
    queryFn: () => profileIntroductionApi.getCurrent(),
    staleTime: 10 * 60 * 1000, // 10분
  });
}
