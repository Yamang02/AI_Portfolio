import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@/design-system';
import styles from './ArticleControlPanel.module.css';

type SortOrder = 'asc' | 'desc';
type SortBy = 'publishedAt' | 'viewCount';

export interface ArticleControlPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (by: SortBy, order: SortOrder) => void;
  viewMode: 'table' | 'gallery';
  onViewModeChange: (mode: 'table' | 'gallery') => void;
}

/**
 * 아티클 컨트롤 패널 컴포넌트
 * 검색, 정렬, 뷰 모드 전환 기능 제공
 */
export const ArticleControlPanel: React.FC<ArticleControlPanelProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    if (isSortMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortMenuOpen]);

  const sortOptions = [
    { by: 'publishedAt' as SortBy, order: 'desc' as SortOrder, label: '발행일 내림차순' },
    { by: 'publishedAt' as SortBy, order: 'asc' as SortOrder, label: '발행일 오름차순' },
    { by: 'viewCount' as SortBy, order: 'desc' as SortOrder, label: '조회수 내림차순' },
    { by: 'viewCount' as SortBy, order: 'asc' as SortOrder, label: '조회수 오름차순' },
  ];

  const currentSortLabel = sortOptions.find(
    opt => opt.by === sortBy && opt.order === sortOrder
  )?.label || '발행일 내림차순';

  const handleSortOptionClick = (by: SortBy, order: SortOrder) => {
    onSortChange(by, order);
    setIsSortMenuOpen(false);
  };

  return (
    <div className={styles.controlPanel}>
      <div className={styles.leftControls}>
        {/* 검색바 */}
        <div className={styles.searchContainer}>
          <Input
            type="text"
            placeholder="아티클 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className={styles.searchInput}
          />
          <Button
            variant="icon"
            size="sm"
            onClick={onSearch}
            ariaLabel="검색"
            className={styles.searchButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Button>
        </div>
      </div>

      <div className={styles.rightControls}>
        {/* 정렬 드롭다운 */}
        <div className={styles.sortContainer} ref={sortMenuRef}>
          <Button
            variant="icon"
            size="sm"
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            ariaLabel="정렬"
            className={styles.sortButton}
          >
            <svg width="16" height="16" viewBox="0 0 512 512" fill="currentColor" stroke="none">
              <g transform="translate(0,512) scale(0.1,-0.1)" fill="currentColor">
                <path d="M1982 4688 c-24 -4 -56 -15 -70 -25 -52 -35 -1340 -1338 -1358 -1373 -27 -55 -23 -137 10 -194 39 -66 93 -99 170 -104 49 -3 71 0 102 16 23 12 234 216 504 486 l465 466 5 -1693 5 -1694 30 -48 c40 -65 97 -95 179 -95 104 1 182 53 206 138 7 25 10 680 10 2000 0 2134 3 2000 -53 2060 -46 49 -129 74 -205 60z" />
                <path d="M2995 4671 c-50 -22 -91 -69 -105 -119 -7 -25 -10 -680 -10 -2000 0 -1749 2 -1967 15 -2000 35 -83 103 -123 207 -123 50 0 77 5 96 18 51 35 1350 1348 1368 1383 10 21 17 57 17 91 0 109 -81 198 -187 207 -105 9 -90 20 -608 -496 l-478 -476 -2 1695 -3 1696 -30 48 c-40 65 -97 95 -179 95 -37 0 -77 -8 -101 -19z" />
              </g>
            </svg>
          </Button>
          {isSortMenuOpen && (
            <div className={styles.sortMenu}>
              {sortOptions.map((option, index) => (
                <button
                  key={index}
                  className={`${styles.sortMenuItem} ${
                    option.by === sortBy && option.order === sortOrder ? styles.active : ''
                  }`}
                  onClick={() => handleSortOptionClick(option.by, option.order)}
                >
                  <span>{option.label}</span>
                  {option.by === sortBy && option.order === sortOrder && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 뷰 모드 전환 */}
        <div className={styles.viewToggle}>
          <Button
            variant="icon"
            size="sm"
            onClick={() => onViewModeChange('table')}
            ariaLabel="테이블 뷰"
            className={viewMode === 'table' ? styles.viewButtonActive : ''}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 3v18" />
            </svg>
          </Button>
          <Button
            variant="icon"
            size="sm"
            onClick={() => onViewModeChange('gallery')}
            ariaLabel="갤러리 뷰"
            className={viewMode === 'gallery' ? styles.viewButtonActive : ''}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
