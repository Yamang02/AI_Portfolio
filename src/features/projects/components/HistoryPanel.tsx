import React from 'react';
import { Project, HistoryItem } from '../types';

interface HistoryPanelProps {
  projects: Project[];
  isOpen: boolean;
  onToggle: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ projects, isOpen, onToggle }) => {
  // 프로젝트를 히스토리 아이템으로 변환
  const historyItems: HistoryItem[] = projects.map(project => ({
    id: project.id,
    title: project.title,
    type: project.type,
    date: project.metadata?.date || '2024', // 기본값 설정
    description: project.description,
    technologies: project.technologies
  }));

  // 연도별로 그룹화
  const groupedByYear = historyItems.reduce((acc, item) => {
    const year = item.date;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  // 연도별 정렬 (최신순)
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* 패널 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">프로젝트 히스토리</h2>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 패널 내용 */}
      <div className="p-4 overflow-y-auto h-full">
        {sortedYears.map(year => (
          <div key={year} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">{year}</h3>
            <div className="space-y-3">
              {groupedByYear[year].map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${
                    item.type === 'project'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.technologies.slice(0, 3).map(tech => (
                          <span
                            key={tech}
                            className={`text-xs px-2 py-1 rounded ${
                              item.type === 'project'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                        {item.technologies.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                            +{item.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'project'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-orange-200 text-orange-800'
                    }`}>
                      {item.type === 'project' ? '프로젝트' : '경험'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel; 