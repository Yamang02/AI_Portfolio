import React from 'react';
import MDEditor from '@uiw/react-md-editor';

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  preview?: 'edit' | 'live' | 'preview';
}

/**
 * Admin 공통 Markdown Editor
 * - 세션 쿠키 기반 Admin에서 마크다운 콘텐츠 편집에 재사용
 * - 라이브러리: @uiw/react-md-editor
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = 500,
  preview = 'edit',
}) => {
  return (
    <div style={{ width: '100%' }}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        preview={preview}
        height={height}
      />
    </div>
  );
};

