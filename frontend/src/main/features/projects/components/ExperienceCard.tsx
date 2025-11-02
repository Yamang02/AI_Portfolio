import React from 'react';
import { Experience } from '../types';
import { formatDateRange } from '../../../../shared/utils/safeStringUtils';
import { SimpleTechStackList } from '../../../components/common/TechStack';
import { useCardHover } from '../../../hooks';

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
        bg-white rounded-lg shadow-md p-6 border border-gray-200
        transition-all duration-200 hover:shadow-lg hover:scale-105 hover:shadow-orange-200
        ${isHighlighted ? 'ring-2 ring-orange-400 shadow-lg scale-105' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {experience.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {experience.organization}
          </p>
          {experience.role && (
            <p className="text-sm text-gray-500 mb-2">
              {experience.role}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">
            {formatDateRange(experience.startDate, experience.endDate, ' - ')}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
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
        <div className="flex items-center text-xs text-gray-500">
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
