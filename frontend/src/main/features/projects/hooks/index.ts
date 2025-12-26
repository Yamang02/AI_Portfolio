// @deprecated useTOC는 더 이상 사용하지 않습니다. useTOCFromDOM을 사용하세요.
// 유틸리티 함수만 export (TOCItem 배열 처리용)
export { getTOCItemCount, flattenTOCItems } from './useTOC';

// 활성 섹션 추적 및 스크롤
export { useActiveSection, scrollToSection, getSectionPositions } from './useActiveSection';

// 타입 정의는 @features/project-gallery/hooks에서 import
export type { TOCItem } from '@features/project-gallery/hooks';
