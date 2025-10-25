import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card } from 'antd';

interface ProjectMarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const ProjectMarkdownEditor: React.FC<ProjectMarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <div style={{ width: '100%' }}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        preview="edit"
        visibleDragBar={false}
        height={500}
      />
    </div>
  );
};

export default ProjectMarkdownEditor;
