/** null/undefined를 빈 문자열로 처리하여 문자열 두 값을 비교 */
export const compareStrings = (
  a: string | null | undefined,
  b: string | null | undefined,
): number => (a ?? '').localeCompare(b ?? '');
