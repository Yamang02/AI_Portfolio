import React, { useState, useRef, useCallback } from 'react';
import MDEditor, { commands, ICommand } from '@uiw/react-md-editor';
import { uploadApi } from '@/shared/api/upload-api';
import { message } from 'antd';

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  preview?: 'edit' | 'live' | 'preview';
  enableImageUpload?: boolean; // 이미지 업로드 기능 활성화 여부
}

/**
 * Admin 공통 Markdown Editor
 * - 세션 쿠키 기반 Admin에서 마크다운 콘텐츠 편집에 재사용
 * - 라이브러리: @uiw/react-md-editor
 * - 이미지 업로드 기능 지원 (enableImageUpload=true일 때)
 * - 드래그 앤 드롭 및 클립보드 붙여넣기 지원
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  preview,
  enableImageUpload = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  /**
   * 이미지 업로드 및 마크다운 삽입 공통 함수
   */
  const uploadAndInsertImage = useCallback(async (file: File, insertPosition?: number) => {
    try {
      setUploading(true);

      // 현재 커서 위치 또는 지정된 위치에 업로드 중 표시
      const currentText = value || '';
      const position = insertPosition !== undefined ? insertPosition : currentText.length;
      const uploadingText = `\n![업로드 중: ${file.name}...]()\n`;
      const newText = currentText.slice(0, position) + uploadingText + currentText.slice(position);
      
      onChange?.(newText);

      // 이미지 업로드
      const { url } = await uploadApi.uploadImage({
        file,
        type: 'article-content',
      });

      // 업로드 중 텍스트를 실제 이미지 마크다운으로 교체
      const imageMarkdown = `\n![${file.name}](${url})\n`;
      const finalText = newText.replace(uploadingText, imageMarkdown);
      
      onChange?.(finalText);
      message.success('이미지가 업로드되었습니다.');
    } catch (error: any) {
      console.error('Image upload failed:', error);
      message.error(error?.message || '이미지 업로드에 실패했습니다.');
      
      // 업로드 실패 시 업로드 중 텍스트 제거
      const currentText = value || '';
      const cleanedText = currentText.replace(
        new RegExp(`\\n!\\[업로드 중: ${file.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\.\\.\\]\\(\\)\\n`, 'g'),
        ''
      );
      onChange?.(cleanedText);
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  // 드래그 앤 드롭 핸들러
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!enableImageUpload) return;

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) return;

    // 다중 이미지 업로드
    for (const file of files) {
      await uploadAndInsertImage(file);
    }
  }, [enableImageUpload, uploadAndInsertImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (enableImageUpload) {
      setIsDragging(true);
    }
  }, [enableImageUpload]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // 자식 요소로 이동한 경우는 무시
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  // 클립보드 붙여넣기 핸들러
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    if (!enableImageUpload) return;

    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));

    if (imageItems.length === 0) return;

    e.preventDefault();

    // 다중 이미지 업로드
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (file) {
        await uploadAndInsertImage(file);
      }
    }
  }, [enableImageUpload, uploadAndInsertImage]);

  // 이미지 업로드 커스텀 명령어
  const imageUploadCommand: ICommand = {
    name: 'image-upload',
    keyCommand: 'image-upload',
    buttonProps: { 'aria-label': 'Upload image', title: '이미지 업로드' },
    icon: (
      <svg viewBox="0 0 16 16" width="12px" height="12px" fill="currentColor">
        <path d="M14 5H2v9h12V5zM2 4c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H2z" />
        <path d="M4 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM13.5 12h-11l3-4 2 2 2-3 4 5z" />
      </svg>
    ),
    execute: async (state, api) => {
      // 파일 선택 다이얼로그 생성
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          input.remove();
          return;
        }

        if (file) {
          await uploadAndInsertImage(file, state.selection.start);
        }
        input.remove();
      };

      document.body.appendChild(input);
      input.click();
    },
  };

  // 기본 명령어에 이미지 업로드 명령어 추가
  const customCommands = enableImageUpload
    ? [
        ...commands.getCommands(),
        commands.divider,
        imageUploadCommand,
      ]
    : commands.getCommands();

  return (
    <div
      ref={editorRef}
      style={{ 
        width: '100%', 
        position: 'relative',
        border: isDragging ? '2px dashed var(--color-primary)' : 'none',
        borderRadius: isDragging ? '8px' : '0',
        backgroundColor: isDragging ? 'rgba(95, 144, 112, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onPaste={handlePaste}
    >
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        preview={preview}
        height={height}
        commands={customCommands}
        visibleDragBar={false}
      />
      {uploading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid var(--color-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span>이미지 업로드 중...</span>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

