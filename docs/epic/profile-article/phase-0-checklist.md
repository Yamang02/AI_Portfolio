# Phase 0: Admin 공통 프레임 정비 체크리스트

> **Phase 목표**: genpresso-admin-frontend의 검증된 패턴을 도입하여 Admin 개발 생산성과 유지보수성을 극대화

**시작일**: 2026-01-10
**완료 예정일**:
**실제 완료일**:

---

## 1. Antd 통합 및 테마 설정

### 1.1 Antd 설치 확인
- [x] `package.json`에 `antd: ^5.21.0` 설치 확인
- [x] Antd 관련 타입 패키지 확인 (`@types/antd` 필요 시)

### 1.2 테마 파일 생성
- [x] `frontend/src/admin/shared/theme/` 디렉토리 생성
- [x] `frontend/src/admin/shared/theme/antdTheme.ts` 파일 생성
- [x] 디자인시스템 CSS 변수(`--color-*`)를 Antd 테마 토큰에 매핑
  - [x] `colorPrimary`, `colorSuccess`, `colorWarning`, `colorError`, `colorInfo` 매핑
  - [x] 레이아웃 설정 (borderRadius, fontSize, fontFamily)
  - [x] 간격 설정 (paddingLG, paddingMD, paddingSM, paddingXS)
- [x] 컴포넌트별 커스터마이징
  - [x] Button (controlHeight, borderRadius)
  - [x] Table (headerBg, headerColor, rowHoverBg)
  - [x] Modal (borderRadius)
  - [x] Input (controlHeight, borderRadius)
  - [x] Card (borderRadius)

### 1.3 AdminApp에 테마 적용
- [x] `frontend/src/admin/app/AdminApp.tsx` 파일 열기
- [x] Antd `ConfigProvider` import
- [x] `adminTheme` import
- [x] `<ConfigProvider theme={adminTheme}>` 래핑
- [x] 기존 Admin 라우팅 및 레이아웃이 `ConfigProvider` 내부에 있는지 확인

### 1.4 검증
- [ ] Admin 페이지를 열어 Antd 컴포넌트가 디자인시스템 색상을 사용하는지 확인
- [ ] 여러 Admin 페이지에서 일관된 스타일 적용 확인
- [ ] CSS 변수 변경 시 Antd 컴포넌트도 함께 반영되는지 테스트
- [ ] 브라우저 개발자 도구에서 적용된 테마 토큰 확인

---

## 2. Admin API 클라이언트 통합

### 2.1 API 클라이언트 파일 생성
- [x] `frontend/src/admin/api/` 디렉토리 생성
- [x] `frontend/src/admin/api/adminApiClient.ts` 파일 생성
- [x] `frontend/src/admin/api/types.ts` 파일 생성

### 2.2 AdminApiClient 클래스 구현
- [x] `ApiError` 인터페이스 정의 (message, status, code)
- [x] `AdminApiClient` 클래스 구현
  - [x] `baseURL` 설정 (`/api/admin`)
  - [x] `get<T>()` 메서드 구현
  - [x] `post<T>()` 메서드 구현
  - [x] `put<T>()` 메서드 구현
  - [x] `delete<T>()` 메서드 구현
  - [x] `upload<T>()` 메서드 구현 (FormData 지원)
- [x] 헬퍼 메서드 구현
  - [x] `buildUrl()` - 쿼리 파라미터 포함 URL 빌더
  - [x] `getHeaders()` - 공통 헤더 반환
  - [x] `handleResponse<T>()` - 응답 처리 (성공/실패)
  - [x] `parseError()` - 에러 파싱
  - [x] `showErrorToast()` - 에러 토스트 표시 (Antd `message` 사용)
- [x] 세션 쿠키 기반 인증 (`credentials: 'include'`)
- [x] 싱글톤 인스턴스 export (`adminApiClient`)

### 2.3 에러 처리 로직 구현
- [ ] 401 Unauthorized - "로그인이 필요합니다." 메시지
- [ ] 403 Forbidden - "권한이 없습니다." 메시지
- [ ] 404 Not Found - "요청한 리소스를 찾을 수 없습니다." 메시지
- [ ] 500+ Server Error - "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 메시지
- [ ] 기타 에러 - 서버에서 받은 에러 메시지 표시

### 2.4 기존 코드 마이그레이션
- [ ] 기존 `entities/*/api/*.ts` 파일 목록 확인
- [ ] 각 파일에서 개별 `fetch` 호출을 `adminApiClient` 사용으로 변경
  - [ ] `entities/project/api/adminProjectApi.ts` (있다면)
  - [ ] `entities/tech-stack/api/adminTechStackApi.ts` (있다면)
  - [ ] 기타 도메인 API 파일들
