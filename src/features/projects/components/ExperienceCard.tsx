import React from 'react';
import { Experience } from '../types';

interface ExperienceCardProps {
  experience: Experience;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onMouseEnter, onMouseLeave }) => {
  // 기술스택 축약 로직
  const renderTechStack = () => {
    const max = 3;
    const techs = experience.technologies;
    const shown = techs.slice(0, max);
    const hiddenCount = techs.length - max;
    return (
      <>
        {shown.map((tech, idx) => (
          <span key={tech} className="inline-block text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-100 text-gray-800 border-gray-200">
            {tech}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="inline-block text-xs font-medium px-3 py-1.5 rounded-full border bg-gray-200 text-gray-600 border-gray-300">
            +{hiddenCount}
          </span>
        )}
      </>
    );
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col border border-gray-100"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 상단 아이콘 영역 (ProjectCard와 동일 높이) */}
      <div className="h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* 경험 아이콘 */}
        <span className="inline-block w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-3xl font-bold shadow">💼</span>
      </div>
      {/* 본문 */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight truncate" title={experience.title}>
          {experience.title}
        </h3>
        <div className="border-b border-gray-200 mb-6"></div>
        <p className="text-gray-600 mb-6 text-sm flex-grow leading-relaxed min-h-[72px]">{experience.description}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {renderTechStack()}
        </div>
        {/* 하단 정보 */}
        <div className="pt-4 border-t border-gray-200 mt-auto flex items-center justify-between gap-6">
          <span className="text-xs text-gray-500">
            {experience.startDate} ~ {experience.endDate || '현재'}
          </span>
          <div className="flex flex-col items-end text-xs text-gray-500">
            <span><strong>기관:</strong> {experience.organization}</span>
            {experience.role && <span><strong>역할:</strong> {experience.role}</span>}
            {experience.location && <span><strong>위치:</strong> {experience.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard; 