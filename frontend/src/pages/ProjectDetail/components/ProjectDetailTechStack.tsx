import React from 'react';
import { useTechStackCategorization } from '../hooks/useTechStackCategorization';
import '../../../shared/components/TechStackBadge/TechStackBadge.css';

interface ProjectDetailTechStackProps {
  technologies: string[];
  className?: string;
}

// 기술 스택 배지 컴포넌트
const TechStackBadge: React.FC<{ tech: string; getBadgeClass: (tech: string) => string }> = React.memo(({ tech, getBadgeClass }) => {
  return (
    <span className={getBadgeClass(tech)}>
      {tech}
    </span>
  );
});

TechStackBadge.displayName = 'TechStackBadge';

// 기술 카테고리 섹션 컴포넌트
const TechCategorySection: React.FC<{ 
  category: { name: string; techs: string[] }; 
  getBadgeClass: (tech: string) => string;
}> = React.memo(({ category, getBadgeClass }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        {category.name}
      </h4>
      <div className="flex flex-wrap gap-2">
        {category.techs.map(tech => (
          <TechStackBadge 
            key={tech} 
            tech={tech} 
            getBadgeClass={getBadgeClass}
          />
        ))}
      </div>
    </div>
  );
});

TechCategorySection.displayName = 'TechCategorySection';

const ProjectDetailTechStack: React.FC<ProjectDetailTechStackProps> = React.memo(({ 
  technologies, 
  className = '' 
}) => {
  const { categorizedTech, getBadgeClass } = useTechStackCategorization(technologies);

  if (!technologies || technologies.length === 0) {
    return null;
  }

  return (
    <section id="tech-stack" className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">기술 스택</h3>
      </div>
      
      <div className="space-y-4">
        {categorizedTech.map((category, index) => (
          <TechCategorySection 
            key={`${category.name}-${index}`}
            category={category} 
            getBadgeClass={getBadgeClass}
          />
        ))}
      </div>
    </section>
  );
});

ProjectDetailTechStack.displayName = 'ProjectDetailTechStack';

export default ProjectDetailTechStack;
