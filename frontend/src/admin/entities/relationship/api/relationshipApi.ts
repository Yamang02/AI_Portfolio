import type {
  ProjectRelationshipRequest,
  TechStackRelationshipRequest,
} from '../model/relationship.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class RelationshipApi {
  private readonly baseUrl = `${API_BASE_URL}/api/admin`;

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: 'include',
      ...init,
    });

    if (!response.ok) {
      let message = 'Request failed';
      try {
        const error = await response.json();
        message = error.message || message;
      } catch {
        message = `HTTP ${response.status}`;
      }
      throw new Error(message);
    }

    const result = await response.json();
    return (result.data ?? []) as T;
  }

  async getExperienceTechStacks(experienceId: string): Promise<any[]> {
    return this.request<any[]>(`/experiences/${experienceId}/tech-stacks`);
  }

  async addExperienceTechStack(experienceId: string, request: TechStackRelationshipRequest): Promise<void> {
    await this.request<void>(`/experiences/${experienceId}/tech-stacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteExperienceTechStack(experienceId: string, techStackId: number): Promise<void> {
    await this.request<void>(`/experiences/${experienceId}/tech-stacks/${techStackId}`, {
      method: 'DELETE',
    });
  }

  async updateExperienceTechStacks(experienceId: string, request: any): Promise<void> {
    await this.request<void>(`/experiences/${experienceId}/tech-stacks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async getExperienceProjects(experienceId: string): Promise<any[]> {
    return this.request<any[]>(`/experiences/${experienceId}/projects`);
  }

  async addExperienceProject(experienceId: string, request: ProjectRelationshipRequest): Promise<void> {
    await this.request<void>(`/experiences/${experienceId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteExperienceProject(experienceId: string, projectId: number): Promise<void> {
    await this.request<void>(`/experiences/${experienceId}/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async updateExperienceProjects(experienceId: string, request: any): Promise<void> {
    await this.request<void>(`/experiences/${experienceId}/projects`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async getEducationTechStacks(educationId: string): Promise<any[]> {
    return this.request<any[]>(`/educations/${educationId}/tech-stacks`);
  }

  async addEducationTechStack(educationId: string, request: TechStackRelationshipRequest): Promise<void> {
    await this.request<void>(`/educations/${educationId}/tech-stacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteEducationTechStack(educationId: string, techStackId: number): Promise<void> {
    await this.request<void>(`/educations/${educationId}/tech-stacks/${techStackId}`, {
      method: 'DELETE',
    });
  }

  async updateEducationTechStacks(educationId: string, request: any): Promise<void> {
    await this.request<void>(`/educations/${educationId}/tech-stacks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async getEducationProjects(educationId: string): Promise<any[]> {
    return this.request<any[]>(`/educations/${educationId}/projects`);
  }

  async addEducationProject(educationId: string, request: ProjectRelationshipRequest): Promise<void> {
    await this.request<void>(`/educations/${educationId}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteEducationProject(educationId: string, projectId: number): Promise<void> {
    await this.request<void>(`/educations/${educationId}/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async updateEducationProjects(educationId: string, request: any): Promise<void> {
    await this.request<void>(`/educations/${educationId}/projects`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async getProjectTechStacks(projectId: string): Promise<any[]> {
    return this.request<any[]>(`/projects/${projectId}/tech-stacks`);
  }

  async addProjectTechStack(projectId: string, request: TechStackRelationshipRequest): Promise<void> {
    await this.request<void>(`/projects/${projectId}/tech-stacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteProjectTechStack(projectId: string, techStackId: number): Promise<void> {
    await this.request<void>(`/projects/${projectId}/tech-stacks/${techStackId}`, {
      method: 'DELETE',
    });
  }

  async updateProjectTechStacks(projectId: string, request: any): Promise<void> {
    await this.request<void>(`/projects/${projectId}/tech-stacks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }
}

export const relationshipApi = new RelationshipApi();
