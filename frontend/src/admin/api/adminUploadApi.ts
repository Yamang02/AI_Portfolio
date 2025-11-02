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
      let errorMessage = `HTTP ${response.status}`;
      let errorData: any = {};
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.data?.message || errorMessage;
        
        // 특정 상태 코드에 대한 사용자 친화적인 메시지
        if (response.status === 413) {
          errorMessage = '파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.';
        } else if (response.status === 400 && errorData.data) {
          errorMessage = errorData.data || errorMessage;
        }
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
        if (response.status === 413) {
          errorMessage = '파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.';
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async uploadImage(
    file: File, 
    type: 'project' | 'screenshots' | 'skill' | 'profile',
    projectId?: string
  ): Promise<ApiResponse<ImageUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (projectId) {
      formData.append('projectId', projectId);
    }

    return this.request<ImageUploadResponse>('/api/admin/upload/image', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadImages(
    files: File[], 
    type: 'project' | 'screenshots' | 'skill' | 'profile',
    projectId?: string
  ): Promise<ApiResponse<string[]>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', type);
    if (projectId) {
      formData.append('projectId', projectId);
    }

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
