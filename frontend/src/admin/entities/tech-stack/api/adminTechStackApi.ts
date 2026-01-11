/**
 * 관리자용 기술 스택 API 클라이언트
 */

import type {
  TechStackMetadata,
  TechStackFormData,
  TechStackProject,
  TechStackSortOrderUpdate
} from '../model/techStack.types';

// 환경 변수에서 API Base URL 가져오기 (staging/production은 절대 경로 필요)
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')  // 빈 문자열 = 상대 경로 사용
  : (import.meta.env?.VITE_API_BASE_URL || '');

class AdminTechStackApi {
  /**
   * 기술 스택 목록 조회
   */
  async getTechStacks(): Promise<TechStackMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 기술 스택 생성
   */
  async createTechStack(data: TechStackFormData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API 호출 중 오류가 발생했습니다.');
    }
  }

  /**
   * 기술 스택 수정
   */
  async updateTechStack(name: string, data: TechStackFormData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/${name}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API 호출 중 오류가 발생했습니다.');
    }
  }

  /**
   * 기술 스택 삭제
   */
  async deleteTechStack(name: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/${name}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API 호출 중 오류가 발생했습니다.');
    }
  }

  /**
   * 기술 스택 정렬 순서 업데이트
   */
  async updateSortOrder(techName: string, newSortOrder: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/${techName}/sort-order`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sortOrder: newSortOrder }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API 호출 중 오류가 발생했습니다.');
    }
  }

  /**
   * 기술 스택의 프로젝트 목록 조회
   */
  async getTechStackProjects(techName: string): Promise<TechStackProject[]> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/${techName}/projects`);
    const data = await response.json();
    return data.data || [];
  }

  /**
   * 기술 스택 검색
   */
  async searchTechStacks(name: string): Promise<TechStackMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API 호출 중 오류가 발생했습니다.');
    }
    const data = await response.json();
    return data.data || [];
  }
}

export const adminTechStackApi = new AdminTechStackApi();
