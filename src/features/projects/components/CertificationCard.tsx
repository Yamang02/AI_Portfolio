import React from 'react';
import { Certification } from '../types';

interface CertificationCardProps {
  certification: Certification;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CertificationCard: React.FC<CertificationCardProps> = ({ certification, onMouseEnter, onMouseLeave }) => {
  const formatDate = (date: string) => {
    const [year, month] = date.split('-');
    return `${year}.${month}`;
  };

  const formatAcquisitionDate = () => {
    return formatDate(certification.startDate);
  };

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md p-6 border border-gray-200 
        transition-all duration-200 hover:shadow-lg hover:scale-105
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {certification.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {certification.issuer}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">
            취득일: {formatAcquisitionDate()}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {certification.description}
      </p>

      {/* 기술 스택 */}
      {certification.technologies && certification.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {certification.technologies.map((tech, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200"
            >
              {tech}
            </span>
          ))}
        </div>
      )}


    </div>
  );
};

export default CertificationCard; 