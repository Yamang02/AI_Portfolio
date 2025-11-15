import React from 'react';
import { Certification } from '../types';
import { safeFormatDate } from '@shared/utils/safeStringUtils';

interface CertificationCardProps {
  certification: Certification;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CertificationCard: React.FC<CertificationCardProps> = ({ certification, onMouseEnter, onMouseLeave }) => {
  const formatDate = (date: string) => {
    return safeFormatDate(date);
  };

  const formatAcquisitionDate = () => {
    return formatDate(certification.date);
  };

  return (
    <div 
      className={`
        bg-surface dark:bg-slate-800 rounded-lg shadow-md p-6 border border-border 
        transition-all duration-200 hover:shadow-lg hover:scale-105
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {certification.name}
          </h3>
          <p className="text-sm text-text-secondary mb-1">
            {certification.issuer}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-text-muted">
            취득일: {formatAcquisitionDate()}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-text-secondary text-sm mb-4 line-clamp-3">
        {certification.description}
      </p>

      {/* 자격증 URL */}
      {certification.credentialUrl && (
        <div className="mt-4">
          <a 
            href={certification.credentialUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm underline"
          >
            자격증 확인하기
          </a>
        </div>
      )}
    </div>
  );
};

export { CertificationCard }; 