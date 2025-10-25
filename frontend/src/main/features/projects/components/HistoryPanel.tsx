import React from 'react';
import { Project, Experience, Education } from '../types';
import { safeSplit, safeIncludes } from '../../../../shared/utils/safeStringUtils';

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
      return new Date(); // 기본값으로 현재 날짜 반환
    }
    
    // 배열 형태의 날짜 처리 [YYYY, MM, DD]
    if (Array.isArray(dateStr)) {
      if (dateStr.length >= 2 && typeof dateStr[0] === 'number' && typeof dateStr[1] === 'number') {
        const year = dateStr[0];
        const month = dateStr[1];
        return new Date(year, month - 1, 1);
      }
      return new Date();
    }
    
    // 문자열 형태의 날짜 처리
    if (typeof dateStr === 'string') {
      if (safeIncludes(dateStr, '-')) {
        const parts = safeSplit(dateStr, '-');
        if (parts.length >= 2) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        }
      }
      return new Date(dateStr);
    }
    
    return new Date(); // 기본값으로 현재 날짜 반환
  };

  // 모든 날짜를 수집하여 범위 계산
  const allDates = allItems
    .flatMap(item => [item.startDate, item.endDate])
    .filter((date): date is string => Boolean(date))
    .map(parseDate);

  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  // 현재 진행 중인 아이템이 있으면 현재 날짜까지 포함
  const hasOngoingItem = allItems.some(item => !item.endDate);
  const timelineEnd = hasOngoingItem ? new Date() : maxDate;

  // 타임라인 시작점: 가장 최초 아이템보다 1달 전
  const timelineStart = new Date(minDate);
  timelineStart.setMonth(timelineStart.getMonth() - 1);
  timelineStart.setDate(1);
  timelineStart.setHours(0, 0, 0, 0);

  // 타임라인 종료점: 오늘 기준 1달 후
  const timelineEndExtended = new Date(timelineEnd);
  timelineEndExtended.setMonth(timelineEndExtended.getMonth() + 1);
  timelineEndExtended.setDate(1);
  timelineEndExtended.setHours(0, 0, 0, 0);

  // 날짜를 YYYY.MM 형식으로 포맷
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
  };


  // 타임라인에 표시할 날짜들 생성 (3개월 간격)
  const generateTimelineDates = (): Date[] => {
    const dates: Date[] = [];
    const start = new Date(timelineStart);
    const current = new Date(start);
    
    while (current <= timelineEndExtended) {
      dates.push(new Date(current));
      current.setMonth(current.getMonth() + 3);
    }
    
    // 최신순으로 정렬 (상단이 최신)
    return dates.reverse();
  };

  const timelineDates = generateTimelineDates();

  // 전체 기간(개월 수) 계산
  const getMonthDiff = (d1: Date, d2: Date) => (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  const totalMonths = Math.max(getMonthDiff(timelineStart, timelineEndExtended), 1);
  const pxPerMonth = 40; // 1개월당 40px
  const timelineHeight = isNaN(totalMonths) ? 400 : totalMonths * pxPerMonth; // NaN 방지

  // px 단위 위치 계산 (내림차순: top=0이 최신)
  const getPxPosition = (date: Date) => {
    const monthsFromEnd = getMonthDiff(date, timelineEndExtended);
    return monthsFromEnd * pxPerMonth;
  };

  // 바 위치 계산 (왼쪽에서 순서대로)
  const getBarLeft = (type: 'project' | 'experience' | 'education') => {
    switch (type) {
      case 'education': return '20%';
      case 'experience': return '40%';
      case 'project': return '60%';
      default: return '20%';
    }
  };

  // title 색상 결정
  const getTitleColor = (type: 'project' | 'experience' | 'education') => {
    switch (type) {
      case 'project': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'experience': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'education': return 'bg-green-50 border-green-200 text-green-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  // 스마트 title 위치 조정
  const getSmartTitleOffset = (itemId: string) => {
    // 모든 title 위치를 수집
    const allTitlePositions: Array<{id: string, y: number, type: string}> = [];
    
    // 각 타입별로 title 위치 계산
    [...educations, ...experiences, ...projects].forEach(item => {
      const startPx = getPxPosition(parseDate(item.startDate));
      const endPx = item.endDate ? getPxPosition(parseDate(item.endDate)) : timelineHeight;
      const isOngoing = !item.endDate;
      const itemCenterY = isOngoing ? startPx / 2 : (startPx + endPx) / 2;
      
      let itemType = '';
      if (educations.some(edu => edu.id === item.id)) itemType = 'education';
      else if (experiences.some(exp => exp.id === item.id)) itemType = 'experience';
      else if (projects.some(proj => proj.id === item.id)) itemType = 'project';
      
      allTitlePositions.push({id: item.id, y: itemCenterY, type: itemType});
    });
    
    // 현재 아이템의 원래 위치
    const currentItem = allTitlePositions.find(pos => pos.id === itemId);
    if (!currentItem) return 0;
    
    // 겹치는 아이템들 찾기 (Y 위치가 비슷한 것들)
    const overlappingItems = allTitlePositions.filter(pos => 
      pos.id !== itemId && 
      Math.abs(pos.y - currentItem.y) < 30 // 30px 이내면 겹침으로 간주
    );
    
    if (overlappingItems.length === 0) return 0;
    
    // 겹치는 아이템들과의 거리를 고려하여 위치 조정
    let offset = 0;
    const baseOffset = 25; // 기본 조정 간격
    
    overlappingItems.forEach((overlapping, index) => {
      if (Math.abs(currentItem.y + offset - overlapping.y) < 30) {
        // 겹치는 경우 위아래로 번갈아가며 이동
        const direction = index % 2 === 0 ? 1 : -1;
        offset += direction * baseOffset;
      }
    });
    
    return offset;
  };

  React.useEffect(() => {
    if (scrollToItemId) {
      const el = document.getElementById(`history-bar-${scrollToItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [scrollToItemId]);

  // 바 아이템 렌더링 (px 단위)
  // 프로젝트 상태에 따른 바 너비 계산 (간단)
  const getBarWidth = (item: any, type: 'project' | 'experience' | 'education') => {
    if (type !== 'project') {
      return 'w-8'; // 경험, 교육은 기본 너비
    }

    const status = item.status || 'completed'; // 기본값으로 'completed' 설정

    // 상태별 너비 구분
    if (status === 'in_progress') {
      return 'w-2'; // 진행중: 얇은 선
    } else if (status === 'completed') {
      return 'w-8'; // 완료: 굵은 선
    } else if (status === 'maintenance') {
      return 'w-4'; // 유지보수: 중간 너비
    } else {
      return 'w-4'; // 기타 상태: 중간 너비
    }
  };

  const renderBarItem = (item: any, type: 'project' | 'experience' | 'education') => {
    const startDate = parseDate(item.startDate);
    const endDate = item.endDate ? parseDate(item.endDate) : timelineEnd;
    const startPx = getPxPosition(startDate);
    const endPx = getPxPosition(endDate);
    const barHeight = Math.max(Math.abs(endPx - startPx), 20);
    const barWidthClass = getBarWidth(item, type);
    const isHighlighted = highlightedItemId === item.id;
    const isOngoing = !item.endDate;
    const cardId = type === 'project' ? `project-${item.id}` : type === 'experience' ? `experience-${item.id}` : `education-${item.id}`;
    
    const handleBarClick = () => {
      const el = document.getElementById(cardId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    
    const barLeft = getBarLeft(type);
    const titleOffset = getSmartTitleOffset(item.id);

    if (isOngoing) {
      // 진행 중: 바 대신 색이 있는 선 (top: 0, height: startPx)
      return (
        <>
          <div
            key={item.id}
            className={`absolute z-20`}
            style={{
              top: `0px`,
              left: barLeft,
              transform: 'translateX(-50%)',
              height: `${startPx}px`,
              width: '8px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={() => onItemHover(item.id)}
            onMouseLeave={() => onItemHover(undefined)}
            onClick={handleBarClick}
          >
            <div
              className={`w-1 h-full transition-all duration-200 ${
                isHighlighted ? (
                  type === 'project' ? 'bg-blue-400' :
                  type === 'experience' ? 'bg-orange-400' : 'bg-green-400'
                ) : 'bg-gray-300 hover:bg-gray-500'
              }`}
              title={`${item.title} (진행 중)`}
            />
          </div>
          {/* title label for ongoing bar */}
          <div
            className="absolute"
            style={{
              top: `${startPx / 2 + titleOffset}px`,
              left: barLeft,
              transform: 'translate(-50%, -50%)',
              zIndex: isHighlighted ? 40 : 30,
              maxWidth: '140px',
              pointerEvents: 'none',
            }}
          >
            <span className={`inline-block text-xs rounded-lg shadow-sm px-3 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] text-center transition-all duration-200 ${getTitleColor(type)} ${
              isHighlighted ? 'max-w-none overflow-visible' : ''
            }`}
              title={item.title}
            >
              {item.title}
            </span>
          </div>
        </>
      );
    }
    // 기존 바
    return (
      <>
        <div
          key={item.id}
          className={`absolute transition-all duration-300 ease-in-out ${isHighlighted ? 'z-20' : 'z-10'}`}
          style={{
            top: `${Math.min(startPx, endPx)}px`,
            left: barLeft,
            transform: 'translateX(-50%)',
            cursor: 'pointer'
          }}
          onMouseEnter={() => onItemHover(item.id)}
          onMouseLeave={() => onItemHover(undefined)}
          onClick={handleBarClick}
        >
          <div
            id={`history-bar-${item.id}`}
            className={`${barWidthClass} mx-auto transition-all duration-300 cursor-pointer ${
              isHighlighted ? (
                type === 'project'
                  ? 'bg-blue-600 shadow-lg'
                  : type === 'experience'
                  ? 'bg-orange-600 shadow-lg'
                  : 'bg-green-600 shadow-lg'
              ) : 'bg-gray-300 hover:bg-gray-500'
            }`}
            style={{ height: `${barHeight}px`, minHeight: '20px' }}
          />
        </div>
        {/* title label for normal bar */}
        <div
          className="absolute"
          style={{
            top: `${(startPx + endPx) / 2 + titleOffset}px`,
            left: barLeft,
            transform: 'translate(-50%, -50%)',
            zIndex: isHighlighted ? 40 : 30,
            maxWidth: '140px',
            pointerEvents: 'none',
          }}
        >
          <span className={`inline-block text-xs rounded-lg shadow-sm px-3 py-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] text-center transition-all duration-200 ${getTitleColor(type)} ${
            isHighlighted ? 'max-w-none overflow-visible' : ''
          }`}
            title={item.title}
          >
            {item.title}
          </span>
        </div>
      </>
    );
  };

  return (
    <div className={`fixed left-0 top-0 h-screen w-96 max-w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 text-center w-full">프로젝트 히스토리</h2>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 transition-colors absolute right-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 타임라인(스크롤) 영역 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 통합 타임라인 */}
          <div className="mb-8">
            <div className="relative bg-gray-100 rounded-lg p-2" style={{ height: timelineHeight }}>
              {/* 오른쪽 타임라인 라인 */}
              <div className="absolute" style={{ right: '5%', top: 0, height: timelineHeight, width: '2px', background: '#D1D5DB' }}></div>
              {/* 타임라인 날짜 표시 */}
              {timelineDates.map((date, index) => {
                const datePx = getPxPosition(date);
                return (
                  <div
                    key={index}
                    className="absolute" style={{ right: '5%', top: `${datePx}px` }}
                  >
                    <span className="bg-white px-2 py-1 rounded text-xs text-gray-600 font-medium border border-gray-200">
                      {formatDate(date)}
                    </span>
                  </div>
                );
              })}
              {/* 바 렌더링 순서: 교육 → 경력 → 프로젝트 */}
              {educations.map((education) => (
                <React.Fragment key={`education-${education.id}`}>
                  {renderBarItem(education, 'education')}
                </React.Fragment>
              ))}
              {experiences.map((experience) => (
                <React.Fragment key={`experience-${experience.id}`}>
                  {renderBarItem(experience, 'experience')}
                </React.Fragment>
              ))}
              {projects.map((project) => (
                <React.Fragment key={`project-${project.id}`}>
                  {renderBarItem(project, 'project')}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="mt-4 mb-2 mx-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">범례</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>프로젝트 </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span>경력 </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span>교육 </span>
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-2 mb-4 mx-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <b>바 클릭: 카드로 이동</b> | <b>마우스 오버: 하이라이트</b>
          </p>
        </div>
      </div>
    </div>
  );
};

export { HistoryPanel }; 