import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { formatDateRange, safeSplit } from '@shared/utils/safeStringUtils';
import { GithubIcon, ExternalLinkIcon } from '@shared/ui/icon';
import { TechStackList } from '@shared/ui';
import { useCardHover } from '@shared/hooks';

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
  const { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } = useCardHover(
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
            <span className="text-gray-700 dark:text-slate-300">({parts[1]})</span>
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
      className={`group bg-surface dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 flex flex-col border border-border hover:shadow-primary-200 dark:hover:shadow-primary-900/50 cursor-pointer ${isHighlighted ? 'ring-4 ring-primary-200 dark:ring-primary-800 shadow-primary-200 dark:shadow-primary-900/50' : ''}`}
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
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {/* 상단 이미지/아이콘 영역 */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 dark:from-slate-700 to-gray-100 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* 배지들 */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 items-end">
          {/* 팀/개인 배지 */}
          <div
            className={`px-1.5 py-1 rounded-md shadow-lg backdrop-blur-sm text-xs font-medium flex items-center gap-1.5 transition-all duration-200 overflow-hidden ${project.isTeam ? 'bg-blue-100/90 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-700/50' : 'bg-purple-100/90 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 border border-purple-200/50 dark:border-purple-700/50'} w-auto max-w-[24px] group-hover:max-w-[56px]`}
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
              className={`px-1.5 py-1 rounded-md shadow-lg backdrop-blur-sm text-xs font-medium flex items-center gap-1.5 transition-all duration-200 overflow-hidden ${
                project.type === 'BUILD' ? 'bg-red-100/90 dark:bg-red-900/80 text-red-800 dark:text-red-200 border border-red-200/50 dark:border-red-700/50' :
                project.type === 'LAB' ? 'bg-orange-100/90 dark:bg-orange-900/80 text-orange-800 dark:text-orange-200 border border-orange-200/50 dark:border-orange-700/50' :
                project.type === 'MAINTENANCE' ? 'bg-green-100/90 dark:bg-green-900/80 text-green-800 dark:text-green-200 border border-green-200/50 dark:border-green-700/50' : 'bg-surface-elevated/90 dark:bg-slate-700/90 text-text-primary border border-border backdrop-blur-sm'
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
        <div className={`fallback-icon ${hasValidImage ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 dark:from-slate-700 to-gray-100 dark:to-slate-800`}>
          <span className="inline-block w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-gray-600 dark:text-slate-300 text-3xl font-bold shadow">
            📁
          </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-extrabold text-text-primary mb-4 leading-tight truncate" title={project.title}>
          {formatTitle(project.title)}
        </h3>
        <div className="border-b border-border mb-6"></div>
        <p className="text-text-secondary mb-6 text-sm flex-grow leading-relaxed min-h-[72px]">{project.description}</p>

        {/* 기술 스택 (TechStackList 컴포넌트 사용) */}
        <TechStackList
          technologies={project.technologies}
          maxVisible={3}
          variant="default"
          size="sm"
          className="mb-4"
        />

        {/* 하단 정보 */}
        <div className="pt-4 border-t border-border mt-auto flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {formatDateRange(project.startDate, project.endDate)}
          </span>
          <div className="flex items-center gap-2">
            {project.githubUrl && project.githubUrl !== '#' && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-md bg-surface-elevated dark:bg-slate-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 hover:!bg-purple-200 dark:hover:!bg-purple-700/70 flex items-center justify-center transition-colors duration-200 text-text-muted dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300"
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
                className="w-8 h-8 rounded-md bg-surface-elevated dark:bg-slate-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 hover:!bg-green-200 dark:hover:!bg-green-700/70 flex items-center justify-center transition-colors duration-200 text-text-muted dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 hover:text-green-600 dark:hover:text-green-300"
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

export { ProjectCard }; 