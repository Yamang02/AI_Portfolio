# Epic E09: remove-project-search

## 목표

- 프로젝트 목록 페이지에서 검색 모달(버튼 포함)이 완전히 제거된다.
- 프로젝트 카드의 기술스택 태그는 그대로 유지된다.
- 검색 모달 전용 유틸(`techStackCategorization`)이 코드베이스에서 제거된다.

## 배경 / 맥락

### 현재 상태

- `ProjectsListPage`에 검색 아이콘 버튼이 있으며, 클릭 시 `ProjectSearchModal`이 열린다.
- 모달 내부에서 기술스택 다중 선택 + 프로젝트 타입 필터를 클라이언트 사이드로 처리한다.
- 필터링 로직은 `techStackCategorization.ts`(언어/프레임워크/DB/도구 자동 분류)를 의존한다.
- 검색은 백엔드 API를 호출하지 않고 전체 로드된 데이터를 메모리에서 필터링한다.

### 문제

이 포트폴리오는 작성자가 직접 아카이빙하는 사이트로, 방문자는 프로젝트명이나 기술 스택을 사전에 알지 못한다. 검색 기능은 실질적으로 사용되지 않으며, UI에 불필요한 복잡도를 더한다.

## 특이점

- `techStackCategorization.ts`는 `shared/utils/index.ts`를 통해 re-export 되고 있으나, 실제 임포트는 `ProjectSearchModal`에만 존재 → 검색 모달 제거 시 유틸도 함께 제거 가능.
- 기술스택 태그(프로젝트 카드에 표시)는 별도 컴포넌트이므로 이 에픽 범위 밖.
- Admin 측 프로젝트 관리 API의 `ProjectFilter`(검색 파라미터 포함)는 관리자 기능으로 이 에픽 범위 밖 — 제거하지 않음.

## Phase 목록

- [P01: remove-search-modal](./P01.remove-search-modal.md)

## 상태

- [x] P01 완료
