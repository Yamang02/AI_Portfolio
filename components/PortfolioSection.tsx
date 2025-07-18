
import React from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';

interface PortfolioSectionProps {
  projects: Project[];
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ projects }) => {
  return (
    <section id="portfolio">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">포트폴리오</h2>
        <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
          제가 참여했던 프로젝트들입니다. 우측 하단의 AI 비서에게 프로젝트에 대해 무엇이든 물어보세요!
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};

export default PortfolioSection;