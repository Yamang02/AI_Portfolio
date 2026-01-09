// DOM 기반 TOC 생성 (권장)
export { useTOCFromDOM } from './useTOCFromDOM';

// 활성 섹션 추적 및 스크롤
export { useActiveSection, scrollToSection, getSectionPositions } from './useActiveSection';
export { useScrollToSection } from './useScrollToSection';

// 타입 정의
export type { TOCItem } from './types';

// 유틸리티 함수 (TOCItem 배열 처리용)
export { getTOCItemCount, flattenTOCItems } from './useTOC';
