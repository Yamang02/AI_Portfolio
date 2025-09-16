/**
 * 날짜 유틸리티 함수들
 */

import { safeSplit, safeIncludes } from './safeStringUtils';

/**
 * YYYY-MM 형식의 날짜 문자열을 Date 객체로 변환
 * @param dateString - YYYY-MM 또는 YYYY-MM-DD 형식의 날짜 문자열 또는 배열 [YYYY, MM, DD]
 * @returns Date 객체
 */
export const parseDate = (dateString: string | any): Date => {
  if (!dateString) {
    throw new Error('Date string is required');
  }
  
  // 배열 형태의 날짜 처리 [YYYY, MM, DD]
  if (Array.isArray(dateString)) {
    if (dateString.length >= 2 && typeof dateString[0] === 'number' && typeof dateString[1] === 'number') {
      const year = dateString[0];
      const month = dateString[1];
      return new Date(year, month - 1, 1);
    }
    throw new Error(`Invalid date array format: ${JSON.stringify(dateString)}`);
  }
  
  // 문자열 형태의 날짜 처리
  if (typeof dateString !== 'string') {
    throw new Error(`Invalid date string type: ${typeof dateString}`);
  }
  
  // YYYY-MM 형식을 YYYY-MM-01로 변환
  const normalizedDate = safeIncludes(dateString, '-') && safeSplit(dateString, '-').length === 2 
    ? `${dateString}-01` 
    : dateString;
    
  const date = new Date(normalizedDate);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  
  return date;
};

/**
 * Date 객체를 YYYY.MM 형식의 문자열로 변환
 * @param date - Date 객체 또는 날짜 문자열
 * @returns YYYY.MM 형식의 문자열
 */
export const formatDateToYYYYMM = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
};

/**
 * 날짜 문자열을 타임라인 위치 퍼센트로 변환
 * @param dateString - YYYY-MM 형식의 날짜 문자열
 * @param minDate - 타임라인 시작 날짜
 * @param maxDate - 타임라인 종료 날짜
 * @param reverse - true면 상단이 최신, false면 하단이 최신
 * @returns 0-100 사이의 퍼센트 값
 */
export const getTimelinePosition = (
  dateString: string, 
  minDate: Date, 
  maxDate: Date, 
  reverse: boolean = true
): number => {
  const date = parseDate(dateString);
  const totalDuration = maxDate.getTime() - minDate.getTime();
  const position = date.getTime() - minDate.getTime();
  const percentage = (position / totalDuration) * 100;
  
  return reverse ? 100 - percentage : percentage;
};

/**
 * 타임라인에 표시할 날짜들을 생성
 * @param minDate - 시작 날짜
 * @param maxDate - 종료 날짜
 * @param intervalMonths - 간격 (개월)
 * @param reverse - true면 최신순, false면 과거순
 * @returns Date 객체 배열
 */
export const generateTimelineDates = (
  minDate: Date,
  maxDate: Date,
  intervalMonths: number = 3,
  reverse: boolean = true
): Date[] => {
  const dates: Date[] = [];
  const start = new Date(minDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  
  const current = new Date(start);
  
  while (current <= maxDate) {
    dates.push(new Date(current));
    current.setMonth(current.getMonth() + intervalMonths);
  }
  
  return reverse ? dates.reverse() : dates;
};

/**
 * 프로젝트 배열에서 최소/최대 날짜를 추출
 * @param projects - 프로젝트 배열
 * @returns { minDate: Date, maxDate: Date }
 */
export const getProjectDateRange = (projects: any[]): { minDate: Date; maxDate: Date } => {
  const allDates = projects
    .flatMap(p => [p.startDate, p.endDate])
    .filter(Boolean);
  
  if (allDates.length === 0) {
    const now = new Date();
    return { minDate: now, maxDate: now };
  }
  
  const timestamps = allDates.map(d => parseDate(d).getTime());
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  
  return {
    minDate: new Date(minTimestamp),
    maxDate: new Date(maxTimestamp)
  };
}; 