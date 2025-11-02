/**
 * 교육 API 클라이언트
 */

import { apiClient } from '../../../../shared/api/apiClient';

class EducationApi {
  /**
   * 교육 목록 조회
   */
  async getEducation(): Promise<any[]> {
    return apiClient.getEducation();
  }
}

export const educationApi = new EducationApi();
