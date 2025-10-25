import React, { useState } from 'react';
import { Upload, Button, message, Modal, Image, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useUploadImages, useDeleteImage } from '../../../hooks/useUpload';
import type { UploadFile } from 'antd/es/upload/interface';

interface Screenshot {
  id?: number;
  imageUrl: string;
  cloudinaryPublicId?: string;
  displayOrder: number;
}

interface ProjectScreenshotsUploadProps {
  value?: Screenshot[];
  onChange?: (screenshots: Screenshot[]) => void;
}

const ProjectScreenshotsUpload: React.FC<ProjectScreenshotsUploadProps> = ({ value = [], onChange }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewList, setPreviewList] = useState<string[]>([]);
  const uploadImagesMutation = useUploadImages();
  const deleteImageMutation = useDeleteImage();

  const handleUpload = async (files: File[]) => {
    try {
      const response = await uploadImagesMutation.mutateAsync({ 
        files, 
        type: 'screenshots' 
      });
      
      if (response && response.length > 0) {
        const newScreenshots: Screenshot[] = response.map((url, index) => ({
          imageUrl: url,
          displayOrder: (value?.length || 0) + index + 1,
        }));
        
        onChange?.([...(value || []), ...newScreenshots]);
        message.success(`${files.length}개의 이미지가 업로드되었습니다`);
      }
    } catch (error: any) {
      message.error(error.message || '이미지 업로드에 실패했습니다');
    }
  };

  const handleDelete = async (index: number) => {
    const screenshot = value[index];
    if (!screenshot) return;

    try {
      // Cloudinary publicId 추출
      const publicId = screenshot.cloudinaryPublicId || 
        screenshot.imageUrl.split('/').pop()?.split('.')[0];
      
      if (publicId) {
        await deleteImageMutation.mutateAsync(publicId);
      }
      
      const newScreenshots = value.filter((_, i) => i !== index);
      onChange?.(newScreenshots);
      message.success('이미지가 삭제되었습니다');
    } catch (error: any) {
      message.error(error.message || '이미지 삭제에 실패했습니다');
    }
  };

  const handlePreview = (index: number) => {
    const screenshot = value[index];
    if (screenshot) {
      setPreviewImage(screenshot.imageUrl);
      setPreviewList(value.map(s => s.imageUrl));
      setPreviewVisible(true);
    }
  };

  const customRequest = ({ fileList, onSuccess, onError }: any) => {
    const files = fileList.map((file: any) => file.originFileObj || file);
    handleUpload(files)
      .then(() => onSuccess?.())
      .catch((error) => onError?.(error));
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Upload
          customRequest={customRequest}
          showUploadList={false}
          accept="image/*"
          multiple
        >
          <Button icon={<UploadOutlined />}>스크린샷 추가</Button>
        </Upload>
      </div>

      {value && value.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {value.map((screenshot, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={screenshot.imageUrl}
                alt={`스크린샷 ${index + 1}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9',
                }}
              />
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handlePreview(index)}
                  style={{ flex: 1 }}
                >
                  미리보기
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleDelete(index)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <Image.PreviewGroup>
          {previewList.map((url, index) => (
            <Image
              key={index}
              src={url}
              alt={`스크린샷 ${index + 1}`}
              style={{ width: '100%' }}
            />
          ))}
        </Image.PreviewGroup>
      </Modal>
    </div>
  );
};

export default ProjectScreenshotsUpload;
