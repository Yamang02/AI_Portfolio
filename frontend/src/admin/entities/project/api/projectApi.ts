/**
 * Project API 클라이언트
 */
import { Project } from '../model/project.types';

class ProjectApi {
  private baseUrl = '/api/projects';

  /**
   * 전체 프로젝트 목록 조회
   */
  async getProjects(): Promise<Project[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 목록 조회 실패');
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * ID로 프로젝트 조회
   */
  async getProjectById(id: number): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 조회 실패');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * 프로젝트 생성
   */
  async createProject(data: Partial<Project>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 생성 실패');
    }
  }

  /**
   * 프로젝트 수정
   */
  async updateProject(id: number, data: Partial<Project>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 수정 실패');
    }
  }

  /**
   * 프로젝트 삭제
   */
  async deleteProject(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '프로젝트 삭제 실패');
    }
  }
}

export const projectApi = new ProjectApi();

