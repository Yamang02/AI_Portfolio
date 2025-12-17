/**
 * 프로젝트 데이터 변환 유틸리티
 * 모든 데이터 변환 로직을 중앙화하여 타입 안전성 보장
 */

/**
 * myContributions를 string[]로 변환
 * Form에서는 문자열(줄바꿈 구분) 또는 배열 모두 가능
 */
export function transformMyContributions(
  value: string | string[] | undefined | null
): string[] | undefined {
  if (!value) return undefined;
  
  if (Array.isArray(value)) {
    // 이미 배열인 경우 필터링만 수행
    const filtered = value.filter((line): line is string => 
      typeof line === 'string' && line.trim().length > 0
    );
    return filtered.length > 0 ? filtered : undefined;
  }
  
  if (typeof value === 'string') {
    // 문자열인 경우 줄바꿈으로 분리
    const split = value.split('\n').filter(line => line.trim().length > 0);
    return split.length > 0 ? split : undefined;
  }
  
  console.warn('[transformMyContributions] Unexpected type:', typeof value, value);
  return undefined;
}

/**
 * technologies를 number[]로 변환
 * Form에서는 number[] 또는 string[] 모두 가능 (API는 number[]만 허용)
 */
export function transformTechnologies(
  value: number[] | string[] | undefined | null
): number[] | undefined {
  if (!value) return undefined;
  
  if (!Array.isArray(value)) {
    console.warn('[transformTechnologies] Expected array, got:', typeof value, value);
    return undefined;
  }
  
  // 모든 요소를 number로 변환 시도
  const numbers = value
    .map(item => {
      if (typeof item === 'number') {
        return isNaN(item) || item <= 0 ? null : item;
      }
      if (typeof item === 'string') {
        const parsed = parseInt(item, 10);
        return isNaN(parsed) || parsed <= 0 ? null : parsed;
      }
      return null;
    })
    .filter((id): id is number => id !== null);
  
  return numbers.length > 0 ? numbers : undefined;
}

/**
 * screenshots를 string[]로 변환
 * Form에서는 객체 배열 또는 문자열 배열 모두 가능 (API는 string[]만 허용)
 */
export function transformScreenshots(
  value: any[] | undefined | null
): string[] | undefined {
  if (!value || !Array.isArray(value)) return undefined;
  
  const urls = value
    .map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && item.imageUrl) {
        return item.imageUrl;
      }
      return null;
    })
    .filter((url): url is string => url !== null && typeof url === 'string' && url.length > 0);
  
  return urls.length > 0 ? urls : undefined;
}

