import { Project } from '../model/project.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class ProjectApi {
  private readonly baseUrl = `${API_BASE_URL}/api/projects`;

  async getProjects(): Promise<Project[]> {
    const response = await fetch(this.baseUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch projects');
    }

    const result = await response.json();
    return result.data || [];
  }

  async getProjectById(id: number): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch project');
    }

    const result = await response.json();
    return result.data;
  }

  async createProject(data: Partial<Project>): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create project');
    }
  }

  async updateProject(id: number, data: Partial<Project>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update project');
    }
  }

  async deleteProject(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete project');
    }
  }
}

export const projectApi = new ProjectApi();
