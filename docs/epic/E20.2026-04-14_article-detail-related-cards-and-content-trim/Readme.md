# Epic E20: article-detail-related-cards-and-content-trim

## 목표

- 작업물 상세 페이지의 "관련 글" 섹션이 완전히 제거되고, 관련 코드(페이지네이션 상태, TOC 항목, 미사용 import)가 정리된다.
- 아티클 상세 페이지에 연관 기술카드 섹션이 추가되어, 해당 아티클에 연결된 기술카드가 있으면 표시된다.
- 각 프로젝트의 개요 아티클 본문이 1~2문단으로 압축되어 Admin을 통해 저장된다.

## 배경 / 맥락

### 현재 상태

- `ProjectDetailPage`는 `developmentTimelineArticles`를 "관련 글" 섹션으로 렌더링한다 (페이지네이션 포함).
- `ProjectTechnicalCard` 도메인 모델에 `articleId` 필드가 존재하여 기술카드–아티클 연결 데이터는 이미 저장되어 있다. 그러나 아티클 상세 API 응답에 연관 기술카드가 포함되지 않아 프론트에서 표시할 수 없다.
- 각 프로젝트의 개요 아티클(`projectOverviewArticle.content`)이 과도하게 길어 독자 경험을 해친다.

### 문제

- 작업물 상세에서 "관련 글" 섹션은 정보 밀도에 비해 스크롤 비용이 크다. 기술카드에 이미 아티클 연결 정보가 있으므로, 방향을 역전하여 아티클 상세에서 연관 기술카드를 노출하는 것이 더 적합하다.
- 개요 아티클이 길면 작업물 상세 페이지의 핵심 정보 전달이 늦어진다.

## 특이점

- 기술카드 → 아티클 연결(articleId)은 이미 DB에 존재한다. 아티클 → 기술카드 방향의 조회는 백엔드 신규 쿼리가 필요하다.
- 아티클 상세 응답에 기술카드를 포함시키는 방식(응답 확장)과 별도 엔드포인트 방식 중, 응답 확장이 네트워크 왕복을 줄이므로 우선 적용한다.
- 개요 아티클 압축은 코드 변경 없이 Admin UI에서 수행하는 데이터 작업이다.

## Phase 목록

- [P01: 작업물 상세 관련글 섹션 제거 및 코드 정리](./P01.project-detail-related-articles-cleanup.md)
- [P02: 아티클 상세 연관 기술카드 표시](./P02.article-detail-related-technical-cards.md)
- [P03: 프로젝트 개요 아티클 1~2문단 압축 (데이터)](./P03.project-overview-article-content-trim.md)

## 상태

- [x] P01 완료
- [x] P02 완료
- [ ] P03 완료
