import React from 'react';
import { TOCItem, flattenTOCItems } from '../../features/projects/hooks/useTOC';
import { scrollToSection } from '../../features/projects/hooks/useActiveSection';
import { Project } from '../../entities/project/types';

interface ProjectDetailTOCProps {
  items: TOCItem[];
  activeId: string | null;
  project: Project;
}

interface TOCItemComponentProps {
  item: TOCItem;
  isActive: boolean;
  level: number;
  onClick: (id: string) => void;
}

const TOCItemComponent: React.FC<TOCItemComponentProps> = ({
  item,
  isActive,
  level,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(item.id);
  };

  const paddingLeft = level * 16; // 레벨당 16px 들여쓰기

  return (
    <li className="mb-1">
      <a
        href={`#${item.id}`}
        onClick={handleClick}
        className={`
          block py-2 px-3 rounded-md text-sm transition-all duration-200
          ${isActive
            ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
        aria-current={isActive ? 'location' : undefined}
      >
        {item.text}
      </a>
    </li>
  );
};

const ProjectDetailTOC: React.FC<ProjectDetailTOCProps> = ({
  items,
  activeId,
  project
}) => {
  const flattenedItems = flattenTOCItems(items);

  const handleItemClick = (id: string) => {
    scrollToSection(id, 100, 'smooth');
  };

  if (items.length === 0) {
    return (
      <div className="w-60">
        {/* 프로젝트 메타데이터 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span className="text-sm text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {project.startDate} ~ {project.endDate || '현재'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.isTeam ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {project.isTeam ? '팀 프로젝트' : '개인 프로젝트'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              project.type === 'BUILD' ? 'bg-red-100 text-red-800' :
              project.type === 'LAB' ? 'bg-orange-100 text-orange-800' :
              project.type === 'MAINTENANCE' ? 'bg-green-100 text-green-800' :
              project.type === 'certification' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {project.type === 'BUILD' ? 'BUILD' :
               project.type === 'LAB' ? 'LAB' :
               project.type === 'MAINTENANCE' ? 'MAINTENANCE' :
               project.type === 'certification' ? '자격증' : project.type}
            </span>
            {project.status && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {project.status === 'completed' ? '완료' :
                 project.status === 'in_progress' ? '진행중' :
                 project.status === 'maintenance' ? '유지보수' : project.status}
              </span>
            )}
          </div>
        </div>

        {/* TOC 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="text-center text-gray-500 text-sm py-8">
            목차가 없습니다
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-60">
      {/* 프로젝트 메타데이터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <span className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {project.startDate} ~ {project.endDate || '현재'}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            project.isTeam ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {project.isTeam ? '팀 프로젝트' : '개인 프로젝트'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            project.type === 'BUILD' ? 'bg-red-100 text-red-800' :
            project.type === 'LAB' ? 'bg-orange-100 text-orange-800' :
            project.type === 'MAINTENANCE' ? 'bg-green-100 text-green-800' :
            project.type === 'certification' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {project.type === 'BUILD' ? 'BUILD' :
             project.type === 'LAB' ? 'LAB' :
             project.type === 'MAINTENANCE' ? 'MAINTENANCE' :
             project.type === 'certification' ? '자격증' : project.type}
          </span>
          {project.status && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {project.status === 'completed' ? '완료' :
               project.status === 'in_progress' ? '진행중' :
               project.status === 'maintenance' ? '유지보수' : project.status}
            </span>
          )}
        </div>
      </div>

      {/* TOC 카드 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <nav className="pb-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              목차
            </h3>
          </div>

          {/* TOC 아이템들 */}
          <ul className="space-y-1">
            {flattenedItems.map((item) => (
              <TOCItemComponent
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                level={item.level - 1} // h1은 0레벨로 시작
                onClick={handleItemClick}
              />
            ))}
          </ul>

          {/* 통계 정보 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              총 {flattenedItems.length}개 섹션
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ProjectDetailTOC;



