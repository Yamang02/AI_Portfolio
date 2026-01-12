import { ProfileIntroduction } from '../model/profileIntroduction.types';
import { apiClient } from '@/shared/api/apiClient';

/**
 * Public 프로필 자기소개 API
 */
export const profileIntroductionApi = {
  /**
   * 현재 자기소개 조회
   */
  getCurrent: async (): Promise<ProfileIntroduction> => {
    const response = await apiClient.callApi<ProfileIntroduction>('/api/profile-introduction');
    if (!response.data) {
      throw new Error('Failed to fetch profile introduction');
    }
    return response.data;
  },
};
