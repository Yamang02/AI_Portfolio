import type { Experience, ExperienceFormData } from '../model/experience.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class AdminExperienceApi {
  private readonly baseUrl = `${API_BASE_URL}/api/admin/experiences`;

  async getExperiences(): Promise<Experience[]> {
    const response = await fetch(this.baseUrl, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch experiences');
    }
    const result = await response.json();
    return result.data || [];
  }

  async getExperienceById(id: string): Promise<Experience> {
    const response = await fetch(`${this.baseUrl}/${id}`, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch experience');
    }
    const result = await response.json();
    return result.data;
  }

  async createExperience(data: ExperienceFormData): Promise<Experience> {
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
      throw new Error(error.message || 'Failed to create experience');
    }
    const result = await response.json();
    return result.data;
  }

  async updateExperience(id: string, data: ExperienceFormData): Promise<Experience> {
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
      throw new Error(error.message || 'Failed to update experience');
    }
    const result = await response.json();
    return result.data;
  }

  async deleteExperience(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete experience');
    }
  }

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
      throw new Error(error.message || 'Failed to update sort order');
    }
  }

  async searchExperiences(keyword: string): Promise<Experience[]> {
    const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search experiences');
    }
    const result = await response.json();
    return result.data || [];
  }
}

export const adminExperienceApi = new AdminExperienceApi();
