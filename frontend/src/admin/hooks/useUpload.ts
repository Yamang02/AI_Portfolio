import { useMutation } from '@tanstack/react-query';
import { adminUploadApi } from '../api/adminUploadApi';

type UploadType = 'project' | 'screenshots' | 'skill' | 'profile';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: UploadType }) =>
      adminUploadApi.uploadImage(file, type),
    select: (response) => response.data,
  });
};

export const useUploadImages = () => {
  return useMutation({
    mutationFn: ({ files, type }: { files: File[]; type: UploadType }) =>
      adminUploadApi.uploadImages(files, type),
    select: (response) => response.data,
  });
};

export const useDeleteImage = () => {
  return useMutation({
    mutationFn: (publicId: string) => adminUploadApi.deleteImage(publicId),
  });
};
