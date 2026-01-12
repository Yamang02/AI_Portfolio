// API 클라이언트 - 백엔드 서버와 통신
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

/**
 * 이미지 업로드 API
 * 관리자 API를 사용하여 이미지를 업로드합니다.
 * FormData를 사용하므로 fetch를 직접 사용합니다.
 */
export const uploadApi = {
  /**
   * 단일 이미지 업로드
   * @param request 업로드 요청 (파일, 타입)
   * @returns 업로드된 이미지 URL과 publicId
   */
  uploadImage: async (request: UploadImageRequest): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('type', request.type);

    const url = `${API_BASE_URL}/api/admin/upload/image`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include', // 쿠키 포함 (세션 인증에 필요)
        // FormData를 사용할 때는 Content-Type을 설정하지 않아야 함
        // 브라우저가 자동으로 multipart/form-data와 boundary를 설정함
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        throw new Error(errorMessage);
      }

      const data: ApiResponse<UploadImageResponse> = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || '이미지 업로드에 실패했습니다.');
      }

      return data.data;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('이미지 업로드 중 오류가 발생했습니다.');
    }
  },
};
