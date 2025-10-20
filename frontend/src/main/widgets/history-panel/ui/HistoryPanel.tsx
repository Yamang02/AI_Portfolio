import React from 'react';
import { Project } from '../../../entities/project';
import { Experience } from '../../../entities/experience';
import { Education } from '../../../entities/education';
import { safeSplit, safeIncludes } from '../../../../shared/lib/string/stringUtils';

interface HistoryPanelProps {
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  isOpen: boolean;
  onToggle: () => void;
  highlightedItemId?: string;
  onItemHover: (itemId?: string) => void;
  scrollToItemId?: string;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  projects,
  experiences,
  educations,
  isOpen,
  onToggle,
  highlightedItemId,
  onItemHover,
  scrollToItemId
}) => {
  // 모든 아이템을 통합하여 타임라인 생성
  const allItems = [
    ...projects.map(p => ({ ...p, type: 'project' as const })),
    ...experiences.map(e => ({ ...e, type: 'experience' as const })),
    ...educations.map(edu => ({ ...edu, type: 'education' as const }))
  ];

  // 날짜를 Date 객체로 변환하는 헬퍼 함수
  const parseDate = (dateStr: string | any): Date => {
    // 타입 안전성 검증
    if (!dateStr) {
      console.warn('Invalid date string: empty input');
      return new Date(); // 기본값으로 현재 날짜 반환
    }
    
    // 배열 형태의 날짜 처리 [YYYY, MM, DD]
    if (Array.isArray(dateStr)) {
      if (dateStr.length >= 2 && typeof dateStr[0] === 'number' && typeof dateStr[1] === 'number') {
        const year = dateStr[0];
        const month = dateStr[1];
        return new Date(year, month - 1, 1);
      }
      console.warn('Invalid date array format:', dateStr);
      return new Date();
    }
    
    // 문자열 형태의 날짜 처리
    if (typeof dateStr !== 'string') {
      console.warn('Invalid date string type:', typeof dateStr, dateStr);
      return new Date();
    }
    
    // YYYY-MM 형식을 YYYY-MM-01로 변환
    const normalizedDate = safeIncludes(dateStr, '-') && safeSplit(dateStr, '-').length === 2 
      ? `${dateStr}-01` 
      : dateStr;
      
    const date = new Date(normalizedDate);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateStr);
      return new Date();
    }
    
    return date;
  };

  // 날짜별로 정렬
  const sortedItems = allItems.sort((a, b) => {
    const dateA = parseDate(a.startDate || a.issueDate);
    const dateB = parseDate(b.startDate || b.issueDate);
    return dateB.getTime() - dateA.getTime(); // 최신순
  });

  // 아이템 클릭 핸들러
  const handleItemClick = (item: any) => {
    if (item.type === 'project') {
      const projectSection = document.getElementById('project');
      if (projectSection) {
        projectSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.type === 'experience') {
      const experienceSection = document.getElementById('experience');
      if (experienceSection) {
        experienceSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.type === 'education') {
      const educationSection = document.getElementById('education');
      if (educationSection) {
        educationSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateStr: string | any): string => {
    const date = parseDate(dateStr);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-l-lg px-3 py-4 shadow-lg hover:bg-gray-50 transition-colors z-40"
        title="타임라인 열기"
      >
        <div className="flex flex-col items-center space-y-1">
          <div className="w-1 h-8 bg-gray-400"></div>
          <div className="w-1 h-8 bg-gray-400"></div>
          <div className="w-1 h-8 bg-gray-400"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">타임라인</h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="타임라인 닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 타임라인 내용 */}
      <div className="h-full overflow-y-auto p-4">
        <div className="space-y-4">
          {sortedItems.map((item, index) => {
            const isHighlighted = highlightedItemId === item.id.toString();
            const isLast = index === sortedItems.length - 1;
            
            return (
              <div
                key={`${item.type}-${item.id}`}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isHighlighted ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => onItemHover(item.id.toString())}
                onMouseLeave={() => onItemHover()}
              >
                {/* 타임라인 라인 */}
                {!isLast && (
                  <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-300"></div>
                )}
                
                {/* 아이템 내용 */}
                <div className={`relative bg-white rounded-lg border-2 p-4 shadow-sm transition-all duration-200 ${
                  isHighlighted 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}>
                  {/* 아이템 타입 아이콘 */}
                  <div className={`absolute -left-2 top-4 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    item.type === 'project' 
                      ? 'bg-green-500' 
                      : item.type === 'experience'
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                  }`}>
                    {item.type === 'project' ? 'P' : item.type === 'experience' ? 'E' : 'D'}
                  </div>
                  
                  {/* 아이템 제목 */}
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.title || item.company || item.institution}
                  </h4>
                  
                  {/* 아이템 설명 */}
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.description || item.position || item.degree}
                  </p>
                  
                  {/* 날짜 */}
                  <div className="text-xs text-gray-500">
                    {formatDate(item.startDate || item.issueDate)}
                    {item.endDate && ` - ${formatDate(item.endDate)}`}
                  </div>
                  
                  {/* 하이라이트 표시 */}
                  {isHighlighted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
