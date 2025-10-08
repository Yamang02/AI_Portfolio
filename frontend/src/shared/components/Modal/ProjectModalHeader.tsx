import React from 'react';
import { Project } from '../../../features/projects/types';

interface ProjectModalHeaderProps {
  project: Project;
  onClose: () => void;
  className?: string;
}

const ProjectModalHeader: React.FC<ProjectModalHeaderProps> = ({
  project,
  onClose,
  className = ''
}) => {
  return (
    <header className={`sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 relative ${className}`}>
      {/* 닫기 버튼 - 절대 위치로 고정 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-6 text-gray-400 hover:text-gray-600 text-2xl p-1 transition-colors flex-shrink-0 z-20"
        aria-label="닫기"
      >
        ×
      </button>

      {/* 제목 - 가운데 정렬 */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 break-words leading-tight">
          {project.title}
        </h1>
      </div>

      {/* 핵심 메타데이터 - 가운데 정렬 */}
      <div className="flex flex-wrap gap-2 items-center justify-center mb-4">
        <span className="text-sm text-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {project.startDate} ~ {project.endDate || '현재'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.isTeam ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {project.isTeam ? '팀 프로젝트' : '개인 프로젝트'}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          project.type === 'BUILD' ? 'bg-red-100 text-red-800' :
          project.type === 'LAB' ? 'bg-orange-100 text-orange-800' :
          project.type === 'MAINTENANCE' ? 'bg-green-100 text-green-800' :
          project.type === 'certification' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {project.type === 'BUILD' ? 'BUILD' :
           project.type === 'LAB' ? 'LAB' :
           project.type === 'MAINTENANCE' ? 'MAINTENANCE' :
           project.type === 'certification' ? '자격증' : project.type}
        </span>
        {project.status && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {project.status === 'completed' ? '완료' :
             project.status === 'in_progress' ? '진행중' :
             project.status === 'maintenance' ? '유지보수' : project.status}
          </span>
        )}
      </div>

      {/* 메인 이미지만 (스크린샷은 사이드바로 이동) */}
      {project.imageUrl && project.imageUrl !== '#' && (
        <div className="mb-0">
          <img
            src={project.imageUrl}
            alt={`${project.title} 메인 이미지`}
            className="w-full h-48 object-cover rounded-lg shadow-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
    </header>
  );
};

export default ProjectModalHeader;
