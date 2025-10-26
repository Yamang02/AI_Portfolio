/**
 * Relationship API 클라이언트
 */

import type { 
  TechStackRelationshipRequest, 
  ProjectRelationshipRequest 
} from '../model/relationship.types';

// API 클래스
class RelationshipApi {
  private baseUrl = '/api/admin';

  // ==================== 기술스택 관계 ====================

  /**
   * Experience 기술스택 관계 조회
   */
  async getExperienceTechStacks(experienceId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/experiences/${experienceId}/tech-stacks`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('기술스택 관계 조회 실패');
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * Experience 기술스택 관계 추가
   */
  async addExperienceTechStack(
    experienceId: string, 
    request: TechStackRelationshipRequest
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/experiences/${experienceId}/tech-stacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '기술스택 관계 추가 실패');
    }
  }

  /**
   * Experience 기술스택 관계 삭제
   */
  async deleteExperienceTechStack(experienceId: string, techStackId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/experiences/${experienceId}/tech-stacks/${techStackId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '기술스택 관계 삭제 실패');
    }
  }

  // ==================== 프로젝트 관계 ====================

  /**
   * Experience 프로젝트 관계 조회
   */
  async getExperienceProjects(experienceId: string): Promise<any[]> {
    const url = `${this.baseUrl}/experiences/${experienceId}/projects`;
    console.log('Fetching projects from:', url);
    
    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to fetch projects:', response.status, response.statusText);
      throw new Error('프로젝트 관계 조회 실패');
    }

    const result = await response.json();
    console.log('Projects API response:', result);
    return result.data || [];
  }

  /**
   * Experience 프로젝트 관계 추가
   */
  async addExperienceProject(
    experienceId: string,
    request: ProjectRelationshipRequest
  ): Promise<void> {
    console.log('Adding experience project relationship:', { experienceId, request });

    const response = await fetch(`${this.baseUrl}/experiences/${experienceId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 관계 추가 실패');
    }
  }

  /**
   * Experience 프로젝트 관계 삭제
   */
  async deleteExperienceProject(experienceId: string, projectId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/experiences/${experienceId}/projects/${projectId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 관계 삭제 실패');
    }
  }

  // ==================== Education 관계 ====================
  
  async getEducationTechStacks(educationId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/educations/${educationId}/tech-stacks`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('기술스택 관계 조회 실패');
    }

    const result = await response.json();
    return result.data || [];
  }

  async addEducationTechStack(
    educationId: string,
    request: TechStackRelationshipRequest
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/educations/${educationId}/tech-stacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '기술스택 관계 추가 실패');
    }
  }

  async deleteEducationTechStack(educationId: string, techStackId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/educations/${educationId}/tech-stacks/${techStackId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '기술스택 관계 삭제 실패');
    }
  }

  async getEducationProjects(educationId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/educations/${educationId}/projects`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('프로젝트 관계 조회 실패');
    }

    const result = await response.json();
    return result.data || [];
  }

  async addEducationProject(
    educationId: string,
    request: ProjectRelationshipRequest
  ): Promise<void> {
    console.log('Adding education project relationship:', { educationId, request });

    const response = await fetch(`${this.baseUrl}/educations/${educationId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 관계 추가 실패');
    }
  }

  async deleteEducationProject(educationId: string, projectId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/educations/${educationId}/projects/${projectId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 관계 삭제 실패');
    }
  }
}

export const relationshipApi = new RelationshipApi();

