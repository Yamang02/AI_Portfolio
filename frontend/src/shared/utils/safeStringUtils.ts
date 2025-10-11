/**
 * 안전한 문자열 처리 유틸리티 함수들
 * 레디스 캐시로 인한 타입 변환 문제를 방지합니다.
 */

/**
 * 안전하게 문자열을 분할합니다
 * @param str - 분할할 문자열
 * @param separator - 구분자
 * @returns 분할된 문자열 배열 또는 빈 배열
 */
export const safeSplit = (str: unknown, separator: string | RegExp): string[] => {
  if (!str || typeof str !== 'string') {
    console.warn('safeSplit: Invalid input type', typeof str, str);
    return [];
  }
  
  try {
    return str.split(separator);
  } catch (error) {
    console.error('safeSplit: Error splitting string', error);
    return [];
  }
};

/**
 * 안전하게 날짜 문자열을 포맷팅합니다
 * @param dateStr - 날짜 문자열 (YYYY-MM 형식) 또는 배열 [YYYY, MM, DD]
 * @returns 포맷된 날짜 문자열 (YYYY.MM) 또는 'N/A'
 */
export const safeFormatDate = (dateStr: unknown): string => {
  if (!dateStr) {
    console.warn('safeFormatDate: Empty date input');
    return 'N/A';
  }
  
  // 배열 형태의 날짜 처리 [YYYY, MM, DD]
  if (Array.isArray(dateStr)) {
    if (dateStr.length >= 2 && typeof dateStr[0] === 'number' && typeof dateStr[1] === 'number') {
      const year = dateStr[0];
      const month = dateStr[1];
      return `${year}.${month.toString().padStart(2, '0')}`;
    }
    console.warn('safeFormatDate: Invalid date array format', dateStr);
    return 'N/A';
  }
  
  // 문자열 형태의 날짜 처리
  if (typeof dateStr === 'string') {
    const parts = safeSplit(dateStr, '-');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`;
    }
    console.warn('safeFormatDate: Invalid date string format', dateStr);
    return 'N/A';
  }
  
  console.warn('safeFormatDate: Invalid date input type', typeof dateStr, dateStr);
  return 'N/A';
};

/**
 * 안전하게 문자열이 특정 패턴을 포함하는지 확인합니다
 * @param str - 확인할 문자열
 * @param pattern - 패턴
 * @returns 포함 여부
 */
export const safeIncludes = (str: unknown, pattern: string): boolean => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  try {
    return str.includes(pattern);
  } catch (error) {
    console.error('safeIncludes: Error checking includes', error);
    return false;
  }
};

/**
 * 안전하게 문자열을 소문자로 변환합니다
 * @param str - 변환할 문자열
 * @returns 소문자 문자열 또는 원본 값
 */
export const safeToLowerCase = (str: unknown): string => {
  if (!str || typeof str !== 'string') {
    return String(str || '');
  }

  try {
    return str.toLowerCase();
  } catch (error) {
    console.error('safeToLowerCase: Error converting to lowercase', error);
    return String(str);
  }
};

/**
 * 시작일과 종료일을 포맷팅하여 범위 문자열을 반환합니다
 * @param startDate - 시작일 (YYYY-MM 형식)
 * @param endDate - 종료일 (YYYY-MM 형식, null이면 '현재')
 * @param separator - 구분자 (기본값: ' ~ ')
 * @returns 포맷된 날짜 범위 문자열 (예: '2023.01 ~ 2024.03' 또는 '2023.01 ~ 현재')
 */
export const formatDateRange = (
  startDate: unknown,
  endDate?: unknown | null,
  separator: string = ' ~ '
): string => {
  const formattedStart = safeFormatDate(startDate);
  const formattedEnd = endDate ? safeFormatDate(endDate) : '현재';

  return `${formattedStart}${separator}${formattedEnd}`;
};


