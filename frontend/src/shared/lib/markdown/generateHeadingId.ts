/**
 * 마크다운 헤딩 텍스트로부터 일관된 ID를 생성하는 유틸리티
 * TOC와 실제 렌더링된 헤딩의 ID를 일치시키기 위해 사용
 */

// ID 중복 방지를 위한 카운터 맵
const idCounters = new Map<string, number>();

/**
 * 헤딩 ID 카운터 초기화 (새로운 마크다운 파싱 시작 시 호출)
 */
export const resetHeadingIdCounters = () => {
  idCounters.clear();
};

/**
 * 헤딩 텍스트로부터 유효한 HTML ID를 생성
 *
 * @param text - 헤딩 텍스트
 * @param index - fallback용 인덱스 (선택사항)
 * @returns 생성된 ID
 */
export const generateHeadingId = (text: string, index?: number): string => {
  // ID 생성 (한글, 영문, 숫자, 하이픈만 허용)
  let id = text
    .toLowerCase()
    .replace(/[^\w\s-가-힣]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, ''); // 앞뒤 하이픈 제거

  // ID가 비어있으면 fallback으로 인덱스 사용
  if (!id) {
    id = `heading-${index ?? 0}`;
  }

  // 중복 ID 처리
  if (idCounters.has(id)) {
    const count = idCounters.get(id)! + 1;
    idCounters.set(id, count);
    return `${id}-${count}`;
  } else {
    idCounters.set(id, 0);
    return id;
  }
};
