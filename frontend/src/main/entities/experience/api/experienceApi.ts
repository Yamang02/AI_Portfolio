/**
 * Experience API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 경험 API
 */

import { apiClient } from '@shared/api/apiClient';
import type { Experience, ExperienceFormData } from '../model/experience.types';
import { ApiResponse } from '../../../shared/types/api';

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

class ExperienceApi {
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
   * 경험 목록 조회 (Main용)
   */
  async getExperiencesMain(): Promise<any[]> {
    return apiClient.getExperiences();
  }

  /**
   * 관리자용 Experience 목록 조회
   */
  async getExperiences(): Promise<Experience[]> {
    const result = await this.request<Experience[]>('/api/admin/experiences');
    return result.data || [];
  }

  /**
   * 관리자용 Experience 상세 조회
   */
  async getExperienceById(id: string): Promise<Experience> {
    const result = await this.request<Experience>(`/api/admin/experiences/${id}`);
    return result.data!;
  }

  /**
   * 관리자용 Experience 생성
   */
  async createExperience(data: ExperienceFormData): Promise<Experience> {
    const result = await this.request<Experience>('/api/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Experience 수정
   */
  async updateExperience(id: string, data: ExperienceFormData): Promise<Experience> {
    const result = await this.request<Experience>(`/api/admin/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data!;
  }

  /**
   * 관리자용 Experience 삭제
   */
  async deleteExperience(id: string): Promise<void> {
    await this.request<void>(`/api/admin/experiences/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Experience 정렬 순서 일괄 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    await this.request<void>('/api/admin/experiences/sort-order', {
      method: 'PATCH',
      body: JSON.stringify(sortOrderUpdates),
    });
  }

  /**
   * Experience 검색
   */
  async searchExperiences(keyword: string): Promise<Experience[]> {
    const result = await this.request<Experience[]>(`/api/admin/experiences/search?keyword=${encodeURIComponent(keyword)}`);
    return result.data || [];
  }
}

export const experienceApi = new ExperienceApi();

