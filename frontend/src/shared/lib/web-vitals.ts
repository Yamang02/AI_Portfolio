/**
 * Web Vitals 수집 및 GA4 전송
 * npm install web-vitals 후 사용
 */

import { initGA, isAnalyticsEnabled, trackEvent } from './analytics';

type MetricHandler = (metric: { name: string; value: number; id: string }) => void;

function sendToGA(metric: { name: string; value: number; id: string }): void {
  if (!isAnalyticsEnabled()) return;
  trackEvent('web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
    [metric.name]: metric.value,
  });
}

export function reportWebVitals(onPerfEntry?: MetricHandler): void {
  if (typeof window === 'undefined') return;
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    const handle: MetricHandler = (metric) => {
      sendToGA(metric);
      onPerfEntry?.(metric);
    };
    onCLS(handle);
    onINP(handle);
    onFCP(handle);
    onLCP(handle);
    onTTFB(handle);
  }).catch(() => {
    // web-vitals optional
  });
}

/**
 * 앱 진입 시 GA 초기화 + Web Vitals 리포팅 등록
 * main.tsx 또는 App.tsx에서 한 번 호출
 */
export function initAnalyticsAndWebVitals(): void {
  initGA();
  reportWebVitals();
}
