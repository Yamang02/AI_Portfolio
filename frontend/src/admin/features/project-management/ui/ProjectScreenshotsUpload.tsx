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
  projectId?: string;
}

const ProjectScreenshotsUpload: React.FC<ProjectScreenshotsUploadProps> = ({ 
  value = [], 
  onChange,
  projectId
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewList, setPreviewList] = useState<string[]>([]);
  const uploadImagesMutation = useUploadImages();
  const deleteImageMutation = useDeleteImage();

  // 파일 크기 제한: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const validateFileSizes = (files: File[]): boolean => {
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => {
        const fileSizeMB = (f.size / (1024 * 1024)).toFixed(2);
        return `${f.name} (${fileSizeMB}MB)`;
      }).join(', ');
      message.error(`다음 파일들의 크기가 너무 큽니다: ${fileNames} (최대 10MB)`);
      return false;
    }
    return true;
  };

  const handleUpload = async (files: File[]) => {
    // 파일 크기 검증
    if (!validateFileSizes(files)) {
      return;
    }
    try {
      const response = await uploadImagesMutation.mutateAsync({ 
        files, 
        type: 'screenshots',
        projectId: projectId
      });
      
      if (response && response.length > 0) {
        const newScreenshots: Screenshot[] = response.map((url, index) => ({
          imageUrl: url,
          displayOrder: (value?.length || 0) + index + 1,
        }));
        
        const updatedScreenshots = [...(value || []), ...newScreenshots];
        onChange?.(updatedScreenshots);
        
        // 백엔드에서 자동으로 DB에 저장하므로 성공 메시지만 표시
        if (projectId && projectId !== 'new') {
          message.success(`${files.length}개의 이미지가 업로드되어 DB에 저장되었습니다`);
        } else {
          message.success(`${files.length}개의 이미지가 업로드되었습니다`);
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

  const handleBeforeUpload = (file: File, fileList: File[]) => {
    // 모든 파일이 추가되었을 때만 업로드 실행
    return false; // 자동 업로드 방지
  };

  const handleFileChange = (info: any) => {
    const { fileList } = info;

    // 모든 파일이 추가된 경우
    if (fileList.length > 0 && fileList.every((f: any) => f.originFileObj)) {
      const files = fileList.map((f: any) => f.originFileObj);
      handleUpload(files);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Upload
          beforeUpload={handleBeforeUpload}
          onChange={handleFileChange}
          showUploadList={false}
          accept="image/*"
          multiple
          fileList={[]}
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

export { ProjectScreenshotsUpload };
