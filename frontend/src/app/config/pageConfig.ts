import type { ScrollPolicy } from '@/shared/hooks/usePageLifecycle';

/**
 * 페이지별 설정 타입
 */
export interface PageConfig {
  /**
   * 스크롤 정책
   */
  scrollPolicy: ScrollPolicy;
  
  /**
   * 스크롤 위치 복원 여부
   */
  restoreScroll: boolean;
  
  /**
   * Footer 표시 여부
   */
  showFooter: boolean;
  
  /**
   * 페이지 키 (스크롤 위치 저장/복원 시 사용)
   */
  pageKey?: string;
}

/**
 * 페이지별 설정 매핑
 * 
 * 각 페이지의 공통 설정을 중앙에서 관리합니다.
 */
export const PAGE_CONFIG: Record<string, PageConfig> = {
  '/': {
    scrollPolicy: 'preserve',
    restoreScroll: true,
    showFooter: true,
    pageKey: 'home',
  },
  '/profile': {
    scrollPolicy: 'top',
    restoreScroll: false,
    showFooter: true,
    pageKey: 'profile',
  },
  '/projects': {
    scrollPolicy: 'top',
    restoreScroll: false,
    showFooter: true,
    pageKey: 'projects',
  },
  '/projects/:id': {
    scrollPolicy: 'top',
    restoreScroll: false,
    showFooter: true,
    pageKey: 'project-detail',
  },
  '/chat': {
    scrollPolicy: 'internal',
    restoreScroll: false,
    showFooter: false,
    pageKey: 'chat',
  },
} as const;

/**
 * 현재 경로에 대한 페이지 설정 가져오기
 * 
 * @param pathname - 현재 경로
 * @returns 페이지 설정 또는 기본값
 */
export const getPageConfig = (pathname: string): PageConfig => {
  // 정확한 매칭
  if (PAGE_CONFIG[pathname]) {
    return PAGE_CONFIG[pathname];
  }
  
  // 동적 경로 매칭 (예: /projects/:id)
  if (pathname.startsWith('/projects/') && pathname !== '/projects') {
    return PAGE_CONFIG['/projects/:id'];
  }
  
  // 기본값
  return {
    scrollPolicy: 'top',
    restoreScroll: false,
    showFooter: true,
  };
};

/**
 * PageConfig를 PageLifecycleConfig로 변환
 * (showFooter 속성 제외)
 */
export const toPageLifecycleConfig = (config: PageConfig): Omit<PageConfig, 'showFooter'> => {
  const { showFooter, ...lifecycleConfig } = config;
  return lifecycleConfig;
};
