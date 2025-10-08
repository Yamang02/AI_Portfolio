import React from 'react';
import { MarkdownRenderer } from '../../shared/components/Markdown';
import { Project } from '../../entities/project/types';

interface ProjectDetailContentProps {
  content: string;
  project: Project;
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({
  content,
  project
}) => {
  // 마크다운 컨텐츠가 있는지 확인
  const hasMarkdown = content && content.trim().length > 0;
  
  if (!hasMarkdown) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500 py-8">
          <div className="text-lg mb-2">📝</div>
          <p>프로젝트 상세 내용이 없습니다.</p>
          <p className="text-sm mt-2">곧 추가될 예정입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <MarkdownRenderer 
        content={content}
        className="max-w-none prose prose-gray max-w-none"
      />
    </div>
  );
};

export default ProjectDetailContent;


