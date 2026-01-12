/**
 * 기술 스택 API 클라이언트
 * Main과 Admin에서 공통으로 사용하는 기술 스택 API
 */

import { apiClient } from '@/shared/api/apiClient';
import type {
  TechStack,
  TechStackMetadata,
  TechStackFormData,
  TechStackCreateRequest,
  TechStackUpdateRequest,
  TechStackFilter,
  TechStackProject,
  TechStackSortOrderUpdate
} from '../model/tech-stack.types';

class TechStackApi {

  /**
   * 기술 스택 목록 조회 (Main용)
   */
  async getTechStacks(): Promise<TechStack[]> {
    return apiClient.getTechStacks();
  }

  /**
   * 핵심 기술 스택 조회 (Main용)
   */
  async getCoreTechStacks(): Promise<TechStack[]> {
    return apiClient.getCoreTechStacks();
  }

  /**
   * 기술 스택 이름으로 조회 (Main용)
   */
  async getTechStackByName(name: string): Promise<TechStack> {
    return apiClient.getTechStackByName(name);
  }

  /**
   * 카테고리별 기술 스택 조회 (Main용)
   */
  async getTechStacksByCategory(category: string): Promise<TechStack[]> {
    return apiClient.getTechStacksByCategory(category);
  }

  /**
   * 관리자용 기술 스택 목록 조회
   */
  async getAdminTechStacks(): Promise<TechStackMetadata[]> {
    const response = await apiClient.callApi<TechStackMetadata[]>(`/api/tech-stack`);
    return response.data || [];
  }

  /**
   * 관리자용 기술 스택 생성
   */
  async createTechStack(data: TechStackFormData): Promise<void> {
    await apiClient.callApi<void>('/api/tech-stack', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 관리자용 기술 스택 수정
   */
  async updateTechStack(name: string, data: TechStackFormData): Promise<void> {
    await apiClient.callApi<void>(`/api/tech-stack/${name}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * 관리자용 기술 스택 삭제
   */
  async deleteTechStack(name: string): Promise<void> {
    await apiClient.callApi<void>(`/api/tech-stack/${name}`, {
      method: 'DELETE',
    });
  }

  /**
   * 기술 스택 정렬 순서 업데이트
   */
  async updateSortOrder(techName: string, newSortOrder: number): Promise<void> {
    await apiClient.callApi<void>(`/api/tech-stack/${techName}/sort-order`, {
      method: 'PATCH',
      body: JSON.stringify({ sortOrder: newSortOrder }),
    });
  }

  /**
   * 기술 스택의 프로젝트 목록 조회
   */
  async getTechStackProjects(techName: string): Promise<TechStackProject[]> {
    const response = await apiClient.callApi<TechStackProject[]>(`/api/tech-stack/${techName}/projects`);
    return response.data || [];
  }
}

export const techStackApi = new TechStackApi();

