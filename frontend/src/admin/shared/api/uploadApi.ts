const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface UploadImageRequest {
  file: File;
  type: 'profile' | 'project' | 'article-thumbnail' | 'article-content' | 'screenshots' | 'skill';
}

export interface UploadImageResponse {
  url: string;
  publicId: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const uploadApi = {
  uploadImage: async (request: UploadImageRequest): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('type', request.type);

    const url = `${API_BASE_URL}/api/admin/upload/image`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Keep fallback message when body is not JSON.
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse<UploadImageResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || '이미지 업로드에 실패했습니다.');
      }

      return data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('이미지 업로드 중 오류가 발생했습니다.');
    }
  },
};
