import React from 'react';
import { Project } from '../types';
import { safeFormatDate } from '../../../shared/utils/safeStringUtils';
import {
  DefaultProjectIcon,
  CodeIcon,
  WebIcon,
  DesktopIcon,
  AIIcon,
  ExperienceIcon,
  GithubIcon,
  ExternalLinkIcon,
  ProjectBadge,
  ExperienceBadge,
  ExperienceSmallIcon
} from '../../../shared/components/icons/ProjectIcons';
import { safeSplit, safeToLowerCase, safeIncludes } from '../../../shared/utils/safeStringUtils';

interface ProjectCardProps {
  project: Project;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHighlighted?: boolean;
  onLongHover?: (id: string) => void;
  onClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onMouseEnter, 
  onMouseLeave, 
  isHighlighted,
  onLongHover,
  onClick
}) => {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    onMouseEnter?.();
    timerRef.current = setTimeout(() => {
      onLongHover?.(project.id);
    }, 500);
  };

  const handleMouseLeave = () => {
    onMouseLeave?.();
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // 프로젝트 타입에 따른 아이콘 선택
  const getProjectIcon = () => {
    const title = safeToLowerCase(project.title);
    const description = safeToLowerCase(project.description);
    if (safeIncludes(title, 'ai') || safeIncludes(title, '챗봇') || safeIncludes(title, 'chatbot') || safeIncludes(description, 'ai') || safeIncludes(description, 'gemini')) {
      return <AIIcon />;
    } else if (safeIncludes(title, 'pyqt') || safeIncludes(title, '파일') || safeIncludes(title, 'file') || safeIncludes(description, '데스크톱') || safeIncludes(description, 'gui')) {
      return <DesktopIcon />;
    } else if (safeIncludes(title, '갤러리') || safeIncludes(title, '전시') || safeIncludes(title, 'art') || safeIncludes(description, '전시')) {
      return <DefaultProjectIcon />;
    } else if (safeIncludes(title, '웹') || safeIncludes(title, 'web') || safeIncludes(title, '사이트') || safeIncludes(description, '웹')) {
      return <WebIcon />;
    } else {
      return <CodeIcon />;
    }
  };

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

  // 프로젝트 타입에 따른 배지
  const getProjectBadge = () => {
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">프로젝트</span>;
  };

  // 프로젝트 타입에 따른 기술 스택 스타일
  const getTechStackStyle = () => {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // 프로젝트 타입에 따른 링크 스타일
  const getLinkStyle = () => {
    return 'text-gray-800 hover:text-black';
  };

  // 기술스택 축약 로직
  const renderTechStack = () => {
    const max = 3;
    const techs = project.technologies;
    const shown = techs.slice(0, max);
    const hiddenCount = techs.length - max;
    return (
      <>
        {shown.map((tech, idx) => (
          <span key={tech} className="inline-block text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-100 text-gray-800 border-gray-200">
            {tech}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-200 text-gray-600 border-gray-300">
            +{hiddenCount}
          </span>
        )}
      </>
    );
  };

  // 이미지 URL이 유효한지 확인
  const hasValidImage = project.imageUrl && project.imageUrl !== '#' && project.imageUrl !== '';

  return (
    <div 
      id={`project-${project.id}`}
      className={`bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 flex flex-col border border-gray-100 hover:shadow-blue-200 ${isHighlighted ? 'ring-4 ring-blue-200 shadow-blue-200' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick?.(project)}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {/* 상단 이미지/아이콘 영역 */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* 팀/개인 배지 */}
        <span
          className={`absolute top-3 right-3 px-3 py-1 text-sm font-bold rounded-md shadow z-10 ${project.isTeam ? 'bg-blue-600 text-white' : 'bg-primary-600 text-white'}`}
          title={project.isTeam ? `팀 프로젝트${project.role ? ` - ${project.role}` : ''}` : '개인 프로젝트'}
        >
          {project.isTeam ? '팀' : '개인'}
        </span>
        
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
            {getProjectIcon()}
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
        <div className="mb-4 flex flex-wrap gap-2">
          {renderTechStack()}
        </div>
        {/* 역할 정보 (팀 프로젝트인 경우) */}
        {project.isTeam && project.role && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              🏆 {project.role}
            </span>
          </div>
        )}
        {/* 하단 정보 */}
        <div className="pt-4 border-t border-gray-200 mt-auto flex items-center justify-between gap-6">
          <span className="text-xs text-gray-500">
            {safeFormatDate(project.startDate)} ~ {project.endDate ? safeFormatDate(project.endDate) : '현재'}
          </span>
          <div className="flex items-center space-x-2">
            {project.githubUrl && project.githubUrl !== '#' && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center space-x-1 ${getLinkStyle()} hover:underline`}
              >
                <GithubIcon />
                <span>GitHub</span>
              </a>
            )}
            {project.liveUrl && project.liveUrl !== '#' && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center space-x-1 ${getLinkStyle()} hover:underline`}
              >
                <ExternalLinkIcon />
                <span>Live</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 