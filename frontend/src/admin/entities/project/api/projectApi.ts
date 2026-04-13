import { Project } from '../model/project.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class ProjectApi {
  private readonly baseUrl = `${API_BASE_URL}/api/admin/projects`;

  private async parseError(response: Response): Promise<Error> {
    try {
      const body = await response.json();
      const message =
        body?.message ??
        body?.error ??
        `HTTP ${response.status}`;
      return new Error(message);
    } catch {
      return new Error(`HTTP ${response.status}`);
    }
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      credentials: 'include',
      ...init,
    });

    if (!response.ok) {
      throw await this.parseError(response);
    }

    const result = await response.json();
    if (result && typeof result === 'object' && 'success' in result && result.success === false) {
      const message = result.message || result.error || '요청 처리 중 오류가 발생했습니다.';
      throw new Error(message);
    }

    return result.data ?? result;
  }

  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>(this.baseUrl);
  }

  async getProjectById(id: string): Promise<Project> {
    return this.request<Project>(`${this.baseUrl}/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<void> {
    await this.request<void>(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    await this.request<void>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    await this.request<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const projectApi = new ProjectApi();
