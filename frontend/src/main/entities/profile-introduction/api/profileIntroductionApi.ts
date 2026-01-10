import { ProfileIntroduction } from '../model/profileIntroduction.types';
import { ApiResponse } from '@/shared/types/api';

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

/**
 * Public 프로필 자기소개 API
 */
export const profileIntroductionApi = {
  /**
   * 현재 자기소개 조회
   */
  getCurrent: async (): Promise<ProfileIntroduction> => {
    const url = `${API_BASE_URL}/api/profile-introduction`;
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile introduction');
    }
    
    const result: ApiResponse<ProfileIntroduction> = await response.json();
    return result.data!;
  },
};
