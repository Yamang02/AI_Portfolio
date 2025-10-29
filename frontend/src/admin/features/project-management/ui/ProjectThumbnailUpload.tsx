import React, { useState } from 'react';
import { Upload, Image, Button, message, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useUploadImage, useDeleteImage } from '../../../hooks/useUpload';
import type { UploadFile } from 'antd/es/upload/interface';

interface ProjectThumbnailUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  projectId?: string;
}

const ProjectThumbnailUpload: React.FC<ProjectThumbnailUploadProps> = ({ 
  value, 
  onChange,
  projectId
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();

  // 파일 크기 제한: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      message.error(`파일 크기가 너무 큽니다. (${fileSizeMB}MB / 최대 10MB)`);
      return false;
    }
    return true;
  };

  const handleUpload = async (file: File) => {
    // 파일 크기 검증
    if (!validateFileSize(file)) {
      return;
    }
    try {
      const response = await uploadImageMutation.mutateAsync({ 
        file, 
        type: 'project',
        projectId: projectId
      });
      
      if (response && response.url) {
        onChange?.(response.url);
        
        // 백엔드에서 자동으로 DB에 저장하므로 성공 메시지만 표시
        if (projectId && projectId !== 'new') {
          message.success('이미지가 업로드되어 DB에 저장되었습니다');
        } else {
          message.success('이미지가 업로드되었습니다');
        }
      }
    } catch (error: any) {
      // 에러 메시지가 이미 사용자 친화적으로 처리되어 있을 수 있음
      const errorMessage = error.message || '이미지 업로드에 실패했습니다';
      
      // 파일 크기 제한 관련 에러인지 확인
      if (errorMessage.includes('크기가') || errorMessage.includes('크기') || errorMessage.includes('413')) {
        message.error(errorMessage);
      } else {
        message.error(`${errorMessage} 다시 시도해주세요.`);
      }
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

export { ProjectThumbnailUpload };
