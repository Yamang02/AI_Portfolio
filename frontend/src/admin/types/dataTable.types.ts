/**
 * DataTables 서버 사이드 타입 정의
 * 
 * 참고: https://datatables.net/manual/server-side
 */

/**
 * DataTables 서버 사이드 요청 파라미터
 */
export interface DataTableParams {
  draw: number;                    // 요청 순서 번호
  start: number;                   // 시작 인덱스 (페이징)
  length: number;                  // 페이지 크기
  'search[value]': string;         // 검색어
  'order[0][column]'?: number;     // 정렬 컬럼 인덱스
  'order[0][dir]'?: 'asc' | 'desc'; // 정렬 방향

  // 커스텀 필터 (선택적)
  [key: string]: any;
}

/**
 * DataTables 서버 사이드 응답
 */
export interface DataTableResponse<T> {
  draw: number;                    // 요청과 동일한 draw 번호
  recordsTotal: number;            // 전체 레코드 수 (필터 전)
  recordsFiltered: number;         // 필터링된 레코드 수
  data: T[];                       // 실제 데이터
}

/**
 * 정렬 설정
 */
export interface SortConfig {
  column: number;                  // 컬럼 인덱스
  dir: 'asc' | 'desc';            // 정렬 방향
}

/**
 * 필터 옵션
 */
export interface FilterOption {
  key: string;                     // 필터 키 (API 파라미터 이름)
  label: string;                   // 필터 라벨 (UI 표시)
  options: Array<{                 // 선택 옵션
    label: string;
    value: string | number;
  }>;
}

/**
 * 검색 설정
 */
export interface SearchConfig {
  placeholder: string;             // 검색창 placeholder
  fields?: string[];               // 검색 대상 필드 (백엔드 참고용, 실제 검색은 서버에서 처리)
}
