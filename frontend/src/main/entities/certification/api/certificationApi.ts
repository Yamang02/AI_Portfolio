/**
 * Certification API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 자격증 API
 */

import { apiClient } from '@/shared/api/apiClient';
import type { Certification, CertificationFormData } from '../model/certification.types';

class CertificationApi {

  /**
   * 자격증 목록 조회 (Main용)
   */
  async getCertificationsMain(): Promise<any[]> {
    return apiClient.getCertifications();
  }

  /**
   * 관리자용 Certification 목록 조회
   */
  async getCertifications(): Promise<Certification[]> {
    const result = await apiClient.callApi<Certification[]>('/api/admin/certifications');
    return result.data || [];
  }

  /**
   * 관리자용 Certification 상세 조회
   */
  async getCertificationById(id: string): Promise<Certification> {
    const result = await apiClient.callApi<Certification>(`/api/admin/certifications/${id}`);
    return result.data!;
  }

  /**
   * 카테고리별 Certification 조회
   */
  async getCertificationsByCategory(category: string): Promise<Certification[]> {
    const result = await apiClient.callApi<Certification[]>(`/api/admin/certifications/category/${category}`);
    return result.data || [];
  }

  /**
   * 만료된 Certification 조회
   */
  async getExpiredCertifications(): Promise<Certification[]> {
    const result = await apiClient.callApi<Certification[]>('/api/admin/certifications/expired');
    return result.data || [];
  }

  /**
   * 곧 만료될 Certification 조회
   */
  async getExpiringSoonCertifications(): Promise<Certification[]> {
    const result = await apiClient.callApi<Certification[]>('/api/admin/certifications/expiring-soon');
    return result.data || [];
  }

  /**
   * 관리자용 Certification 생성
   */
  async createCertification(data: CertificationFormData): Promise<void> {
    await apiClient.callApi<void>('/api/admin/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 관리자용 Certification 수정
   */
  async updateCertification(id: string, data: CertificationFormData): Promise<void> {
    await apiClient.callApi<void>(`/api/admin/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 관리자용 Certification 삭제
   */
  async deleteCertification(id: string): Promise<void> {
    await apiClient.callApi<void>(`/api/admin/certifications/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Certification 정렬 순서 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    await apiClient.callApi<void>('/api/admin/certifications/sort-order', {
      method: 'PATCH',
      body: JSON.stringify(sortOrderUpdates),
    });
  }
}

export const certificationApi = new CertificationApi();

