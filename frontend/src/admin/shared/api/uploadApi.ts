import { adminUploadApi } from './adminUploadApi';

export interface UploadImageRequest {
  file: File;
  type: 'profile' | 'project' | 'article-thumbnail' | 'article-content' | 'screenshots' | 'skill';
}

export interface UploadImageResponse {
  url: string;
  publicId: string;
}

export const uploadApi = {
  uploadImage: async (request: UploadImageRequest): Promise<UploadImageResponse> => {
    const response = await adminUploadApi.uploadImage(
      request.file,
      request.type,
      undefined
    );
    return response.data as UploadImageResponse;
  },
};
