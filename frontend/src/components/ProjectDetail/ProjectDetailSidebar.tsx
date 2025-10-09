import React from 'react';
import { Project } from '../../entities/project/types';
import { createTechStackGroups } from '../../shared/utils/techStackCategorizer';
import '../../shared/components/TechStackBadge/TechStackBadge.css';

interface ProjectDetailSidebarProps {
  project: Project;
}

interface TechCategory {
  name: string;
  techs: string[];
}

// 기술 스택을 TechStackMetadata 형태로 변환
const convertToTechStackMetadata = (tech: string) => {
  const lowerTech = tech.toLowerCase();
  
  // 카테고리 결정
  let category: 'language' | 'framework' | 'database' | 'tool' | 'other' = 'other';
  if (['java', 'javascript', 'python', 'c#', 'typescript'].includes(lowerTech)) {
    category = 'language';
  } else if (['spring boot', 'react', 'express.js', 'pyqt5', 'phaser.js', 'jsp', 'servlet'].includes(lowerTech)) {
    category = 'framework';
  } else if (['oracle', 'mysql', 'mongodb', 'redis', 'mssql'].includes(lowerTech)) {
    category = 'database';
  } else if (['git', 'docker', 'github actions', 'maven', 'cursor', 'selenium', 'beautifulsoup', 'yt-dlp', 'cloudinary', 'ejs', 'jquery', 'daypilot', 'chromedriver', 'pl/sql', 'svn', 'gitlab', 'sap', 'oracle forms', 'file system', 'gemini cli', 'cli', 'json', 'web scraping', 'requests', 'github pages'].includes(lowerTech)) {
    category = 'tool';
  }
  
  // 레벨 결정
  let level: 'core' | 'general' | 'learning' = 'learning';
  if (['java', 'spring boot', 'react', 'git', 'javascript'].includes(lowerTech)) {
    level = 'core';
  } else if (['python', 'mysql', 'docker', 'maven'].includes(lowerTech)) {
    level = 'general';
  }
  
  return {
    name: tech,
    displayName: tech,
    category,
    level,
    isCore: level === 'core',
    isActive: true,
    colorHex: '#6b7280',
    description: '',
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// 기술 스택 배지
const FilterStyleTechBadge: React.FC<{ tech: string }> = ({ tech }) => {
  const getTechStyle = (tech: string): string => {
    const lowerTech = tech.toLowerCase();
    
    // 카테고리별 스타일
    if (['java', 'javascript', 'python', 'c#', 'typescript'].includes(lowerTech)) {
      return 'tech-badge tech-badge--sm tech-badge--language';
    } else if (['spring boot', 'react', 'express.js', 'pyqt5', 'phaser.js', 'jsp', 'servlet'].includes(lowerTech)) {
      return 'tech-badge tech-badge--sm tech-badge--framework';
    } else if (['oracle', 'mysql', 'mongodb', 'redis', 'mssql'].includes(lowerTech)) {
      return 'tech-badge tech-badge--sm tech-badge--database';
    } else if (['git', 'docker', 'github actions', 'maven', 'cursor', 'selenium', 'beautifulsoup', 'yt-dlp', 'cloudinary', 'ejs', 'jquery', 'daypilot', 'chromedriver', 'pl/sql', 'svn', 'gitlab', 'sap', 'oracle forms', 'file system', 'gemini cli', 'cli', 'json', 'web scraping', 'requests', 'github pages'].includes(lowerTech)) {
      return 'tech-badge tech-badge--sm tech-badge--tool';
    } else {
      return 'tech-badge tech-badge--sm tech-badge--default';
    }
  };

  return (
    <span className={getTechStyle(tech)}>
      {tech}
    </span>
  );
};

// 기술 스택을 카테고리별로 분류
const categorizeTechnologies = (technologies: string[]) => {
  // 기술 스택을 TechStackMetadata 형태로 변환
  const techStackMetadata = technologies.map(convertToTechStackMetadata);
  
  // createTechStackGroups를 사용하여 분류
  const groups = createTechStackGroups(techStackMetadata);
  
  // 사이드바에서 사용할 형태로 변환
  return groups.map(group => ({
    name: group.name,
    techs: group.techs.map(tech => tech.displayName)
  }));
};

const ProjectDetailSidebar: React.FC<ProjectDetailSidebarProps> = ({
  project
}) => {
  return (
    <div className="w-80">
      {/* 스크롤 가능한 메인 컨텐츠 영역 */}
      <div className="space-y-6">
        {/* 팀 기여도 섹션 */}
        {project.isTeam && (project.role || (project.myContributions && project.myContributions.length > 0)) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">팀 프로젝트 기여도</h3>
            <div className="space-y-3">
              {project.role && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-1.5">담당 역할</h4>
                  <div className="text-sm text-gray-700">
                    {project.role}
                  </div>
                </div>
              )}
              {project.myContributions && project.myContributions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-600 mb-1.5">주요 기여</h4>
                  <div className="space-y-1">
                    {project.myContributions.map((contribution, index) => (
                      <div key={index} className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        • {contribution}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 기술 스택 섹션 */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">기술 스택</h3>
            <div className="space-y-3">
              {categorizeTechnologies(project.technologies).map((category, index) => (
                <div key={index}>
                  <h4 className="text-xs font-medium text-gray-600 mb-1.5">{category.name}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {category.techs.map(tech => (
                      <FilterStyleTechBadge key={tech} tech={tech} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 추가 스크린샷 섹션 */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-4">추가 스크린샷</h3>
            <div className="space-y-3">
              {project.screenshots.map((screenshot, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={screenshot}
                    alt={`${project.title} 스크린샷 ${index + 1}`}
                    className="w-full h-28 object-cover"
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

        {/* 외부 링크 섹션 */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="space-y-2">
            {/* Live Service */}
            <a
              href={project.liveUrl && project.liveUrl !== '#' ? project.liveUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                project.liveUrl && project.liveUrl !== '#' 
                  ? 'bg-white text-gray-700 hover:bg-green-100 border border-gray-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
              tabIndex={project.liveUrl && project.liveUrl !== '#' ? 0 : -1}
              aria-disabled={!(project.liveUrl && project.liveUrl !== '#')}
              title={project.liveUrl && project.liveUrl !== '#' ? '운영 중인 서비스로 이동' : '운영 중인 서비스가 없습니다'}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Live Service
              </div>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </a>
            
            {/* GitHub */}
            <a
              href={project.githubUrl && project.githubUrl !== '#' ? project.githubUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                project.githubUrl && project.githubUrl !== '#' 
                  ? 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
              tabIndex={project.githubUrl && project.githubUrl !== '#' ? 0 : -1}
              aria-disabled={!(project.githubUrl && project.githubUrl !== '#')}
              title={project.githubUrl && project.githubUrl !== '#' ? 'GitHub 저장소로 이동' : 'GitHub URL이 없는 프로젝트'}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </div>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </a>
            
            {/* Notion */}
            <a
              href={project.externalUrl && project.externalUrl !== '#' ? project.externalUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                project.externalUrl && project.externalUrl !== '#' 
                  ? 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
              tabIndex={project.externalUrl && project.externalUrl !== '#' ? 0 : -1}
              aria-disabled={!(project.externalUrl && project.externalUrl !== '#')}
              title={project.externalUrl && project.externalUrl !== '#' ? 'Notion 문서로 이동' : 'Notion 문서가 없습니다'}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337-.793c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.269-.187z"/>
                </svg>
                Notion
              </div>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailSidebar;



