import React from 'react';
import { Project } from '../../../features/projects/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, project }) => {
  if (!isOpen || !project) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg shadow-lg w-full min-w-[320px] max-w-3xl mx-4 relative animate-fadeIn">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="닫기"
        >
          ×
        </button>
        <div className="p-10 flex flex-col items-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center break-words leading-tight">{project.title}</h2>
          <p className="text-gray-600 text-center mb-8 text-base max-w-xl">{project.description}</p>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {project.technologies.map(tech => (
                <span key={tech} className="px-3 py-1.5 min-w-[70px] rounded-full border bg-gray-100 text-gray-800 border-gray-200 text-xs font-medium text-center">
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="flex justify-center gap-4 mt-4">
            {/* 사이트 바로가기(liveUrl) */}
            <a
              href={project.liveUrl && project.liveUrl !== '#' ? project.liveUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-4 py-2 rounded transition-colors text-sm font-medium ${project.liveUrl && project.liveUrl !== '#' ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              tabIndex={project.liveUrl && project.liveUrl !== '#' ? 0 : -1}
              aria-disabled={!(project.liveUrl && project.liveUrl !== '#')}
              title={project.liveUrl && project.liveUrl !== '#' ? '배포된 사이트로 이동' : '미배포 프로젝트 또는 liveUrl이 없는 프로젝트'}
            >
              사이트 바로가기
            </a>
            {/* GitHub */}
            <a
              href={project.githubUrl && project.githubUrl !== '#' ? project.githubUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-4 py-2 rounded transition-colors text-sm font-medium ${project.githubUrl && project.githubUrl !== '#' ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              tabIndex={project.githubUrl && project.githubUrl !== '#' ? 0 : -1}
              aria-disabled={!(project.githubUrl && project.githubUrl !== '#')}
              title={project.githubUrl && project.githubUrl !== '#' ? 'GitHub 저장소로 이동' : 'GitHub URL이 없는 프로젝트'}
            >
              GitHub
            </a>
            {/* Portfolio (externalUrl) */}
            <a
              href={project.externalUrl && project.externalUrl !== '#' ? project.externalUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-4 py-2 rounded transition-colors text-sm font-medium ${project.externalUrl && project.externalUrl !== '#' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              tabIndex={project.externalUrl && project.externalUrl !== '#' ? 0 : -1}
              aria-disabled={!(project.externalUrl && project.externalUrl !== '#')}
              title={project.externalUrl && project.externalUrl !== '#' ? '외부 포트폴리오로 이동' : '외부 포트폴리오가 없습니다. 궁금한 점은 AI 챗봇에게 문의하거나, 개발자에게 메일로 문의해 주세요.'}
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal; 