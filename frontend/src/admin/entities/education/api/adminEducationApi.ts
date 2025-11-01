/**
 * 관리자용 Education API 클라이언트
 */

import type { Education, EducationFormData } from '../model/education.types';

// 환경 변수에서 API Base URL 가져오기 (staging/production은 절대 경로 필요)
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')  // 빈 문자열 = 상대 경로 사용
  : (import.meta.env?.VITE_API_BASE_URL || '');

class AdminEducationApi {
  private baseUrl = `${API_BASE_URL}/api/admin/educations`;

  /**
   * Education 목록 조회
   */
  async getEducations(): Promise<Education[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Education 목록 조회 실패');
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * Education 상세 조회
   */
  async getEducationById(id: string): Promise<Education> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Education 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Education 생성
   */
  async createEducation(data: EducationFormData): Promise<Education> {
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
      throw new Error(error.message || 'Education 생성 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Education 수정
   */
  async updateEducation(id: string, data: EducationFormData): Promise<Education> {
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
      throw new Error(error.message || 'Education 수정 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Education 삭제
   */
  async deleteEducation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Education 삭제 실패');
    }
  }

  /**
   * Education 정렬 순서 일괄 업데이트
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
   * Education 검색
   */
  async searchEducations(keyword: string): Promise<Education[]> {
    const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Education 검색 실패');
    }

    const result = await response.json();
    return result.data || [];
  }
}

export const adminEducationApi = new AdminEducationApi();
