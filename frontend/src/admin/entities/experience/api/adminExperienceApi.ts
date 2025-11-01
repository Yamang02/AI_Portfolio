/**
 * 관리자용 Experience API 클라이언트
 */

import type { Experience, ExperienceFormData } from '../model/experience.types';

// 환경 변수에서 API Base URL 가져오기 (staging/production은 절대 경로 필요)
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')  // 빈 문자열 = 상대 경로 사용
  : (import.meta.env?.VITE_API_BASE_URL || '');

class AdminExperienceApi {
  private baseUrl = `${API_BASE_URL}/api/admin/experiences`;

  /**
   * Experience 목록 조회
   */
  async getExperiences(): Promise<Experience[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Experience 목록 조회 실패');
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * Experience 상세 조회
   */
  async getExperienceById(id: string): Promise<Experience> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Experience 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Experience 생성
   */
  async createExperience(data: ExperienceFormData): Promise<Experience> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Experience 생성 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Experience 수정
   */
  async updateExperience(id: string, data: ExperienceFormData): Promise<Experience> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Experience 수정 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Experience 삭제
   */
  async deleteExperience(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Experience 삭제 실패');
    }
  }

  /**
   * Experience 정렬 순서 일괄 업데이트
   */
  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sort-order`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(sortOrderUpdates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '정렬 순서 업데이트 실패');
    }
  }

  /**
   * Experience 검색
   */
  async searchExperiences(keyword: string): Promise<Experience[]> {
    const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Experience 검색 실패');
    }

    const result = await response.json();
    return result.data || [];
  }
}

export const adminExperienceApi = new AdminExperienceApi();
