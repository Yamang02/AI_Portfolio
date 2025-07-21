import React from 'react';
import { Project, Experience, HistoryItem } from '../types';

interface HistoryPanelProps {
  projects: Project[];
  experiences: Experience[];
  isOpen: boolean;
  onToggle: () => void;
  highlightedItemId?: string;
  onItemHover: (itemId?: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  projects,
  experiences,
  isOpen,
  onToggle,
  highlightedItemId,
  onItemHover
}) => {
  // 모든 아이템을 통합하여 타임라인 생성
  const allItems = [
    ...projects.map(p => ({ ...p, type: 'project' as const })),
    ...experiences.map(e => ({ ...e, type: 'experience' as const }))
  ];

  // 날짜를 Date 객체로 변환하는 헬퍼 함수
  const parseDate = (dateStr: string): Date => {
    if (dateStr.includes('-')) {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    return new Date(dateStr);
  };

  // 모든 날짜를 수집하여 범위 계산
  const allDates = allItems
    .flatMap(item => [item.startDate, item.endDate])
    .filter(Boolean)
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

  // 타임라인 위치 계산 (상단이 최신)
  const getPosition = (date: Date): number => {
    const totalDuration = timelineEndExtended.getTime() - timelineStart.getTime();
    const position = date.getTime() - timelineStart.getTime();
    // 상단이 최신이 되도록 역순으로 계산
    return 100 - (position / totalDuration) * 100;
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
  const timelineHeight = totalMonths * pxPerMonth;

  // px 단위 위치 계산 (내림차순: top=0이 최신)
  const getPxPosition = (date: Date) => {
    const monthsFromEnd = getMonthDiff(date, timelineEndExtended);
    return monthsFromEnd * pxPerMonth;
  };

  // 바 아이템 렌더링 (px 단위)
  const renderBarItem = (item: any, isProject: boolean) => {
    const startDate = parseDate(item.startDate);
    const endDate = item.endDate ? parseDate(item.endDate) : timelineEnd;
    const startPx = getPxPosition(startDate);
    const endPx = getPxPosition(endDate);
    const barHeight = Math.max(Math.abs(endPx - startPx), 20);
    const isHighlighted = highlightedItemId === item.id;
    const isOngoing = !item.endDate;
    const cardId = isProject ? `project-${item.id}` : `experience-${item.id}`;
    const handleBarClick = () => {
      const el = document.getElementById(cardId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    if (isOngoing) {
      // 진행 중: 바 대신 색이 있는 선 (top: 0, height: startPx)
      return (
        <div
          key={item.id}
          className={`absolute z-20`}
          style={{
            top: `0px`,
            left: isProject ? '25%' : '75%',
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
            className={`w-2 h-full rounded-full ${isProject ? 'bg-blue-400' : 'bg-orange-400'} ${isHighlighted ? (isProject ? 'ring-2 ring-blue-300' : 'ring-2 ring-orange-300') : ''}`}
            title="진행 중"
          />
        </div>
      );
    }
    // 기존 바
    return (
      <div
        key={item.id}
        className={`absolute transition-all duration-300 ease-in-out ${isHighlighted ? 'z-20' : 'z-10'}`}
        style={{
          top: `${Math.min(startPx, endPx)}px`,
          left: isProject ? '25%' : '75%',
          transform: 'translateX(-50%)',
          cursor: 'pointer'
        }}
        onMouseEnter={() => onItemHover(item.id)}
        onMouseLeave={() => onItemHover(undefined)}
        onClick={handleBarClick}
      >
        <div
          className={`w-8 mx-auto rounded transition-all duration-300 cursor-pointer ${
            isProject
              ? isHighlighted
                ? 'bg-blue-600 shadow-lg scale-105'
                : 'bg-blue-400 hover:bg-blue-500'
              : isHighlighted
              ? 'bg-orange-600 shadow-lg scale-105'
              : 'bg-orange-400 hover:bg-orange-500'
          }`}
          style={{ height: `${barHeight}px`, minHeight: '20px' }}
        />
      </div>
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
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
              <span className="mr-4">프로젝트</span>
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
              <span>경력/교육</span>
            </h3>
            <div className="relative bg-gray-100 rounded-lg p-2" style={{ height: timelineHeight }}>
              {/* 중앙 타임라인 라인 */}
              <div className="absolute left-1/2 top-0" style={{ height: timelineHeight, width: '2px', background: '#D1D5DB', transform: 'translateX(-50%)' }}></div>
              {/* 타임라인 날짜 표시 */}
              {timelineDates.map((date, index) => {
                const datePx = getPxPosition(date);
                return (
                  <div
                    key={index}
                    className="absolute left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs text-gray-600 font-medium border border-gray-200"
                    style={{ top: `${datePx}px` }}
                  >
                    {formatDate(date)}
                  </div>
                );
              })}
              {/* 프로젝트 바들 (왼쪽, 중앙선에서 약간만 떨어지게) */}
              {projects.map(project => renderBarItem(project, true))}
              {/* 경력/교육 바들 (오른쪽, 중앙선에서 약간만 떨어지게) */}
              {experiences.map(experience => renderBarItem(experience, false))}
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="mt-4 mb-2 mx-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">범례</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>프로젝트 (왼쪽)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span>경력/교육 (오른쪽)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
              <span>진행 중</span>
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-2 mb-4 mx-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <b>바를 클릭하면 해당 프로젝트/경력 카드로 이동합니다.</b><br/>
            바를 클릭하거나 마우스 오버하면 해당 프로젝트 카드가 하이라이트됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel; 