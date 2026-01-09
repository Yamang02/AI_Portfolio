/**
 * Education API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 교육 API
 */

import { apiClient } from '@shared/api/apiClient';
import type { Education, EducationFormData } from '../model/education.types';
import { ApiResponse } from '../../../shared/types/api';

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

class EducationApi {
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
   * 교육 목록 조회 (Main용)
   */
  async getEducation(): Promise<any[]> {
    return apiClient.getEducation();
  }

  /**
   * 관리자용 Education 목록 조회
   */
  async getEducations(): Promise<Education[]> {
    const result = await this.request<Education[]>('/api/admin/educations');
    return result.data || [];
  }

  /**
   * 관리자용 Education 상세 조회
   */
  async getEducationById(id: string): Promise<Education> {
    const result = await this.request<Education>(`/api/admin/educations/${id}`);
    return result.data!;
  }

  /**
   * 관리자용 Education 생성
   */
  async createEducation(data: EducationFormData): Promise<Education> {
    const result = await this.request<Education>('/api/admin/educations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Education 수정
   */
  async updateEducation(id: string, data: EducationFormData): Promise<Education> {
    const result = await this.request<Education>(`/api/admin/educations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Education 삭제
   */
  async deleteEducation(id: string): Promise<void> {
    await this.request<void>(`/api/admin/educations/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Education 정렬 순서 일괄 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    await this.request<void>('/api/admin/educations/sort-order', {
      method: 'PATCH',
      body: JSON.stringify(sortOrderUpdates),
    });
  }

  /**
   * Education 검색
   */
  async searchEducations(keyword: string): Promise<Education[]> {
    const result = await this.request<Education[]>(`/api/admin/educations/search?keyword=${encodeURIComponent(keyword)}`);
    return result.data || [];
  }
}

export const educationApi = new EducationApi();

