import React from 'react';
import { Project } from '@features/project-gallery/types';
import { TOCItem, flattenTOCItems } from '@features/project-gallery/hooks/useTOC';
import { scrollToSection } from '@features/project-gallery/hooks/useActiveSection';

interface ProjectDetailSidebarProps {
  project: Project;
  tocItems: TOCItem[];
  activeSection: string | null;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

// 정적 섹션 정의
interface StaticSection {
  id: string;
  title: string;
  level: number;
}

// 전체 TOC 아이템 생성 함수
const createFullTOCItems = (project: Project, markdownTOCItems: TOCItem[]): TOCItem[] => {
  const staticSections: StaticSection[] = [
    { id: 'overview', title: '개요', level: 1 },
  ];

  // 기술스택이 있는 경우 추가
  if (project.technologies && project.technologies.length > 0) {
    staticSections.push({ id: 'tech-stack', title: '기술 스택', level: 1 });
  }

  // 스크린샷이 있는 경우 추가
  if (project.screenshots && project.screenshots.length > 0) {
    staticSections.push({ id: 'gallery', title: '스크린샷 갤러리', level: 1 });
  }

  // 상세설명이 있는 경우 추가
  if (markdownTOCItems.length > 0) {
    staticSections.push({ id: 'detail', title: '상세 설명', level: 1 });
  }

  // 정적 섹션을 TOCItem 형태로 변환
  const staticTOCItems: TOCItem[] = staticSections.map(section => ({
    id: section.id,
    text: section.title,
    level: section.level,
    children: []
  }));

  // 마크다운 헤딩들을 상세설명 섹션의 하위 항목으로 추가
  const detailTOCItems = markdownTOCItems.map(item => ({
    ...item,
    level: item.level + 1 // 상세설명의 하위 레벨로 설정
  }));

  // 정적 섹션과 마크다운 헤딩들을 결합
  const allTOCItems = [...staticTOCItems];
  
  // 상세설명이 있으면 마크다운 헤딩들을 추가
  if (detailTOCItems.length > 0) {
    const detailSectionIndex = allTOCItems.findIndex(item => item.id === 'detail');
    if (detailSectionIndex !== -1) {
      allTOCItems[detailSectionIndex] = {
        ...allTOCItems[detailSectionIndex],
        children: detailTOCItems
      };
    }
  }

  return allTOCItems;
};

interface TOCItemComponentProps {
  item: TOCItem;
  isActive: boolean;
  level: number;
  onClick: (id: string) => void;
}

// 외부 링크 버튼 컴포넌트
const ExternalLinkButton: React.FC<{
  type: 'live' | 'github' | 'notion';
  url: string | undefined;
  title: string;
}> = ({ type, url, title }) => {
  const isDisabled = !url || url === '#';
  
  const getButtonStyle = (type: string) => {
    const baseStyle = 'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full';
    
    if (isDisabled) {
      return `${baseStyle} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    switch (type) {
      case 'live':
        return `${baseStyle} bg-green-100 text-green-700 hover:bg-green-200`;
      case 'github':
        return `${baseStyle} bg-purple-100 text-purple-700 hover:bg-purple-200`;
      case 'notion':
        return `${baseStyle} bg-blue-100 text-blue-700 hover:bg-blue-200`;
      default:
        return `${baseStyle} bg-gray-100 text-gray-700 hover:bg-gray-200`;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'live':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'notion':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934zm14.337-.793c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933l3.269-.187z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (isDisabled) {
    return (
      <button
        disabled
        className={getButtonStyle(type)}
        title={`${title}이(가) 없습니다`}
      >
        {getIcon(type)}
        <span>{type === 'live' ? 'Live Service' : type === 'github' ? 'GitHub' : 'Notion'}</span>
      </button>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={getButtonStyle(type)}
      title={title}
    >
      {getIcon(type)}
      <span>{type === 'live' ? 'Live Service' : type === 'github' ? 'GitHub' : 'Notion'}</span>
      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </a>
  );
};

// TOC 아이템 컴포넌트
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
});

TOCItemComponent.displayName = 'TOCItemComponent';

const ProjectDetailSidebar: React.FC<ProjectDetailSidebarProps> = React.memo(({
  project,
  tocItems,
  activeSection,
  isOpen,
  onToggle,
  className = ''
}) => {
  // 전체 TOC 아이템 생성 (정적 섹션 + 마크다운 헤딩)
  const fullTOCItems = createFullTOCItems(project, tocItems);
  const flattenedItems = flattenTOCItems(fullTOCItems);

  const handleItemClick = (id: string) => {
    scrollToSection(id, 100, 'smooth');
  };

  return (
    <div className={`w-80 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[calc(100vh-8rem)] flex flex-col group">
        {/* 링크 버튼들 - 고정 영역 */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="space-y-3">
            <ExternalLinkButton
              type="live"
              url={project.liveUrl}
              title="운영 중인 서비스로 이동"
            />
            <ExternalLinkButton
              type="github"
              url={project.githubUrl}
              title="GitHub 저장소로 이동"
            />
            <ExternalLinkButton
              type="notion"
              url={project.externalUrl}
              title="Notion 문서로 이동"
            />
          </div>
        </div>

        {/* TOC 헤더 - 고정 영역 */}
        <div className="px-6 pb-4 flex-shrink-0">
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              목차
            </h3>
          </div>
        </div>

        {/* TOC 아이템들 - 스크롤 가능한 영역 */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {flattenedItems.length > 0 ? (
            <nav>
              <ul className="space-y-1">
                {flattenedItems.map((item) => (
                  <TOCItemComponent
                    key={item.id}
                    item={item}
                    isActive={activeSection === item.id}
                    level={item.level - 1} // h1은 0레벨로 시작
                    onClick={handleItemClick}
                  />
                ))}
              </ul>
            </nav>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <div className="text-lg mb-1">📝</div>
              <p className="text-xs">목차가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ProjectDetailSidebar.displayName = 'ProjectDetailSidebar';

export { ProjectDetailSidebar };
