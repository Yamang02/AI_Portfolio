import { Certification, CertificationFormData } from '../model/certification.types';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

class AdminCertificationApi {
  private readonly baseUrl = `${API_BASE_URL}/api/admin/certifications`;

  async getCertifications(): Promise<Certification[]> {
    const response = await fetch(this.baseUrl, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certifications');
    }
    const result = await response.json();
    return result.data;
  }

  async getCertificationById(id: string): Promise<Certification> {
    const response = await fetch(`${this.baseUrl}/${id}`, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certification');
    }
    const result = await response.json();
    return result.data;
  }

  async getCertificationsByCategory(category: string): Promise<Certification[]> {
    const response = await fetch(`${this.baseUrl}/category/${category}`, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch certifications by category');
    }
    const result = await response.json();
    return result.data;
  }

  async getExpiredCertifications(): Promise<Certification[]> {
    const response = await fetch(`${this.baseUrl}/expired`, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch expired certifications');
    }
    const result = await response.json();
    return result.data;
  }

  async getExpiringSoonCertifications(): Promise<Certification[]> {
    const response = await fetch(`${this.baseUrl}/expiring-soon`, { credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch expiring certifications');
    }
    const result = await response.json();
    return result.data;
  }

  async createCertification(data: CertificationFormData): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create certification');
    }
  }

  async updateCertification(id: string, data: CertificationFormData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update certification');
    }
  }

  async deleteCertification(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete certification');
    }
  }

  async updateSortOrder(sortOrderUpdates: Record<string, number>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sort-order`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sortOrderUpdates),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update sort order');
    }
  }
}

export const adminCertificationApi = new AdminCertificationApi();
