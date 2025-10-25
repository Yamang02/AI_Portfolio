import { ApiResponse } from '../../shared/types/api';

export interface ImageUploadResponse {
  url: string;
  publicId: string;
}

// 개발 환경에서는 상대 경로로 호출하여 Vite 프록시를 통해 동일 출처 쿠키를 사용
const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.DEV
  ? (import.meta.env.VITE_API_BASE_URL || '')  // 빈 문자열 = 상대 경로 사용
  : (import.meta.env?.VITE_API_BASE_URL || '');

class AdminUploadApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async uploadImage(file: File, type: 'project' | 'screenshots' | 'skill' | 'profile'): Promise<ApiResponse<ImageUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<ImageUploadResponse>('/api/admin/upload/image', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadImages(files: File[], type: 'project' | 'screenshots' | 'skill' | 'profile'): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', type);

    return this.request<string[]>('/api/admin/upload/images', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteImage(publicId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/upload/image/${publicId}`, {
      method: 'DELETE',
    });
  }
}

export const adminUploadApi = new AdminUploadApi();
