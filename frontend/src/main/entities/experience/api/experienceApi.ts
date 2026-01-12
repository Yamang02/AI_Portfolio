/**
 * Experience API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 경험 API
 */

import { apiClient } from '@/shared/api/apiClient';
import type { Experience, ExperienceFormData } from '../model/experience.types';

class ExperienceApi {

  /**
   * 경험 목록 조회 (Main용)
   */
  async getExperiencesMain(): Promise<any[]> {
    return apiClient.getExperiences();
  }

  /**
   * 관리자용 Experience 목록 조회
   */
  async getExperiences(): Promise<Experience[]> {
    const result = await apiClient.callApi<Experience[]>('/api/admin/experiences');
    return result.data || [];
  }

  /**
   * 관리자용 Experience 상세 조회
   */
  async getExperienceById(id: string): Promise<Experience> {
    const result = await apiClient.callApi<Experience>(`/api/admin/experiences/${id}`);
    return result.data!;
  }

  /**
   * 관리자용 Experience 생성
   */
  async createExperience(data: ExperienceFormData): Promise<Experience> {
    const result = await apiClient.callApi<Experience>('/api/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Experience 수정
   */
  async updateExperience(id: string, data: ExperienceFormData): Promise<Experience> {
    const result = await apiClient.callApi<Experience>(`/api/admin/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Experience 삭제
   */
  async deleteExperience(id: string): Promise<void> {
    await apiClient.callApi<void>(`/api/admin/experiences/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Experience 정렬 순서 일괄 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    await apiClient.callApi<void>('/api/admin/experiences/sort-order', {
      method: 'PATCH',
      body: JSON.stringify(sortOrderUpdates),
    });
  }

  /**
   * Experience 검색
   */
  async searchExperiences(keyword: string): Promise<Experience[]> {
    const result = await apiClient.callApi<Experience[]>(`/api/admin/experiences/search?keyword=${encodeURIComponent(keyword)}`);
    return result.data || [];
  }
}

export const experienceApi = new ExperienceApi();

