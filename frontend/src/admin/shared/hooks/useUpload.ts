import { useMutation } from '@tanstack/react-query';
import { adminUploadApi } from '../api/adminUploadApi';

type UploadType = 'project' | 'screenshots' | 'skill' | 'profile';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async ({ file, type, projectId }: { file: File; type: UploadType; projectId?: string }) => {
      const response = await adminUploadApi.uploadImage(file, type, projectId);
      return response.data;
    },
  });
};

export const useUploadImages = () => {
  return useMutation({
    mutationFn: async ({ files, type, projectId }: { files: File[]; type: UploadType; projectId?: string }) => {
      const response = await adminUploadApi.uploadImages(files, type, projectId);
      return response.data;
    },
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: (publicId: string) => adminUploadApi.deleteImage(publicId),
  });
};
