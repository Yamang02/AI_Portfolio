/**
 * Currency 포맷팅 유틸리티
 *
 * 각 클라우드 프로바이더의 청구 통화(billing currency)를 적절하게 포맷팅합니다.
 */

export type SupportedCurrency = 'USD' | 'KRW' | string;

/**
 * Currency에 맞는 접두사 기호 반환
 */
export const getCurrencySymbol = (currency: SupportedCurrency): string => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'KRW':
      return '₩';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    default:
      return '';
  }
};

/**
 * Currency에 맞는 숫자 포맷 반환
 */
export const formatCurrencyValue = (value: number, currency: SupportedCurrency): string => {
  switch (currency) {
    case 'USD':
    case 'EUR':
    case 'GBP':
      // 달러, 유로, 파운드: 소수점 2자리
      return value.toFixed(2);

    case 'KRW':
    case 'JPY':
      // 원, 엔: 소수점 없음, 천단위 구분자
      return value.toLocaleString('ko-KR', { maximumFractionDigits: 0 });

    default:
      // 기타: 소수점 2자리
      return value.toFixed(2);
  }
};

/**
 * Currency 전체 포맷 (기호 + 숫자)
 */
export const formatCurrency = (value: number, currency: SupportedCurrency): string => {
  const symbol = getCurrencySymbol(currency);
  const formattedValue = formatCurrencyValue(value, currency);

  if (symbol) {
    return `${symbol}${formattedValue}`;
  }

  return `${formattedValue} ${currency}`;
};

/**
 * Currency 전체 포맷 (기호와 숫자 분리 반환)
 * Ant Design Statistic 컴포넌트에서 사용
 */
export const formatCurrencySeparate = (
  value: number,
  currency: SupportedCurrency
): { prefix: string; value: string } => {
  return {
    prefix: getCurrencySymbol(currency),
    value: formatCurrencyValue(value, currency),
  };
};
