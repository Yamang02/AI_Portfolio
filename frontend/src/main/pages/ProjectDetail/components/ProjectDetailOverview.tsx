import React from 'react';

interface ProjectDetailOverviewProps {
  description: string;
  className?: string;
}

const ProjectDetailOverview: React.FC<ProjectDetailOverviewProps> = React.memo(({ 
  description, 
  className = '' 
}) => {
  if (!description || description.trim().length === 0) {
    return null;
  }

  return (
    <section className={`bg-surface-elevated dark:bg-slate-700 rounded-lg p-6 border border-border ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-primary">개요</h3>
      </div>
      
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p className="text-text-secondary leading-relaxed text-base">
          {description}
        </p>
      </div>
    </section>
  );
});

ProjectDetailOverview.displayName = 'ProjectDetailOverview';

export { ProjectDetailOverview };
