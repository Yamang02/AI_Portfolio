/**
 * 경험 API 클라이언트
 */

import { apiClient } from '../../../../shared/api/apiClient';

class ExperienceApi {
  /**
   * 경험 목록 조회
   */
  async getExperiences(): Promise<any[]> {
    return apiClient.getExperiences();
  }
}

export const experienceApi = new ExperienceApi();
