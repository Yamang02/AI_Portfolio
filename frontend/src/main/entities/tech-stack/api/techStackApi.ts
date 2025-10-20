/**
 * 기술 스택 API 클라이언트
 */

import { apiClient } from '../../../../shared/api/apiClient';
import type { 
  TechStack, 
  TechStackCreateRequest, 
  TechStackUpdateRequest, 
  TechStackFilter 
} from './techStack.types';

class TechStackApi {
  /**
   * 기술 스택 목록 조회
   */
  async getTechStacks(): Promise<TechStack[]> {
    return apiClient.getTechStacks();
  }

  /**
   * 핵심 기술 스택 조회
   */
  async getCoreTechStacks(): Promise<TechStack[]> {
    return apiClient.getCoreTechStacks();
  }

  /**
   * 기술 스택 이름으로 조회
   */
  async getTechStackByName(name: string): Promise<TechStack> {
    return apiClient.getTechStackByName(name);
  }

  /**
   * 카테고리별 기술 스택 조회
   */
  async getTechStacksByCategory(category: string): Promise<TechStack[]> {
    return apiClient.getTechStacksByCategory(category);
  }
}

export const techStackApi = new TechStackApi();
