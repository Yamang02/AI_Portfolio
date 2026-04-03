# Epic E05: cache-boundary-and-ui-primitives-refactor

## 목표

- Redis 캐시 직렬화 정책이 HTTP 요청/응답 JSON 바인딩에 영향을 주지 않도록 ObjectMapper 경계를 분리한다.
- Header/Tooltip 조합에서 발생한 중첩 `<button>` DOM 위반을 제거해 hydration 경고를 재발하지 않게 한다.
- E03/E04에서 드러난 구조적 재발 요인(캐시 포맷 결합, 계약 검증 부재)을 기준 문서와 코드에 반영해 운영 절차를 고정한다.

## 배경 / 맥락

### 현재 상태

E03과 E04 구현 이후, null-safety/정렬 유틸/기능 제거는 완료되었지만 다음 구조 문제가 추가로 확인됐다.

1. Redis 전용 직렬화 설정이 HTTP 바인딩 경계와 섞이면 `AdminLoginRequest` 역직렬화가 실패한다.
2. 디자인시스템 `Tooltip`가 래퍼를 `<button>`으로 렌더링해 `HeaderIconButton`과 중첩될 때 DOM 위반이 발생한다.
3. 캐시 정책은 구현돼 있으나(키 단위 무효화, 직렬화 통일), 문서/운영 절차가 현재 코드와 완전히 동기화되어 있지 않다.

### 문제

- 문제는 단일 기능 버그가 아니라 **경계 설계**(serialization boundary, UI primitive boundary, 운영 경계)에서 재발한다.
- E04 범위(아티클 통계 null-safety)와 구조 리팩터링 범위를 분리하지 않으면 완료 기준이 흐려진다.

## 아키텍처 선택 (요약)

| 축 | 선택 | 근거 |
|----|------|------|
| 백엔드 레이어 | 단일 Spring Boot 모듈, 직렬화·Redis 설정은 `infrastructure/config` | E03과 동일하게 인프라 관심사를 설정 계층에 둔다. Domain/Application 시그니처는 바꾸지 않고 **빈 경계(ObjectMapper)** 만 분리한다. |
| 프론트 구조 | 기존 FSD + 디자인시스템 | `Tooltip`은 primitive로 **비상호작용 래퍼**(`span` 등)를 쓰고, 클릭·포커스 가능한 컨트롤은 자식에만 둔다. |
| 읽기/쓰기 패턴 | 표준 REST + `@Cacheable` | CQRS·이벤트 소싱 범위 아님. |
| BC / 모듈 | BC 경계 변경 없음 | 직렬화·UI DOM 계약 횡단 개선으로 Aggregate/Repository 설계는 건드리지 않는다. |

## 특이점

- E04는 기능 회귀 수정 에픽으로 유지하고, 구조 리팩터링은 E05로 분리한다.
- 백엔드 변경은 Spring Boot 기본 ObjectMapper 경계와 Redis 전용 ObjectMapper 경계를 명시적으로 분리하는 데 집중한다.
- 프론트엔드 변경은 디자인시스템 primitive(`Tooltip`)의 마크업 계약을 우선 수정하고, 소비 컴포넌트는 최소 변경 원칙을 따른다.
- 코드 변경과 함께 basis(CC-01/CC-05) 및 에픽 문서 동기화를 동시에 완료한다.

## Phase 목록

- [P01: 백엔드 캐시 직렬화 경계 분리](./P01.backend-cache-serialization-boundary.md)
- [P02: Tooltip/Header DOM 경계 리팩터](./P02.frontend-tooltip-dom-boundary.md)
- [P03: 캐시 운영·계약 검증 강화](./P03.cache-contract-and-ops-hardening.md)
- [P04: basis 기반 리뷰·문서 동기화](./P04.basis-review-and-epic-sync.md)

## 상태

- **시작일:** 2026-04-03
- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
- [x] P04 완료

## 완료

아카이브일: 2026-04-03
