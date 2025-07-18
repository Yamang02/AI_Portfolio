
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

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
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-200/50 flex flex-col border border-gray-100">
      <img className="h-48 w-full object-cover" src={project.imageUrl} alt={project.title} />
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
        <p className="text-gray-600 mb-4 text-sm flex-grow">{project.description}</p>
        <div className="mb-4">
          {project.technologies.map(tech => (
            <span key={tech} className="inline-block bg-primary-100 text-primary-800 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full">
              {tech}
            </span>
          ))}
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