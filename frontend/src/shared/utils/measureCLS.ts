/**
 * Cumulative Layout Shift (CLS) 측정 유틸리티
 * 
 * CLS는 레이아웃 안정성을 측정하는 Core Web Vitals 지표입니다.
 * 값이 낮을수록 좋으며, 0.1 미만이 권장됩니다.
 * 
 * @returns CLS 측정을 중지하는 함수
 */
export function measureCLS(): () => void {
  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // 사용자 입력으로 인한 레이아웃 시프트는 제외
      if (!(entry as any).hadRecentInput) {
        const value = (entry as any).value || 0;
        clsValue += value;
        clsEntries.push(entry);
        
        // 개발 환경에서만 콘솔에 출력
        if (import.meta.env.DEV) {
          console.log('CLS Entry:', {
            value,
            cumulative: clsValue,
            sources: (entry as any).sources,
          });
        }
      }
    }
  });

  try {
    observer.observe({ 
      type: 'layout-shift', 
      buffered: true 
    });
  } catch (e) {
    console.warn('PerformanceObserver not supported:', e);
    return () => {};
  }

  // 페이지 언로드 시 최종 CLS 값 출력
  const handleBeforeUnload = () => {
    if (import.meta.env.DEV) {
      console.log('Final CLS:', clsValue);
      console.log('CLS Entries:', clsEntries);
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // 측정 중지 함수 반환
  return () => {
    observer.disconnect();
    window.removeEventListener('beforeunload', handleBeforeUnload);
    
    if (import.meta.env.DEV) {
      console.log('CLS Measurement stopped. Final value:', clsValue);
    }
  };
}

/**
 * 현재 CLS 값을 반환 (Performance API 사용)
 * 
 * @returns 현재 CLS 값
 */
export function getCurrentCLS(): number {
  try {
    const perfEntries = performance.getEntriesByType('layout-shift') as PerformanceEntry[];
    let clsValue = 0;

    for (const entry of perfEntries) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value || 0;
      }
    }

    return clsValue;
  } catch (e) {
    console.warn('getCurrentCLS failed:', e);
    return 0;
  }
}
