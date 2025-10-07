import React from 'react';
import { TOCItem, flattenTOCItems } from '../../../features/projects/hooks/useTOC';
import { scrollToSection } from '../../../features/projects/hooks/useActiveSection';

interface ProjectModalTOCProps {
  items: TOCItem[];
  activeId: string | null;
  onClose?: () => void;
  className?: string;
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

const ProjectModalTOC: React.FC<ProjectModalTOCProps> = ({
  items,
  activeId,
  onClose,
  className = ''
}) => {
  const flattenedItems = flattenTOCItems(items);

  const handleItemClick = (id: string) => {
    scrollToSection(id, 100, 'smooth');
    
    // 모바일에서 TOC 클릭 시 사이드바 닫기
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  if (items.length === 0) {
    return (
      <aside className={`w-60 h-full overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 ${className}`}>
        <div className="text-center text-gray-500 text-sm py-8">
          목차가 없습니다
        </div>
      </aside>
    );
  }

  return (
    <aside className={`w-60 h-full overflow-y-auto border-r border-gray-200 bg-gray-50 p-4 ${className}`}>
      <nav className="sticky top-0 bg-gray-50 pb-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            목차
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="목차 닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
    </aside>
  );
};

export default ProjectModalTOC;