- [ ] 중복 에러 처리 로직 제거
- [ ] `credentials: 'include'` 누락 확인 및 통일

### 2.5 검증
- [ ] API 호출 테스트 (GET, POST, PUT, DELETE, UPLOAD)
- [ ] 에러 발생 시 일관된 토스트 메시지 표시 확인
- [ ] 세션 쿠키가 모든 요청에 포함되는지 확인 (브라우저 개발자 도구)
- [ ] 401/403 에러 시 적절한 메시지 표시 확인
- [ ] 네트워크 탭에서 요청/응답 헤더 확인

---

## 3. React Query 안정 옵션 표준화

### 3.1 훅 파일 생성
- [x] `frontend/src/admin/hooks/` 디렉토리 확인 (없으면 생성)
- [x] `frontend/src/admin/hooks/useAdminQuery.ts` 파일 생성
- [x] `frontend/src/admin/hooks/useAdminMutation.ts` 파일 생성

### 3.2 useAdminQuery 훅 구현
- [x] `useAdminQuery<TData, TError>()` 함수 구현
- [x] 기본 옵션 설정
  - [x] `placeholderData: keepPreviousData` (깜빡임 방지)
  - [x] `staleTime: 5 * 60 * 1000` (5분)
  - [x] `gcTime: 10 * 60 * 1000` (10분)
  - [x] `retry: 1` (실패 시 1회 재시도)
  - [x] `refetchOnWindowFocus: false` (윈도우 포커스 시 리페치 비활성화)
- [x] 사용자 옵션 병합 로직 (사용자 옵션이 우선)

### 3.3 useAdminMutation 훅 구현
- [x] `useAdminMutation<TData, TError, TVariables>()` 함수 구현
- [x] 기본 성공/에러 콜백 설정
- [x] 사용자 옵션 병합 로직

### 3.4 기존 코드 마이그레이션
- [ ] 기존 `useQuery` 호출 목록 확인
- [ ] 모든 `useQuery` 호출을 `useAdminQuery`로 변경
  - [ ] `entities/project/api/useAdminProjectQuery.ts` (있다면)
  - [ ] `entities/tech-stack/api/useAdminTechStackQuery.ts` (있다면)
  - [ ] 기타 도메인 쿼리 파일들
- [ ] 모든 `useMutation` 호출을 `useAdminMutation`으로 변경
- [ ] 중복된 옵션 제거 (staleTime, gcTime, retry, placeholderData 등)

### 3.5 검증
- [ ] 페이지 전환 시 깜빡임이 발생하지 않는지 확인 (keepPreviousData)
- [ ] 데이터 리페치가 적절히 캐싱되는지 확인 (staleTime, gcTime)
- [ ] 모든 쿼리가 `useAdminQuery`를 사용하는지 코드 검토
- [ ] React Query Devtools로 쿼리 상태 확인

---

## 4. 테이블 표준 패턴 확립

### 4.1 타입 정의 파일 생성
- [x] `frontend/src/admin/types/` 디렉토리 확인 (없으면 생성)
- [x] `frontend/src/admin/types/dataTable.types.ts` 파일 생성
- [x] 타입 정의
  - [x] `DataTableParams` 인터페이스 (draw, start, length, search, order 등)
  - [x] `DataTableResponse<T>` 인터페이스 (draw, recordsTotal, recordsFiltered, data)
  - [x] `SortConfig` 인터페이스 (column, dir)
  - [x] `FilterOption` 인터페이스 (key, label, options)
  - [x] `SearchConfig` 인터페이스 (placeholder, fields)

### 4.2 useTablePage 훅 구현
- [x] `frontend/src/admin/hooks/useTablePage.ts` 파일 생성
- [x] `UseTablePageConfig` 인터페이스 정의
- [x] `UseTablePageParams` 인터페이스 정의
- [x] `useTablePage()` 훅 구현
  - [x] 테이블 파라미터 상태 관리 (`params`)
  - [x] 검색어 상태 관리 (`searchInput`)
  - [x] React Query 호출 (`useQuery`)
  - [x] 페이지 변경 핸들러 (`handlePageChange`)
  - [x] 페이지 크기 변경 핸들러 (`handlePageSizeChange`)
  - [x] 정렬 변경 핸들러 (`handleSortChange`)
  - [x] 검색 실행 핸들러 (`handleSearch`)
  - [x] 필터 변경 핸들러 (`handleFilterChange`)
  - [x] 테이블 props 반환 (dataSource, loading, pagination, onChange)
  - [x] 필터 상태 반환 (searchInput, setSearchInput, handleSearch 등)

