import React from 'react';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 ${className}`}>
      {/* 이미지 영역 스켈레톤 */}
      <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
      
      {/* 본문 영역 스켈레톤 */}
      <div className="p-6">
        {/* 제목 스켈레톤 */}
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
        
        {/* 구분선 */}
        <div className="border-b border-gray-200 mb-6"></div>
        
        {/* 설명 스켈레톤 */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
        
        {/* 기술 스택 스켈레톤 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-14"></div>
        </div>
        
        {/* 하단 정보 스켈레톤 */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
      </div>
    </div>
  );
};

interface SkeletonSectionProps {
  title: string;
  count?: number;
}

export const SkeletonSection: React.FC<SkeletonSectionProps> = ({ title, count = 3 }) => {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </section>
  );
};

export default SkeletonCard;


