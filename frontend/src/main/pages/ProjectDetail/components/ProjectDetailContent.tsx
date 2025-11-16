import React from 'react';
import { MarkdownRenderer } from '../../../components/common/Markdown';
import { Project } from '@features/project-gallery/types';

interface ProjectDetailContentProps {
  content: string;
  project: Project;
  className?: string;
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({
  content,
  className = ''
}) => {
  // 마크다운 컨텐츠가 있는지 확인
  const hasMarkdown = content && content.trim().length > 0;
  
  if (!hasMarkdown) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-text-muted py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2 text-text-primary">프로젝트 상세 내용이 없습니다</h3>
          <p className="text-sm text-text-secondary">곧 추가될 예정입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* 마크다운 컨텐츠 */}
      <div className="prose prose-lg max-w-none">
        <MarkdownRenderer 
          content={content}
          className="max-w-none"
        />
      </div>
    </div>
  );
};

export { ProjectDetailContent };
