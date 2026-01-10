import { adminApiClient } from '@/admin/api/adminApiClient';
import { ProfileIntroduction, SaveProfileIntroductionRequest } from '../model/profileIntroduction.types';

/**
 * Admin 프로필 자기소개 API
 */
export const adminProfileIntroductionApi = {
  /**
   * 현재 자기소개 조회
   */
  getCurrent: () =>
    adminApiClient.get<ProfileIntroduction>('/profile-introduction'),

  /**
   * 자기소개 저장 (생성 또는 업데이트)
   */
  saveOrUpdate: (data: SaveProfileIntroductionRequest) =>
    adminApiClient.put<ProfileIntroduction>('/profile-introduction', data),
};
