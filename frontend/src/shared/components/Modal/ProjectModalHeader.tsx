import React from 'react';
import { Project } from '../../../features/projects/types';

interface ProjectModalHeaderProps {
  project: Project;
  className?: string;
}

const ProjectModalHeader: React.FC<ProjectModalHeaderProps> = ({
  project,
  className = ''
}) => {
  return (
    <header className={`sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 relative ${className}`}>

      {/* 제목 - 가운데 정렬 */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 break-words leading-tight">
          {project.title}
        </h1>
      </div>

    </header>
  );
};

export default ProjectModalHeader;
