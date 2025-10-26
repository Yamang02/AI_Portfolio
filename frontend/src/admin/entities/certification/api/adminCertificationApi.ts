/**
 * Admin Certification API Client
 *
 * 책임: 백엔드 REST API와 통신
 */

import { Certification, CertificationFormData } from '../model/certification.types';

class AdminCertificationApi {
  private baseUrl = '/api/admin/certifications';

  /**
   * 전체 Certification 목록 조회
   */
  async getCertifications(): Promise<Certification[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Certification 목록 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * ID로 Certification 조회
   */
  async getCertificationById(id: string): Promise<Certification> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Certification 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 카테고리별 Certification 조회
   */
  async getCertificationsByCategory(category: string): Promise<Certification[]> {
    const response = await fetch(`${this.baseUrl}/category/${category}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '카테고리별 Certification 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 만료된 Certification 조회
   */
  async getExpiredCertifications(): Promise<Certification[]> {
    const response = await fetch(`${this.baseUrl}/expired`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '만료된 Certification 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 곧 만료될 Certification 조회
   */
  async getExpiringSoonCertifications(): Promise<Certification[]> {
    const response = await fetch(`${this.baseUrl}/expiring-soon`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '곧 만료될 Certification 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Certification 생성
   */
  async createCertification(data: CertificationFormData): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Certification 생성 실패');
    }
  }

  /**
   * Certification 수정
   */
  async updateCertification(id: string, data: CertificationFormData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Certification 수정 실패');
    }
  }

  /**
   * Certification 삭제
   */
  async deleteCertification(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Certification 삭제 실패');
    }
  }

  /**
   * Certification 정렬 순서 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sort-order`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sortOrderUpdates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '정렬 순서 업데이트 실패');
    }
  }
}

export const adminCertificationApi = new AdminCertificationApi();
