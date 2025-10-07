import React from 'react';
import { MarkdownRenderer } from '../Markdown';

interface ProjectModalContentProps {
  content: string;
  className?: string;
}

const ProjectModalContent: React.FC<ProjectModalContentProps> = ({
  content,
  className = ''
}) => {
  // 마크다운 컨텐츠가 있는지 확인
  const hasMarkdown = content && content.trim().length > 0;
  
  if (!hasMarkdown) {
    return (
      <div className={`flex-1 p-8 ${className}`}>
        <div className="text-center text-gray-500 py-12">
          <div className="text-lg mb-2">📝</div>
          <p>프로젝트 상세 내용이 없습니다.</p>
          <p className="text-sm mt-2">곧 추가될 예정입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto ${className}`}>
      <div className="p-8">
        <MarkdownRenderer 
          content={content}
          className="max-w-none"
        />
      </div>
    </div>
  );
};

export default ProjectModalContent;
