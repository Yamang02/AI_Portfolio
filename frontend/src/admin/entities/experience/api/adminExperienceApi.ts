/**
 * 관리자용 Experience API 클라이언트
 */

import type { Experience, ExperienceFormData } from '../model/experience.types';

class AdminExperienceApi {
  private baseUrl = '/api/admin/experiences';

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
  async createExperience(data: ExperienceFormData): Promise<void> {
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
  }

  /**
   * Experience 수정
   */
  async updateExperience(id: string, data: ExperienceFormData): Promise<void> {
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
