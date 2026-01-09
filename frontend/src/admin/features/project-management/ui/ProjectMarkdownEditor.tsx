import React from 'react';
import { MarkdownEditor } from '../../../shared/ui/markdown/MarkdownEditor';

interface ProjectMarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

const ProjectMarkdownEditor: React.FC<ProjectMarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <MarkdownEditor value={value} onChange={onChange} preview="edit" height={500} />
  );
};

export { ProjectMarkdownEditor };