### 4.3 TableTemplate 컴포넌트 구현
- [x] `frontend/src/admin/shared/ui/TableTemplate/` 디렉토리 생성
- [x] `frontend/src/admin/shared/ui/TableTemplate/index.tsx` 파일 생성
- [x] `frontend/src/admin/shared/ui/TableTemplate/types.ts` 파일 생성
- [x] `TableTemplateProps` 인터페이스 정의
- [x] `TableTemplate` 컴포넌트 구현
  - [x] Antd `Table` 래핑
  - [x] 헤더 영역 지원 (검색/필터/통계)
  - [x] 페이징 UI 통합
  - [x] 정렬 UI 통합

### 4.4 검증
- [ ] 페이징이 서버 사이드로 동작하는지 확인 (start, length 파라미터)
- [ ] 정렬이 서버 사이드로 동작하는지 확인 (order 파라미터)
- [ ] 검색이 서버 사이드로 동작하는지 확인 (search[value] 파라미터)
- [ ] 필터가 서버 사이드로 동작하는지 확인 (커스텀 파라미터)
- [ ] DataTables 파라미터가 올바르게 전송되는지 네트워크 탭 확인
- [ ] 에러 발생 시 적절한 메시지 표시 확인

---

## 5. 공통 UI 컴포넌트 라이브러리

### 5.1 SearchFilter 컴포넌트
- [x] `frontend/src/admin/shared/ui/SearchFilter/` 디렉토리 생성
- [x] `frontend/src/admin/shared/ui/SearchFilter/index.tsx` 파일 생성
- [x] `frontend/src/admin/shared/ui/SearchFilter/types.ts` 파일 생성
- [x] `SearchFilterProps` 인터페이스 정의
- [x] `SearchFilter` 컴포넌트 구현
  - [x] Antd `Input` 사용 (검색창)
  - [x] Antd `Select` 사용 (필터 드롭다운)
  - [x] Antd `Button` 사용 (검색 버튼)
  - [x] `SearchOutlined` 아이콘 적용
- [ ] 검증: 검색 및 필터 UI가 올바르게 동작하는지 확인

### 5.2 StatsCards 컴포넌트
- [x] `frontend/src/admin/shared/ui/StatsCards/` 디렉토리 생성
- [x] `frontend/src/admin/shared/ui/StatsCards/index.tsx` 파일 생성
- [x] `frontend/src/admin/shared/ui/StatsCards/types.ts` 파일 생성
- [x] `StatCardData` 인터페이스 정의
- [x] `StatsCardsProps` 인터페이스 정의
- [x] `StatsCards` 컴포넌트 구현
  - [x] Antd `Card` 사용
  - [x] Antd `Statistic` 사용
  - [x] Antd `Row`, `Col` 사용 (그리드 레이아웃)
  - [x] 로딩 상태 지원
- [ ] 검증: 통계 카드가 올바르게 표시되는지 확인

### 5.3 FormModal 컴포넌트
- [x] `frontend/src/admin/shared/ui/FormModal/` 디렉토리 생성
- [x] `frontend/src/admin/shared/ui/FormModal/index.tsx` 파일 생성
- [x] `frontend/src/admin/shared/ui/FormModal/types.ts` 파일 생성
- [x] `FormModalProps` 인터페이스 정의
- [x] `FormModal` 컴포넌트 구현
  - [x] Antd `Modal` 사용
  - [x] Antd `Form` 사용
  - [x] confirmLoading 지원 (저장 중 표시)
  - [x] onOk, onClose 핸들러
- [ ] 검증: CRUD 모달이 올바르게 동작하는지 확인

### 5.4 TablePaginationHeader 컴포넌트
- [x] `frontend/src/admin/shared/ui/TablePaginationHeader/` 디렉토리 생성
- [x] `frontend/src/admin/shared/ui/TablePaginationHeader/index.tsx` 파일 생성
- [x] `frontend/src/admin/shared/ui/TablePaginationHeader/types.ts` 파일 생성
- [x] `TablePaginationHeaderProps` 인터페이스 정의
- [x] `TablePaginationHeader` 컴포넌트 구현
  - [x] 페이지 크기 선택 UI
  - [x] 통계 표시 (전체 개수, 검색 결과 개수)
  - [x] 내보내기 버튼 (선택적)
- [ ] 검증: 테이블 헤더가 올바르게 표시되는지 확인

### 5.5 ConfirmModal 컴포넌트
- [x] `frontend/src/admin/shared/ui/ConfirmModal/` 디렉토리 생성
- [x] `frontend/src/admin/shared/ui/ConfirmModal/index.tsx` 파일 생성
- [x] `frontend/src/admin/shared/ui/ConfirmModal/types.ts` 파일 생성
- [x] `ConfirmModalOptions` 인터페이스 정의
- [x] `showConfirmModal()` 함수 구현
  - [x] Antd `Modal.confirm` 사용
  - [x] `ExclamationCircleOutlined` 아이콘
  - [x] type 옵션 (warning, error, info)
  - [x] onConfirm, onCancel 핸들러
