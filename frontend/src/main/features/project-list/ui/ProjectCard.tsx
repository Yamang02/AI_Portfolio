import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../entities/project';
import { formatDateRange } from '../../../../shared/lib/string/stringUtils';
import { GithubIcon, ExternalLinkIcon } from '../../../../shared/ui/icon/ProjectIcons';
import { TechStackList } from '../../../entities/tech-stack';
import { useCardHover } from '../../../../shared/hooks';
import { safeSplit } from '../../../../shared/lib/string/stringUtils';

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
          <br />
          <span className="text-gray-500">({parts[1]})</span>
        </>
      );
    }
    return title;
  };

  // 프로젝트 클릭 핸들러
  const handleProjectClick = () => {
    // 홈페이지 스크롤 위치 저장
    if (typeof window !== 'undefined') {
      window.__homeScrollPosition = window.scrollY;
    }
    
    if (onClick) {
      onClick(project);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  // 링크 클릭 핸들러 (이벤트 전파 방지)
  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isHighlighted ? 'ring-2 ring-blue-500 shadow-xl' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleProjectClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleProjectClick();
        }
      }}
    >
      {/* 프로젝트 이미지 */}
      <div className="h-48 w-full overflow-hidden bg-gray-100">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-sm">이미지 없음</div>
            </div>
          </div>
        )}
      </div>

      {/* 프로젝트 정보 */}
      <div className="p-6">
        {/* 프로젝트 제목 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {formatTitle(project.title)}
        </h3>

        {/* 구분선 */}
        <div className="border-b border-gray-200 mb-4"></div>

        {/* 프로젝트 설명 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* 프로젝트 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {/* 프로젝트 타입 */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.type === 'BUILD' 
                ? 'bg-green-100 text-green-800' 
                : project.type === 'LAB'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {project.type === 'BUILD' ? '개발' : project.type === 'LAB' ? '실험' : '유지보수'}
            </span>

            {/* 팀/개인 프로젝트 */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.isTeam 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {project.isTeam ? '팀' : '개인'}
            </span>
          </div>

          {/* 프로젝트 기간 */}
          {project.startDate && (
            <span className="text-xs">
              {formatDateRange(project.startDate, project.endDate)}
            </span>
          )}
        </div>

        {/* 기술 스택 */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <TechStackList
              technologies={project.technologies.filter(tech => tech && tech.name).map(tech => tech.name)}
              maxVisible={4}
              variant="compact"
              size="sm"
            />
          </div>
        )}

        {/* 링크 버튼들 */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {project.githubUrl && (
              <button
                onClick={(e) => handleLinkClick(e, project.githubUrl!)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="GitHub 저장소"
              >
                <GithubIcon />
                <span className="text-xs">코드</span>
              </button>
            )}
            
            {project.liveUrl && (
              <button
                onClick={(e) => handleLinkClick(e, project.liveUrl!)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="라이브 데모"
              >
                <ExternalLinkIcon />
                <span className="text-xs">데모</span>
              </button>
            )}
          </div>

          {/* 프로젝트 상태 */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            project.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : project.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status === 'completed' ? '완료' : 
             project.status === 'in_progress' ? '진행중' : '유지보수'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
