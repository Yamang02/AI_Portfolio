/**
 * 자격증 API 클라이언트
 */

import { apiClient } from '../../../../shared/api/apiClient';

class CertificationApi {
  /**
   * 자격증 목록 조회
   */
  async getCertifications(): Promise<any[]> {
    return apiClient.getCertifications();
  }
}

export const certificationApi = new CertificationApi();
