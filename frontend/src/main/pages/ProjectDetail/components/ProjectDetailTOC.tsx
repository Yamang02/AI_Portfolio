import React from 'react';
import { TOCItem, flattenTOCItems } from '@features/project-gallery/hooks/useTOC';
import { scrollToSection } from '@features/project-gallery/hooks/useActiveSection';

interface ProjectDetailTOCProps {
  items: TOCItem[];
  activeId: string | null;
  className?: string;
}

interface TOCItemComponentProps {
  item: TOCItem;
  isActive: boolean;
  level: number;
  onClick: (id: string) => void;
}

const TOCItemComponent: React.FC<TOCItemComponentProps> = React.memo(({
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
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium border-l-2 border-blue-500 dark:border-blue-400'
            : 'text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-elevated dark:hover:bg-slate-700'
          }
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
        aria-current={isActive ? 'location' : undefined}
      >
        {item.text}
      </a>
    </li>
  );
});

TOCItemComponent.displayName = 'TOCItemComponent';

const ProjectDetailTOC: React.FC<ProjectDetailTOCProps> = React.memo(({
  items,
  activeId,
  className = ''
}) => {
  const flattenedItems = flattenTOCItems(items);

  const handleItemClick = (id: string) => {
    scrollToSection(id, 100, 'smooth');
  };

  return (
    <div className={`w-64 bg-surface dark:bg-slate-800 border-l border-border flex flex-col h-full ${className}`}>
      {/* TOC 헤더 */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-text-primary flex items-center mb-2">
          <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          목차
        </h3>
        {flattenedItems.length > 0 && (
          <p className="text-sm text-text-secondary">{flattenedItems.length}개 섹션</p>
        )}
      </div>

      {/* TOC 아이템들 */}
      <div className="flex-1 overflow-y-auto p-4">
        {flattenedItems.length > 0 ? (
          <nav>
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
          </nav>
        ) : (
          <div className="text-center text-text-muted py-8">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-sm">목차가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
});

ProjectDetailTOC.displayName = 'ProjectDetailTOC';

export { ProjectDetailTOC };
