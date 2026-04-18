/**
 * Google Analytics 4 — `portfolio.yamang02.com` 포트폴리오 SPA 전용
 * 기본 측정 ID `G-XB0PBX9VNG`. `VITE_GA_MEASUREMENT_ID`가 있으면 그 값이 우선한다.
 * (`www.yamang02.com` 프로필 정적 페이지 GA는 `profile/index.html`과 별개.)
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

const DEFAULT_PORTFOLIO_MEASUREMENT_ID = 'G-XB0PBX9VNG';

function resolveMeasurementId(): string {
  const fromEnv = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return DEFAULT_PORTFOLIO_MEASUREMENT_ID;
}

const MEASUREMENT_ID = resolveMeasurementId();

export function isAnalyticsEnabled(): boolean {
  return MEASUREMENT_ID.length > 0;
}

export function initGA(): void {
  if (!isAnalyticsEnabled() || typeof document === 'undefined') return;
  const id = MEASUREMENT_ID;
  const globalScope = globalThis as typeof globalThis & Window;

  globalScope.dataLayer = globalScope.dataLayer || [];
  globalScope.gtag = function gtag() {
    globalScope.dataLayer?.push(arguments);
  };
  globalScope.gtag('js', new Date());
  globalScope.gtag('config', id, { send_page_view: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  const globalScope = globalThis as typeof globalThis & Window;
  if (!isAnalyticsEnabled() || typeof globalScope.gtag !== 'function') return;
  globalScope.gtag('event', eventName, params);
}

/** 챗봇 대화 시작 */
export function trackChatStarted(): void {
  trackEvent('chat_started', { method: 'chat_page' });
}

/** 프로젝트 상세 방문 */
export function trackProjectView(projectId: string, projectTitle: string): void {
  trackEvent('view_item', {
    item_id: projectId,
    item_name: projectTitle,
    content_type: 'project',
  });
}

/** 외부 링크 클릭 */
export function trackOutboundLink(url: string, label?: string): void {
  trackEvent('click', {
    outbound_link: url,
    link_label: label ?? url,
  });
}
