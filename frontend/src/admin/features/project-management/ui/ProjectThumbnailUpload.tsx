import React, { useState } from 'react';
import { Upload, Image, Button, message, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useUploadImage, useDeleteImage } from '../../../hooks/useUpload';
import type { UploadFile } from 'antd/es/upload/interface';

interface ProjectThumbnailUploadProps {
  value?: string;
  onChange?: (url: string) => void;
}

const ProjectThumbnailUpload: React.FC<ProjectThumbnailUploadProps> = ({ value, onChange }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();

  const handleUpload = async (file: File) => {
    try {
      const response = await uploadImageMutation.mutateAsync({ 
        file, 
        type: 'project' 
      });
      
      if (response && response.url) {
        onChange?.(response.url);
        message.success('이미지가 업로드되었습니다');
      }
    } catch (error: any) {
      message.error(error.message || '이미지 업로드에 실패했습니다');
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    try {
      // Cloudinary publicId 추출
      const publicId = value.split('/').pop()?.split('.')[0];
      if (publicId) {
        await deleteImageMutation.mutateAsync(publicId);
      }
      onChange?.('');
      message.success('이미지가 삭제되었습니다');
    } catch (error: any) {
      message.error(error.message || '이미지 삭제에 실패했습니다');
    }
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const customRequest = ({ file, onSuccess, onError }: any) => {
    handleUpload(file as File)
      .then(() => onSuccess?.())
      .catch((error) => onError?.(error));
  };

  return (
    <div>
      {value ? (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={value}
              alt="썸네일"
              style={{
                width: '200px',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
              }}
            />
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
              }}
              onClick={handlePreview}
            >
              미리보기
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Upload
              customRequest={customRequest}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>이미지 변경</Button>
            </Upload>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              삭제
            </Button>
          </div>
        </div>
      ) : (
        <Upload
          customRequest={customRequest}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>이미지 업로드</Button>
        </Upload>
      )}

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        {value && <img src={value} alt="썸네일 미리보기" style={{ width: '100%' }} />}
      </Modal>
    </div>
  );
};

export default ProjectThumbnailUpload;
