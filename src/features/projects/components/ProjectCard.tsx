import React from 'react';
import { Project } from '../types';
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

interface ProjectCardProps {
  project: Project;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  // 프로젝트 타입에 따른 아이콘 선택
  const getProjectIcon = () => {
    // 경험인 경우 특별한 아이콘 사용
    if (project.type === 'experience') {
      return <ExperienceIcon />;
    }
    
    const title = project.title.toLowerCase();
    const description = project.description.toLowerCase();
    
    if (title.includes('ai') || title.includes('챗봇') || title.includes('chatbot') || description.includes('ai') || description.includes('gemini')) {
      return <AIIcon />;
    } else if (title.includes('pyqt') || title.includes('파일') || title.includes('file') || description.includes('데스크톱') || description.includes('gui')) {
      return <DesktopIcon />;
    } else if (title.includes('갤러리') || title.includes('전시') || title.includes('art') || description.includes('전시')) {
      return <DefaultProjectIcon />;
    } else if (title.includes('웹') || title.includes('web') || title.includes('사이트') || description.includes('웹')) {
      return <WebIcon />;
    } else {
      return <CodeIcon />;
    }
  };

  // 프로젝트명 줄바꿈 처리
  const formatTitle = (title: string) => {
    // 괄호나 특수문자 기준으로 줄바꿈
    const parts = title.split(/[()]/);
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          {parts[1] && (
            <span className={project.type === 'experience' ? 'text-orange-600' : 'text-primary-600'}>
              ({parts[1]})
            </span>
          )}
          {parts[2] && parts[2]}
        </>
      );
    }
    return title;
  };

  // 프로젝트 타입에 따른 배지
  const getProjectBadge = () => {
    if (project.type === 'project') {
      return <ProjectBadge />;
    } else {
      return <ExperienceBadge />;
    }
  };

  // 프로젝트 타입에 따른 기술 스택 스타일
  const getTechStackStyle = () => {
    if (project.type === 'experience') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-primary-100 text-primary-800 border-primary-200';
  };

  // 프로젝트 타입에 따른 링크 스타일
  const getLinkStyle = () => {
    if (project.type === 'experience') {
      return 'text-orange-600 hover:text-orange-800';
    }
    return 'text-primary-600 hover:text-primary-800';
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col border border-gray-100"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 이미지 영역 */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* 프로젝트 타입 배지 */}
        {getProjectBadge()}
        
        {project.imageUrl && project.imageUrl !== '#' ? (
          <img 
            className="h-full w-full object-cover" 
            src={project.imageUrl} 
            alt={project.title}
            onError={(e) => {
              // 이미지 로드 실패 시 기본 아이콘 표시
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${project.imageUrl && project.imageUrl !== '#' ? 'hidden' : ''}`}>
          {getProjectIcon()}
        </div>
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight truncate" title={project.title}>
          {formatTitle(project.title)}
        </h3>
        <div className="border-b border-gray-200 mb-6"></div>
        <p className="text-gray-600 mb-6 text-sm flex-grow leading-relaxed min-h-[72px]">{project.description}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map(tech => (
            <span key={tech} className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full border ${getTechStackStyle()}`}>
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full border ${
              project.type === 'experience' 
                ? 'bg-orange-50 text-orange-600 border-orange-100' 
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
        <div className="pt-4 border-t border-gray-200 mt-auto flex items-center justify-start gap-6">
          {project.liveUrl && project.liveUrl !== '#' && (
             <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`font-semibold transition-colors duration-300 inline-flex items-center ${getLinkStyle()}`}
             >
                <ExternalLinkIcon />
                프로젝트 보기
             </a>
          )}
          {project.githubUrl && project.githubUrl !== '#' && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`font-semibold transition-colors duration-300 inline-flex items-center ${getLinkStyle()}`}
            >
              <GithubIcon />
              GitHub
            </a>
          )}
          {project.type === 'experience' && (!project.liveUrl || project.liveUrl === '#') && (!project.githubUrl || project.githubUrl === '#') && (
            <span className="text-orange-600 font-semibold inline-flex items-center">
              <ExperienceSmallIcon />
              경험
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 