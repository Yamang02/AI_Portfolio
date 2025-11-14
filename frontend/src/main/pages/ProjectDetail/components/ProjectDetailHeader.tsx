import React from 'react';
import { Project } from '@features/project-gallery/types';

interface ProjectDetailHeaderProps {
  project: Project;
  onBack: () => void;
  className?: string;
}

// 메타데이터 배지 컴포넌트
const ProjectMetaBadge: React.FC<{ 
  type: 'team' | 'individual' | 'project' | 'status';
  value: string;
}> = ({ type, value }) => {
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'team':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'individual':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'project':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'status':
        return 'bg-surface-elevated dark:bg-slate-700 text-text-primary';
      default:
        return 'bg-surface-elevated dark:bg-slate-700 text-text-primary';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeStyle(type)}`}>
      {value}
    </span>
  );
};

// 외부 링크 버튼 컴포넌트
const ExternalLinkButton: React.FC<{
  type: 'live' | 'github' | 'notion';
  url: string | undefined;
  title: string;
}> = ({ type, url, title }) => {
  const isDisabled = !url || url === '#';
  
  const getButtonStyle = (type: string) => {
    const baseStyle = 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors';
    
    if (isDisabled) {
      return `${baseStyle} bg-surface-elevated dark:bg-slate-700 text-text-muted cursor-not-allowed`;
    }
    
    switch (type) {
      case 'live':
        return `${baseStyle} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50`;
      case 'github':
        return `${baseStyle} bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50`;
      case 'notion':
        return `${baseStyle} bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50`;
      default:
        return `${baseStyle} bg-surface-elevated dark:bg-slate-700 text-text-primary hover:bg-surface dark:hover:bg-slate-600`;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'live':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'github':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'notion':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337-.793c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.269-.187z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (isDisabled) {
    return (
      <button
        disabled
        className={getButtonStyle(type)}
        title={`${title}이(가) 없습니다`}
      >
        {getIcon(type)}
        {type === 'live' ? 'Live Service' : type === 'github' ? 'GitHub' : 'Notion'}
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={getButtonStyle(type)}
      title={title}
    >
      {getIcon(type)}
      {type === 'live' ? 'Live Service' : type === 'github' ? 'GitHub' : 'Notion'}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </a>
  );
};

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  project,
  onBack,
  className = ''
}) => {
  return (
    <header 
      className={`sticky top-0 border-b z-10 ${className}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">프로젝트 목록으로</span>
        </button>

        {/* 제목과 메타데이터 */}
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-6 break-words">
            {project.title}
          </h1>
          
          {/* 메타데이터 배지들 */}
          <div className="flex flex-wrap gap-2 justify-center">
            <ProjectMetaBadge 
              type={project.isTeam ? 'team' : 'individual'}
              value={project.isTeam ? '팀 프로젝트' : '개인 프로젝트'}
            />
            
            <ProjectMetaBadge 
              type="project"
              value={
                project.type === 'BUILD' ? 'BUILD' :
                project.type === 'LAB' ? 'LAB' :
                project.type === 'MAINTENANCE' ? 'MAINTENANCE' :
                project.type === 'certification' ? '자격증' : project.type
              }
            />
            
            {project.status && (
              <ProjectMetaBadge 
                type="status"
                value={
                  project.status === 'completed' ? '완료' :
                  project.status === 'in_progress' ? '진행중' :
                  project.status === 'maintenance' ? '유지보수' : project.status
                }
              />
            )}
            
            <span className="text-sm text-text-secondary flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {project.startDate} ~ {project.endDate || '현재'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export { ProjectDetailHeader };
