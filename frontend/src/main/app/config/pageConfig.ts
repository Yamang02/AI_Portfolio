import type { ScrollPolicy } from '@/main/shared/hooks/usePageLifecycle';

/**
 * ?�이지�??�정 ?�?? */
export interface PageConfig {
  /**
   * ?�크�??�책
   */
  scrollPolicy: ScrollPolicy;
  
  /**
   * ?�크�??�치 복원 ?��?
   */
  restoreScroll: boolean;
  
  /**
   * Footer ?�시 ?��?
   */
  showFooter: boolean;
  
  /**
   * ?�이지 ??(?�크�??�치 ?�??복원 ???�용)
   */
  pageKey?: string;
}

/**
 * ?�이지�??�정 매핑
 * 
 * �??�이지??공통 ?�정??중앙?�서 관리합?�다.
 */
export const PAGE_CONFIG: Record<string, PageConfig> = {
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
 * ?�재 경로???�???�이지 ?�정 가?�오�? * 
 * @param pathname - ?�재 경로
 * @returns ?�이지 ?�정 ?�는 기본�? */
export const getPageConfig = (pathname: string): PageConfig => {
  // ?�확??매칭
  if (PAGE_CONFIG[pathname]) {
    return PAGE_CONFIG[pathname];
  }
  
  // ?�적 경로 매칭 (?? /projects/:id)
  if (pathname.startsWith('/projects/') && pathname !== '/projects') {
    return PAGE_CONFIG['/projects/:id'];
  }
  
  // 기본�?  return {
    scrollPolicy: 'top',
    restoreScroll: false,
    showFooter: true,
  };
};

/**
 * PageConfig�?PageLifecycleConfig�?변?? * (showFooter ?�성 ?�외)
 */
export const toPageLifecycleConfig = (config: PageConfig): Omit<PageConfig, 'showFooter'> => {
  const { showFooter, ...lifecycleConfig } = config;
  return lifecycleConfig;
};
