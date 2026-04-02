# Epic E03: article-statistics-null-safety

## 목표

- `ArticleListPage`의 시리즈 목록 정렬 시 `seriesTitle`이 `undefined`/`null`이어도 크래시 없이 동작한다.
- 백엔드 `ArticleStatistics` 통계 응답에서 `seriesTitle`이 null로 반환되는 데이터 정합성 문제가 제거된다.
- 프론트엔드 통계 응답 소비 코드가 null 필드에 방어적으로 동작하여 ErrorBoundary 진입을 차단한다.

## 배경 / 맥락

### 현재 상태

E02(Redis 직렬화 리팩토링) 완료 후 Redis 캐시가 플러시되어 통계 API가 DB에서 신선한 데이터를 반환하기 시작했다.  
`GET /api/articles/statistics` 응답의 `series[].seriesTitle` 필드 일부가 `null`로 전달되고, `ArticleListPage`의 `useMemo` 정렬 로직이 이를 `undefined`로 처리하여 `localeCompare` 호출에서 런타임 오류가 발생한다.

```
TypeError: Cannot read properties of undefined (reading 'localeCompare')
  at ArticleListPage (useMemo → .sort)
```

### 문제

1. **프론트엔드**: `statistics.series.map(s => ({ title: s.seriesTitle })).sort((a, b) => a.title.localeCompare(b.title))` — `a.title`이 `null`/`undefined`일 때 즉시 크래시.
2. **백엔드**: `PostgresArticleRepository.getStatistics()`에서 `series.getTitle()`이 일부 시리즈 엔티티에서 null을 반환하거나, `seriesId`는 존재하나 대응하는 `ArticleSeries` 엔티티가 없을 때 null title이 통계 응답에 포함된다.

## 특이점

- E02 P01~P04 완료 후 캐시 플러시로 인해 잠재적 DB 정합성 문제가 노출됨 — 직접 원인은 E02가 아니라 E02가 캐시 마스킹을 제거한 것.
- `GetArticleStatisticsService`에는 `@Cacheable`이 없어 Redis 역직렬화 문제가 아닌 DB → 도메인 매핑 문제임을 확인.
- 프론트엔드 수정은 방어적 null 처리이며 API 타입에서 `seriesTitle: string | null`로 명시한다.
- 백엔드 수정은 Infrastructure 레이어의 데이터 수집 로직에서 null-guard 또는 고아 참조 필터링.
- P05 검토 시 CC-01 규칙은 **basis 문서** [`CC-01-logic-level-rules.md`](../../basis/coding/CC-01-logic-level-rules.md)를 따른다(스킬 이름 `cc-01-logic-level`과 혼동하지 않음).
- `CareerTimeline`: 월 단위 날짜 파싱·정렬 키는 `flexibleMonthDate.ts`로 유틸화하고, 항목 생성 시 `sortKeyMs`를 넣어 정렬 시 `find()` 재조회를 제거했다(CC-01-05·가독성).
- 직렬화 경계(ObjectMapper 분리), 디자인시스템 primitive DOM 계약(Tooltip wrapper) 같은 구조 리팩터링 항목은 E04로 분리해 진행한다.

## Phase 목록

- [P01: 프론트엔드 null-safe 정렬 수정](./P01.frontend-null-safe-sort.md)
- [P02: 백엔드 seriesTitle null 원인 제거](./P02.backend-series-title-null-fix.md)
- [P03: sort 유틸리티 도입 및 전체 패턴 리팩터](./P03.sort-utility-and-refactor.md)
- [P04: Easter egg 피처 코드 삭제](./P04.easter-egg-removal.md)
- [P05: 스킬 기반 검토 및 반영](./P05.skill-review-and-remediation.md)

## 상태

- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
- [x] P04 완료
- [x] P05 완료

## 범위 고정 / 이관

- E03은 아티클 통계 null-safety와 관련된 기능 수정 범위로 고정한다.
- 구조 리팩터링 및 경계 재설계 항목은 [E04](../E04.2026-04-03_cache-boundary-and-ui-primitives-refactor/Readme.md)에서 진행한다.
