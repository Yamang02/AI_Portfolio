import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { formatDateRange } from '../../../shared/utils/safeStringUtils';
import { getProjectIcon } from '../../../shared/utils/projectIconMapper';
import { GithubIcon, ExternalLinkIcon } from '../../../shared/components/icons/ProjectIcons';
import { TechStackList } from '../../../shared/components/TechStack';
import { useCardHover } from '../../../shared/hooks';
import { safeSplit } from '../../../shared/utils/safeStringUtils';

interface ProjectCardProps {
  project: Project;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHighlighted?: boolean;
  onLongHover?: (id: string) => void;
  onClick?: (project: Project) => void;
}

// 홈페이지 스크롤 위치 저장 (HomePage와 공유)
declare global {
  interface Window {
    __homeScrollPosition?: number;
  }
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onMouseEnter,
  onMouseLeave,
  isHighlighted,
  onLongHover,
  onClick
}) => {
  const navigate = useNavigate();

  // 공통 hover 로직 사용
  const { handleMouseEnter, handleMouseLeave } = useCardHover(
    project.id,
    onMouseEnter,
    onMouseLeave,
    onLongHover
  );

  // 프로젝트명 줄바꿈 처리
  const formatTitle = (title: string) => {
    const parts = safeSplit(title, /[()]/);
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          {parts[1] && (
            <span className="text-gray-700">({parts[1]})</span>
          )}
          {parts[2] && parts[2]}
        </>
      );
    }
    return title || '';
  };

  // 이미지 URL이 유효한지 확인
  const hasValidImage = project.imageUrl && project.imageUrl !== '#' && project.imageUrl !== '';

  return (
    <div
      id={`project-${project.id}`}
      className={`group bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 flex flex-col border border-gray-100 hover:shadow-blue-200 cursor-pointer ${isHighlighted ? 'ring-4 ring-blue-200 shadow-blue-200' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (onClick) {
          onClick(project);
        } else {
          // navigate 전에 스크롤 위치를 전역 변수에 저장
          window.__homeScrollPosition = window.pageYOffset;
          navigate(`/projects/${project.id}`);
        }
      }}
      style={{ cursor: onClick ? 'pointer' : undefined, backgroundColor: '#ffffff' }}
    >
      {/* 상단 이미지/아이콘 영역 */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* 배지들 */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 items-end">
          {/* 팀/개인 배지 */}
          <div
            className={`px-1.5 py-1 rounded-md shadow text-xs font-medium flex items-center gap-1.5 transition-all duration-200 overflow-hidden ${project.isTeam ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} w-auto max-w-[24px] group-hover:max-w-[56px]`}
          >
            <div className="flex-shrink-0 w-3 h-3">
              {project.isTeam ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>
            <span className="opacity-0 transition-opacity duration-200 whitespace-nowrap group-hover:opacity-100">
              {project.isTeam ? '팀' : '개인'}
            </span>
          </div>

          {/* 프로젝트 타입 배지 */}
          {project.type && (
            <div
              className={`px-1.5 py-1 rounded-md shadow text-xs font-medium flex items-center gap-1.5 transition-all duration-200 overflow-hidden ${
                project.type === 'BUILD' ? 'bg-red-100 text-red-800' :
                project.type === 'LAB' ? 'bg-orange-100 text-orange-800' :
                project.type === 'MAINTENANCE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              } w-auto max-w-[24px] group-hover:max-w-[120px]`}
            >
              <div className="flex-shrink-0 w-3 h-3">
                {project.type === 'BUILD' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ) : project.type === 'LAB' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                ) : project.type === 'MAINTENANCE' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>
              <span className="opacity-0 transition-opacity duration-200 whitespace-nowrap group-hover:opacity-100">
                {project.type === 'BUILD' ? 'BUILD' :
                 project.type === 'LAB' ? 'LAB' :
                 project.type === 'MAINTENANCE' ? 'MAINTENANCE' : project.type}
              </span>
            </div>
          )}
        </div>
        
        {/* 이미지가 있으면 이미지 표시, 없으면 아이콘 표시 */}
        {hasValidImage ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 아이콘으로 대체
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const iconContainer = target.parentElement?.querySelector('.fallback-icon');
              if (iconContainer) {
                iconContainer.classList.remove('hidden');
              }
            }}
          />
        ) : null}
        
        {/* 아이콘 (이미지가 없거나 로드 실패 시 표시) */}
        <div className={`fallback-icon ${hasValidImage ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}>
          <span className="inline-block w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-3xl font-bold shadow">
            {getProjectIcon(project.title, project.description)}
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight truncate" title={project.title}>
          {formatTitle(project.title)}
        </h3>
        <div className="border-b border-gray-200 mb-6"></div>
        <p className="text-gray-600 mb-6 text-sm flex-grow leading-relaxed min-h-[72px]">{project.description}</p>

        {/* 기술 스택 (TechStackList 컴포넌트 사용) */}
        <TechStackList
          technologies={project.technologies}
          maxVisible={3}
          variant="default"
          size="sm"
          className="mb-4"
        />

        {/* 하단 정보 */}
        <div className="pt-4 border-t border-gray-200 mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatDateRange(project.startDate, project.endDate)}
          </span>
          <div className="flex items-center gap-2">
            {project.githubUrl && project.githubUrl !== '#' && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-md bg-white group-hover:bg-purple-100 hover:!bg-purple-200 flex items-center justify-center transition-colors duration-200 text-gray-400 group-hover:text-purple-600"
                title="GitHub 저장소"
                onClick={(e) => e.stopPropagation()}
              >
                <GithubIcon />
              </a>
            )}
            {project.liveUrl && project.liveUrl !== '#' && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-md bg-white group-hover:bg-green-100 hover:!bg-green-200 flex items-center justify-center transition-colors duration-200 text-gray-400 group-hover:text-green-600"
                title="Live 서비스"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLinkIcon />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 