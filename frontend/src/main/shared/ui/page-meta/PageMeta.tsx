import React, { createContext, useContext, useEffect, ReactNode } from 'react';

/**
 * 페이지 스크롤 정책 타입
 * - 'window': window 스크롤 사용 (CSS scroll-driven animation 지원)
 * - 'internal': 페이지 내부 스크롤 (챗봇 등)
 * - 'none': 스크롤 없음
 */
export type ScrollPolicy = 'window' | 'internal' | 'none';

/**
 * 페이지 메타데이터 인터페이스
 */
export interface PageMetaConfig {
  /** 스크롤 정책 */
  scrollPolicy?: ScrollPolicy;
  /** CSS scroll-driven animation 활성화 여부 */
  enableScrollDrivenAnimations?: boolean;
  /** 페이지 전환 애니메이션 활성화 여부 */
  enablePageTransition?: boolean;
  /** Footer 표시 여부 */
  showFooter?: boolean;
}

interface PageMetaContextValue {
  config: PageMetaConfig;
  setConfig: (config: PageMetaConfig) => void;
}

const PageMetaContext = createContext<PageMetaContextValue | null>(null);

/**
 * PageMeta 컴포넌트
 * 각 페이지에서 자신의 메타데이터를 선언할 수 있도록 합니다.
 */
interface PageMetaProps extends PageMetaConfig {
  children: ReactNode;
}

export const PageMeta: React.FC<PageMetaProps> = ({
  children,
  scrollPolicy = 'window',
  enableScrollDrivenAnimations = false,
  enablePageTransition = true,
  showFooter = true,
}) => {
  const context = useContext(PageMetaContext);
  
  useEffect(() => {
    if (context) {
      context.setConfig({
        scrollPolicy,
        enableScrollDrivenAnimations,
        enablePageTransition,
        showFooter,
      });
    }
  }, [scrollPolicy, enableScrollDrivenAnimations, enablePageTransition, showFooter, context]);

  return <>{children}</>;
};

/**
 * PageMetaProvider
 * AnimatedRoutes에서 사용하여 현재 페이지의 메타데이터를 제공합니다.
 */
interface PageMetaProviderProps {
  children: ReactNode;
  onConfigChange?: (config: PageMetaConfig) => void;
}

export const PageMetaProvider: React.FC<PageMetaProviderProps> = ({
  children,
  onConfigChange,
}) => {
  const [config, setConfig] = React.useState<PageMetaConfig>({
    scrollPolicy: 'window',
    enableScrollDrivenAnimations: false,
    enablePageTransition: true,
    showFooter: true,
  });

  const handleSetConfig = React.useCallback((newConfig: PageMetaConfig) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [onConfigChange]);

  return (
    <PageMetaContext.Provider value={{ config, setConfig: handleSetConfig }}>
      {children}
    </PageMetaContext.Provider>
  );
};

/**
 * usePageMeta 훅
 * 현재 페이지의 메타데이터를 가져옵니다.
 */
export const usePageMeta = (): PageMetaContextValue => {
  const context = useContext(PageMetaContext);
  if (!context) {
    throw new Error('usePageMeta must be used within PageMetaProvider');
  }
  return context;
};