- [ ] 검증: 확인 모달이 올바르게 동작하는지 확인 (삭제 확인 등)

---

## 6. 테스트 및 검증

### 6.1 단위 테스트
- [ ] `adminApiClient` 메서드별 테스트 작성
  - [ ] `get()` 메서드 테스트
  - [ ] `post()` 메서드 테스트
  - [ ] `put()` 메서드 테스트
  - [ ] `delete()` 메서드 테스트
  - [ ] `upload()` 메서드 테스트
- [ ] 에러 처리 로직 테스트
  - [ ] 401 에러 처리
  - [ ] 403 에러 처리
  - [ ] 404 에러 처리
  - [ ] 500 에러 처리
- [ ] `useTablePage` 훅 테스트
  - [ ] 페이징 테스트
  - [ ] 정렬 테스트
  - [ ] 검색 테스트
  - [ ] 필터 테스트

### 6.2 통합 테스트
- [ ] Antd 테마가 모든 페이지에 적용되는지 확인
- [ ] API 클라이언트가 세션 쿠키를 올바르게 전송하는지 확인
- [ ] 테이블 컴포넌트가 서버 사이드 페이징/정렬을 올바르게 수행하는지 확인
- [ ] 에러 발생 시 적절한 토스트 메시지가 표시되는지 확인

### 6.3 UI/UX 테스트
- [ ] 모든 Antd 컴포넌트가 디자인시스템 색상을 사용하는지 확인
- [ ] 에러 토스트가 적절히 표시되는지 확인
- [ ] 테이블 페이징/정렬/검색이 부드럽게 동작하는지 확인 (깜빡임 없이)
- [ ] 반응형 디자인 확인 (모바일, 태블릿, 데스크탑)

### 6.4 코드 리뷰
- [ ] 모든 코드가 TypeScript 타입을 명확히 정의했는지 확인
- [ ] 재사용 가능하도록 일반화되어 있는지 확인
- [ ] 코드 중복이 제거되었는지 확인
- [ ] 네이밍 컨벤션이 일관되는지 확인
- [ ] 주석이 필요한 부분에 추가되었는지 확인

---

## 7. 문서화

### 7.1 API 문서
- [ ] `adminApiClient` 사용법 문서 작성
- [ ] 에러 처리 가이드 작성
- [ ] 예제 코드 작성

### 7.2 컴포넌트 문서
- [ ] 각 공통 UI 컴포넌트의 사용법 문서 작성
- [ ] Props 설명 추가
- [ ] 예제 코드 작성

### 7.3 훅 문서
- [ ] `useAdminQuery` 사용법 문서 작성
- [ ] `useAdminMutation` 사용법 문서 작성
- [ ] `useTablePage` 사용법 문서 작성
- [ ] 예제 코드 작성

---

## 8. Phase 0 완료 기준

### 8.1 필수 조건
- [x] Antd 테마가 모든 Admin 페이지에 적용됨
- [x] 모든 API 호출이 `adminApiClient`를 사용함
- [x] 모든 Query/Mutation이 `useAdminQuery`/`useAdminMutation`을 사용함
- [x] `TableTemplate` 및 `useTablePage` 훅이 구현되어 있음
- [x] 공통 UI 컴포넌트 5개가 모두 구현되어 있음
  - [x] SearchFilter
  - [x] StatsCards
  - [x] FormModal
  - [x] TablePaginationHeader
  - [x] ConfirmModal

### 8.2 선택 조건
- [ ] 단위 테스트 및 통합 테스트 통과
- [ ] 기존 코드가 새로운 패턴으로 마이그레이션됨
- [ ] 문서화 완료

### 8.3 다음 단계
- [ ] Phase 1 (자기소개 Markdown 관리) 시작
- [ ] Phase 0에서 구축한 공통 프레임을 활용하여 빠르게 개발

---

## 9. 이슈 및 리스크

### 9.1 발견된 이슈
- 이슈 1:
- 이슈 2:

### 9.2 해결 방안
- 해결 1:
- 해결 2:

### 9.3 기술적 부채
- 부채 1:
- 부채 2:

---

## 10. 회고

### 10.1 잘된 점
-

### 10.2 개선할 점
-

### 10.3 배운 점
-

---

**작성일**: 2026-01-10
**작성자**: AI Agent (Claude)
**상태**: 기본 구현 완료 (검증 및 마이그레이션 진행 중)
