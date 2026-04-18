import type { Education, EducationFormData } from '../model/education.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class AdminEducationApi {
  private readonly baseUrl = `${API_BASE_URL}/api/admin/educations`;

  async getEducations(): Promise<Education[]> {
    const response = await fetch(this.baseUrl, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch educations');
    }
    const result = await response.json();
    return result.data || [];
  }

  async getEducationById(id: string): Promise<Education> {
    const response = await fetch(`${this.baseUrl}/${id}`, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch education');
    }
    const result = await response.json();
    return result.data;
  }

  async createEducation(data: EducationFormData): Promise<Education> {
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
      throw new Error(error.message || 'Failed to create education');
    }
    const result = await response.json();
    return result.data;
  }

  async updateEducation(id: string, data: EducationFormData): Promise<Education> {
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
      throw new Error(error.message || 'Failed to update education');
    }
    const result = await response.json();
    return result.data;
  }

  async deleteEducation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete education');
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

  async searchEducations(keyword: string): Promise<Education[]> {
    const response = await fetch(`${this.baseUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search educations');
    }
    const result = await response.json();
    return result.data || [];
  }
}

export const adminEducationApi = new AdminEducationApi();
