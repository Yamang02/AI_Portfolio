/**
 * Certification API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 자격증 API
 */

import { apiClient } from '@shared/api/apiClient';
import type { Certification, CertificationFormData } from '../model/certification.types';
import { ApiResponse } from '../../../shared/types/api';

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

class CertificationApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  }

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
    const result = await this.request<Certification[]>('/api/admin/certifications');
    return result.data || [];
  }

  /**
   * 관리자용 Certification 상세 조회
   */
  async getCertificationById(id: string): Promise<Certification> {
    const result = await this.request<Certification>(`/api/admin/certifications/${id}`);
    return result.data!;
  }

  /**
   * 카테고리별 Certification 조회
   */
  async getCertificationsByCategory(category: string): Promise<Certification[]> {
    const result = await this.request<Certification[]>(`/api/admin/certifications/category/${category}`);
    return result.data || [];
  }

  /**
   * 만료된 Certification 조회
   */
  async getExpiredCertifications(): Promise<Certification[]> {
    const result = await this.request<Certification[]>('/api/admin/certifications/expired');
    return result.data || [];
  }

  /**
   * 곧 만료될 Certification 조회
   */
  async getExpiringSoonCertifications(): Promise<Certification[]> {
    const result = await this.request<Certification[]>('/api/admin/certifications/expiring-soon');
    return result.data || [];
  }

  /**
   * 관리자용 Certification 생성
   */
  async createCertification(data: CertificationFormData): Promise<void> {
    await this.request<void>('/api/admin/certifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 관리자용 Certification 수정
   */
  async updateCertification(id: string, data: CertificationFormData): Promise<void> {
    await this.request<void>(`/api/admin/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 관리자용 Certification 삭제
   */
  async deleteCertification(id: string): Promise<void> {
    await this.request<void>(`/api/admin/certifications/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Certification 정렬 순서 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    await this.request<void>('/api/admin/certifications/sort-order', {
      method: 'PATCH',
      body: JSON.stringify(sortOrderUpdates),
    });
  }
}

export const certificationApi = new CertificationApi();

