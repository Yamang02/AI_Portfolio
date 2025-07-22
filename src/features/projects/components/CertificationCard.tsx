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

  const formatDateRange = () => {
    const startDate = formatDate(certification.startDate);
    const endDate = certification.endDate ? formatDate(certification.endDate) : '현재';
    return `${startDate} - ${endDate}`;
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
          {certification.credentialId && (
            <p className="text-sm text-gray-500 mb-2">
              자격번호: {certification.credentialId}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500">
            {formatDateRange()}
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

      {/* 추가 정보 */}
      <div className="space-y-1">
        {certification.validUntil && (
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            유효기간: ~ {certification.validUntil}
          </div>
        )}
        {certification.credentialUrl && (
          <div className="flex items-center text-xs">
            <a
              href={certification.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 hover:underline flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              인증서 확인
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationCard; 