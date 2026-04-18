import type {
  TechStackFormData,
  TechStackMetadata,
  TechStackProject,
} from '../model/techStack.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class AdminTechStackApi {
  async getTechStacks(): Promise<TechStackMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack`);
    const data = await response.json();
    return data.data || [];
  }

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
      throw new Error(errorData.message || 'API call failed.');
    }
  }

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
      throw new Error(errorData.message || 'API call failed.');
    }
  }

  async deleteTechStack(name: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/${name}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API call failed.');
    }
  }

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
      throw new Error(errorData.message || 'API call failed.');
    }
  }

  async getTechStackProjects(techName: string): Promise<TechStackProject[]> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/${techName}/projects`);
    const data = await response.json();
    return data.data || [];
  }

  async searchTechStacks(name: string): Promise<TechStackMetadata[]> {
    const response = await fetch(`${API_BASE_URL}/api/tech-stack/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API call failed.');
    }
    const data = await response.json();
    return data.data || [];
  }
}

export const adminTechStackApi = new AdminTechStackApi();
