# SNS 포스트 카테고리 추가 Design

## Goal
아티클 카테고리에 `SNS 포스트`를 추가하고, 기존 `category` 필터/배지/관리 화면에서 즉시 사용할 수 있게 한다.

## Background / Current State
- 프론트는 `ARTICLE_CATEGORIES` 상수로 `category` 저장 key와 표시 라벨을 매핑한다.
- 백엔드는 `category`를 문자열로 저장/조회하며, 별도의 카테고리 화이트리스트 검증 로직이 현재 `Article` 도메인에 없다.

## Design
- 프론트의 `ARTICLE_CATEGORIES`에 다음 매핑을 추가한다.
  - `sns-posts` (저장 key) -> `SNS 포스트` (표시 라벨)
- 이후 화면들(관리: `ArticleEdit`, 메인/목록: `CategoryFilterBar`, 배지: `ARTICLE_CATEGORIES` 기반 컴포넌트)이 자동으로 새 카테고리를 표시한다.

## Non-goals (이번 단계)
- SNS 자동 블로그 발행 연동 로직 구현
- 백엔드에서 카테고리를 enum/검증으로 강제하는 작업

## Testing Plan
- 프론트 빌드 타입 체크 통과 확인 (`npm run build`)
- 관리 화면에서 카테고리 선택 옵션에 `SNS 포스트`가 노출되는지 확인
- 메인/목록에서 카테고리 필터 및 배지 라벨이 `SNS 포스트`로 표시되는지 확인

