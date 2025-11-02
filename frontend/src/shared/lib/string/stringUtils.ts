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

/**
 * 안전하게 문자열을 대문자로 변환합니다
 * @param str - 변환할 문자열
 * @returns 대문자 문자열 또는 원본 값
 */
export const safeToUpperCase = (str: unknown): string => {
  if (!str || typeof str !== 'string') {
    return String(str || '');
  }

  try {
    return str.toUpperCase();
  } catch (error) {
    console.error('safeToUpperCase: Error converting to uppercase', error);
    return String(str);
  }
};

/**
 * 안전하게 문자열을 트림합니다
 * @param str - 트림할 문자열
 * @returns 트림된 문자열
 */
export const safeTrim = (str: unknown): string => {
  if (!str || typeof str !== 'string') {
    return String(str || '');
  }

  try {
    return str.trim();
  } catch (error) {
    console.error('safeTrim: Error trimming string', error);
    return String(str);
  }
};

/**
 * 안전하게 문자열 길이를 확인합니다
 * @param str - 확인할 문자열
 * @returns 문자열 길이
 */
export const safeLength = (str: unknown): number => {
  if (!str || typeof str !== 'string') {
    return 0;
  }

  try {
    return str.length;
  } catch (error) {
    console.error('safeLength: Error getting string length', error);
    return 0;
  }
};

/**
 * 안전하게 문자열을 자릅니다
 * @param str - 자를 문자열
 * @param maxLength - 최대 길이
 * @param suffix - 접미사 (기본값: '...')
 * @returns 잘린 문자열
 */
export const safeTruncate = (str: unknown, maxLength: number, suffix: string = '...'): string => {
  if (!str || typeof str !== 'string') {
    return String(str || '');
  }

  try {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  } catch (error) {
    console.error('safeTruncate: Error truncating string', error);
    return String(str);
  }
};

/**
 * 안전하게 문자열을 검색합니다
 * @param str - 검색할 문자열
 * @param searchTerm - 검색어
 * @returns 검색 결과 인덱스 또는 -1
 */
export const safeIndexOf = (str: unknown, searchTerm: string): number => {
  if (!str || typeof str !== 'string') {
    return -1;
  }

  try {
    return str.indexOf(searchTerm);
  } catch (error) {
    console.error('safeIndexOf: Error searching string', error);
    return -1;
  }
};

/**
 * 안전하게 문자열을 교체합니다
 * @param str - 교체할 문자열
 * @param searchValue - 검색할 값
 * @param replaceValue - 교체할 값
 * @returns 교체된 문자열
 */
export const safeReplace = (str: unknown, searchValue: string, replaceValue: string): string => {
  if (!str || typeof str !== 'string') {
    return String(str || '');
  }

  try {
    return str.replace(searchValue, replaceValue);
  } catch (error) {
    console.error('safeReplace: Error replacing string', error);
    return String(str);
  }
};

