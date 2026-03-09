/**
 * Google Analytics 4 연동
 * VITE_GA_MEASUREMENT_ID가 설정된 경우에만 활성화 (프로덕션 권장)
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

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export function isAnalyticsEnabled(): boolean {
  return typeof MEASUREMENT_ID === 'string' && MEASUREMENT_ID.length > 0;
}

export function initGA(): void {
  if (!isAnalyticsEnabled() || typeof document === 'undefined') return;
  const id = MEASUREMENT_ID!;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { send_page_view: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
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
