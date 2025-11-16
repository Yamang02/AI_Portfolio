import React from 'react';
import { Experience } from '../types';
import { formatDateRange } from '@shared/utils/safeStringUtils';
import { SimpleTechStackList } from '@shared/ui';
import { useCardHover } from '@shared/hooks';

interface ExperienceCardProps {
  experience: Experience;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isHighlighted?: boolean;
  onLongHover?: (id: string) => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onMouseEnter,
  onMouseLeave,
  isHighlighted,
  onLongHover
}) => {
  // 공통 hover 로직 사용
  const { handleMouseEnter, handleMouseLeave } = useCardHover(
    experience.id,
    onMouseEnter,
    onMouseLeave,
    onLongHover
  );

  return (
    <div
      id={`experience-${experience.id}`}
      className={`
        bg-surface dark:bg-slate-800 rounded-lg shadow-md p-6 border border-border
        transition-all duration-200 hover:shadow-lg hover:scale-105 hover:shadow-orange-200 dark:hover:shadow-orange-900/50
        ${isHighlighted ? 'ring-2 ring-orange-400 dark:ring-orange-600 shadow-lg scale-105' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {experience.title}
          </h3>
          <p className="text-sm text-text-secondary mb-1">
            {experience.organization}
          </p>
          {experience.role && (
            <p className="text-sm text-text-muted mb-2">
              {experience.role}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-text-muted">
            {formatDateRange(experience.startDate, experience.endDate, ' - ')}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
        {experience.description}
      </p>

      {/* 기술 스택 */}
      {experience.technologies && experience.technologies.length > 0 && (
        <SimpleTechStackList
          technologies={experience.technologies}
          className="mb-4"
        />
      )}

      {/* 위치 정보 */}
      {experience.location && (
        <div className="flex items-center text-xs text-text-muted">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {experience.location}
        </div>
      )}
    </div>
  );
};

export { ExperienceCard };
