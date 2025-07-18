
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

// 기본 프로젝트 이미지 SVG
const DefaultProjectIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    <path d="M9 12l6 6"/>
  </svg>
);

// 개발 아이콘 SVG
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>
);

// 웹 아이콘 SVG
const WebIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // 프로젝트 타입에 따른 아이콘 선택
  const getProjectIcon = () => {
    const title = project.title.toLowerCase();
    if (title.includes('갤러리') || title.includes('전시') || title.includes('art')) {
      return <DefaultProjectIcon />;
    } else if (title.includes('웹') || title.includes('web') || title.includes('사이트')) {
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
          {parts[1] && <span className="text-primary-600">({parts[1]})</span>}
          {parts[2] && parts[2]}
        </>
      );
    }
    return title;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-200/50 flex flex-col border border-gray-100">
      {/* 이미지 영역 */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
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
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
          {formatTitle(project.title)}
        </h3>
        <p className="text-gray-600 mb-4 text-sm flex-grow">{project.description}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technologies.slice(0, 5).map(tech => (
            <span key={tech} className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-3 py-1.5 rounded-full border border-primary-200">
              {tech}
            </span>
          ))}
          {project.technologies.length > 5 && (
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200">
              +{project.technologies.length - 5}
            </span>
          )}
        </div>
        <div className="pt-4 border-t border-gray-200 mt-auto flex items-center justify-start gap-6">
          {project.liveUrl && (
             <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-300 inline-flex items-center"
             >
                <ExternalLinkIcon />
                프로젝트 보기
             </a>
          )}
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-300 inline-flex items-center"
            >
              <GithubIcon />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;