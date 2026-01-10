import { useAdminQuery } from '@/admin/hooks/useAdminQuery';
import { useAdminMutation } from '@/admin/hooks/useAdminMutation';
import { adminProfileIntroductionApi } from './adminProfileIntroductionApi';
import { SaveProfileIntroductionRequest } from '../model/profileIntroduction.types';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

/**
 * 현재 자기소개 조회 쿼리
 */
export function useAdminProfileIntroductionQuery() {
  return useAdminQuery({
    queryKey: ['admin', 'profile-introduction'],
    queryFn: () => adminProfileIntroductionApi.getCurrent(),
  });
}

/**
 * 자기소개 저장 뮤테이션
 */
export function useSaveProfileIntroductionMutation() {
  const queryClient = useQueryClient();

  return useAdminMutation({
    mutationFn: (data: SaveProfileIntroductionRequest) =>
      adminProfileIntroductionApi.saveOrUpdate(data),
    onSuccess: () => {
      message.success('자기소개가 저장되었습니다.');
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile-introduction'] });
    },
  });
}
