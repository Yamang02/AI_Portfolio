/**
 * API·캐시 등에서 월 단위로만 오는 날짜(YYYY-MM, [YYYY, MM, …])를 파싱한다.
 * 표시용은 {@link safeFormatDate} 등과 맞추기 위해 동일한 형태를 수용한다.
 */

/**
 * 알 수 없거나 빈 입력이면 `new Date()`(현재 시각)를 반환한다.
 * 호출부 정렬에서 누락 데이터를 “최근”으로 몰아넣는 기존 동작과 동일하다.
 */
export function parseFlexibleMonthToDate(value: unknown): Date {
  if (!value) {
    return new Date();
  }

  if (Array.isArray(value)) {
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      const year = value[0];
      const month = value[1];
      return new Date(year, month - 1, 1);
    }
    return new Date();
  }

  if (typeof value === 'string') {
    const parts = value.split('-');
    if (parts.length >= 2) {
      return new Date(Number.parseInt(parts[0], 10), Number.parseInt(parts[1], 10) - 1, 1);
    }
    return new Date(value);
  }

  return new Date();
}

/** 정렬·비교용: 해당 월의 시작 시각을 UTC가 아닌 로컬 기준 ms로 반환 */
export function startOfMonthTimeMs(value: unknown): number {
  return parseFlexibleMonthToDate(value).getTime();
}
