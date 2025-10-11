import React from 'react';
import { Project } from '../../../features/projects/types';

interface ProjectDetailContributionProps {
  project: Project;
  className?: string;
}

const ProjectDetailContribution: React.FC<ProjectDetailContributionProps> = React.memo(({ 
  project, 
  className = '' 
}) => {
  if (!project.isTeam) {
    return null;
  }

  const hasRole = project.role && project.role.trim().length > 0;
  const hasContributions = project.myContributions && project.myContributions.length > 0;

  if (!hasRole && !hasContributions) {
    return null;
  }

  return (
    <section className={`bg-blue-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">팀 프로젝트 기여도</h3>
      </div>
      
      <div className="space-y-4">
        {/* 담당 역할 */}
        {hasRole && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              담당 역할
            </h4>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-gray-800 font-medium">{project.role}</p>
            </div>
          </div>
        )}
        
        {/* 주요 기여 */}
        {hasContributions && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              주요 기여
            </h4>
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <ul className="space-y-2">
                {project.myContributions.map((contribution, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-800 text-sm">{contribution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

ProjectDetailContribution.displayName = 'ProjectDetailContribution';

export default ProjectDetailContribution;
