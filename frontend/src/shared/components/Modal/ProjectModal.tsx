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
          {/* 헤더: 제목, 기간, 카테고리, 상태 */}
          <div className="w-full mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center break-words leading-tight">{project.title}</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm text-gray-600">
              <span>📅 {project.startDate} ~ {project.endDate || '현재'}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.isTeam ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {project.isTeam ? '팀 프로젝트' : '개인 프로젝트'}
              </span>
              {project.status && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {project.status === 'completed' ? '완료' :
                   project.status === 'in_progress' ? '진행중' :
                   project.status === 'maintenance' ? '유지보수' : project.status}
                </span>
              )}
            </div>
          </div>

          {/* 이미지 갤러리: 메인 이미지 + screenshots 배열 */}
          {(project.imageUrl || (project.screenshots && project.screenshots.length > 0)) && (
            <div className="w-full mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.imageUrl && project.imageUrl !== '#' && (
                  <div className="col-span-1 md:col-span-2">
                    <img
                      src={project.imageUrl}
                      alt={`${project.title} 메인 이미지`}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {project.screenshots && project.screenshots.map((screenshot, index) => (
                  <div key={index} className="col-span-1">
                    <img
                      src={screenshot}
                      alt={`${project.title} 스크린샷 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-center mb-8 text-base max-w-xl">{project.description}</p>

          {/* 팀 프로젝트인 경우 역할/기여도 표시 */}
          {project.isTeam && (project.role || (project.myContributions && project.myContributions.length > 0)) && (
            <div className="w-full mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 text-center">🤝 팀 프로젝트 기여도</h3>
              {project.role && (
                <div className="mb-3 text-center">
                  <span className="text-sm font-medium text-blue-700">담당 역할: </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {project.role}
                  </span>
                </div>
              )}
              {project.myContributions && project.myContributions.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-blue-700 mb-2 text-center">주요 기여:</div>
                  <ul className="space-y-1">
                    {project.myContributions.map((contribution, index) => (
                      <li key={index} className="text-sm text-blue-800 text-center">
                        • {contribution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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