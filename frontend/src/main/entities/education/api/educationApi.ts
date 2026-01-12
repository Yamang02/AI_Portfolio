/**
 * Education API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 교육 API
 */

import { apiClient } from '@/shared/api/apiClient';
import type { Education, EducationFormData } from '../model/education.types';

class EducationApi {

  /**
   * 교육 목록 조회 (Main용)
   */
  async getEducation(): Promise<any[]> {
    return apiClient.getEducation();
  }

  /**
   * 관리자용 Education 목록 조회
   */
  async getEducations(): Promise<Education[]> {
    const result = await apiClient.callApi<Education[]>('/api/admin/educations');
    return result.data || [];
  }

  /**
   * 관리자용 Education 상세 조회
   */
  async getEducationById(id: string): Promise<Education> {
    const result = await apiClient.callApi<Education>(`/api/admin/educations/${id}`);
    return result.data!;
  }

  /**
   * 관리자용 Education 생성
   */
  async createEducation(data: EducationFormData): Promise<Education> {
    const result = await apiClient.callApi<Education>('/api/admin/educations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Education 수정
   */
  async updateEducation(id: string, data: EducationFormData): Promise<Education> {
    const result = await apiClient.callApi<Education>(`/api/admin/educations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Education 삭제
   */
  async deleteEducation(id: string): Promise<void> {
    await apiClient.callApi<void>(`/api/admin/educations/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Education 정렬 순서 일괄 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    await apiClient.callApi<void>('/api/admin/educations/sort-order', {
      method: 'PATCH',
      body: JSON.stringify(sortOrderUpdates),
    });
  }

  /**
   * Education 검색
   */
  async searchEducations(keyword: string): Promise<Education[]> {
    const result = await apiClient.callApi<Education[]>(`/api/admin/educations/search?keyword=${encodeURIComponent(keyword)}`);
    return result.data || [];
  }
}

export const educationApi = new EducationApi();

