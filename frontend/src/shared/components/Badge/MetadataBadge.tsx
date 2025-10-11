import React from 'react';

/**
 * 메타데이터 배지 타입
 */
export type MetadataBadgeType =
  | 'team'          // 팀 프로젝트
  | 'individual'    // 개인 프로젝트
  | 'build'         // BUILD 타입
  | 'lab'           // LAB 타입
  | 'maintenance'   // MAINTENANCE 타입
  | 'certification' // 자격증
  | 'status';       // 상태 (completed, in_progress 등)

/**
 * 메타데이터 배지 Props
 */
export interface MetadataBadgeProps {
  type: MetadataBadgeType;
  label?: string; // 커스텀 레이블 (미지정 시 type 기반 자동 생성)
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 메타데이터 배지 컴포넌트
 * 프로젝트, 경력, 교육 등의 메타데이터를 시각적으로 표현
 */
export const MetadataBadge: React.FC<MetadataBadgeProps> = ({
  type,
  label,
  className = '',
  size = 'md'
}) => {
  /**
   * 타입에 따른 스타일 클래스 반환
   */
  const getBadgeStyle = (): string => {
    switch (type) {
      case 'team':
        return 'bg-blue-100 text-blue-800';
      case 'individual':
        return 'bg-purple-100 text-purple-800';
      case 'build':
        return 'bg-red-100 text-red-800';
      case 'lab':
        return 'bg-orange-100 text-orange-800';
      case 'maintenance':
        return 'bg-green-100 text-green-800';
      case 'certification':
        return 'bg-yellow-100 text-yellow-800';
      case 'status':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 사이즈에 따른 스타일 클래스 반환
   */
  const getSizeStyle = (): string => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1.5 text-base';
      case 'md':
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  /**
   * 타입에 따른 기본 레이블 반환
   */
  const getDefaultLabel = (): string => {
    if (label) return label;

    switch (type) {
      case 'team':
        return '팀 프로젝트';
      case 'individual':
        return '개인 프로젝트';
      case 'build':
        return 'BUILD';
      case 'lab':
        return 'LAB';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'certification':
        return '자격증';
      case 'status':
        return '상태';
      default:
        return '';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${getBadgeStyle()} ${getSizeStyle()} ${className}`}
    >
      {getDefaultLabel()}
    </span>
  );
};

/**
 * 프로젝트 타입에 따른 배지 컴포넌트 (편의 함수)
 */
export const ProjectTypeBadge: React.FC<{
  projectType: 'BUILD' | 'LAB' | 'MAINTENANCE' | 'certification';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ projectType, className, size }) => {
  const typeMap: Record<string, MetadataBadgeType> = {
    BUILD: 'build',
    LAB: 'lab',
    MAINTENANCE: 'maintenance',
    certification: 'certification'
  };

  return (
    <MetadataBadge
      type={typeMap[projectType] || 'status'}
      className={className}
      size={size}
    />
  );
};

/**
 * 팀/개인 배지 컴포넌트 (편의 함수)
 */
export const TeamBadge: React.FC<{
  isTeam: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isTeam, className, size }) => {
  return (
    <MetadataBadge
      type={isTeam ? 'team' : 'individual'}
      className={className}
      size={size}
    />
  );
};

/**
 * 상태 배지 컴포넌트 (편의 함수)
 */
export const StatusBadge: React.FC<{
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, className, size }) => {
  const statusLabelMap: Record<string, string> = {
    completed: '완료',
    in_progress: '진행중',
    maintenance: '유지보수'
  };

  return (
    <MetadataBadge
      type="status"
      label={statusLabelMap[status] || status}
      className={className}
      size={size}
    />
  );
};
