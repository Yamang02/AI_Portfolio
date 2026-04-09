# Epic E08: design-system-token-overhaul

## 목표

- CSS 변수 전체가 `--ds-*` / `--ui-*` 접두사 규칙(DT-02-03)을 따른다
- TypeScript 토큰 파일의 키 구조가 CSS 변수명과 1:1 대응한다
- 다크모드에서 Markdown 렌더러(프로필 페이지)와 ChatBubble(챗봇 페이지)의 가독성 문제가 해소된다
- 80개 CSS Module 파일이 `var(--ds-*)` 를 소비하며 `var(--color-*)` 참조가 사라진다
- z-index / motion 토큰이 정의되어 인라인 하드코딩이 제거된다

## 배경 / 맥락

### 현재 상태

- CSS 변수가 `--color-*`, `--spacing-*`, `--border-radius-*`, `--font-size-*` 등 접두사 없이 혼재
- TypeScript 토큰 파일(`colors.ts`, `typography.ts` 등)의 객체 키 구조와 CSS 변수명이 불일치
- `globals.css`에 `--breakpoint-*` 이중 선언 존재
- `--color-hero-*`, `--color-featured-*` 등 특수 목적 색상이 semantic/shell 구분 없이 globals에 혼재
- z-index, motion/duration 토큰 미존재 (컴포넌트 내 인라인 하드코딩)

### 문제

- 다크모드에서 Markdown 코드블록과 ChatBubble의 색 대비가 불충분해 가독성이 저하됨
- Surface elevation 토큰 부재로 카드/모달 계층 구분이 다크모드에서 무너짐
- 토큰 접두사 불통일로 신규 토큰 추가 시 일관성 유지 비용이 높음

## 특이점

- 다크모드 아키텍처는 `:root.dark` CSS 오버라이드 방식을 유지한다 (ThemeProvider JS 주입 불채택 — 포트폴리오 프로젝트 특성상 과도한 추상화)
- Phase 1~2 사이 컴포넌트 마이그레이션 공백을 `bridge.css` alias로 안전하게 연결한다 (Phase 2 완료 시 삭제)
- `--color-hero-*`, `--color-featured-*` 는 재사용이 없으므로 `--ui-*` 로 이동하거나 컴포넌트 로컬로 흡수한다
- TypeScript 토큰은 "CSS 변수 참조 문서" 역할이므로 컴포넌트가 직접 import해 값을 쓰는 패턴은 허용하지 않는다

## Phase 목록

- [P01: token-redesign-and-dark-mode-fix](./P01.token-redesign-and-dark-mode-fix.md)
- [P02: css-module-migration](./P02.css-module-migration.md)
- [P03: missing-tokens-and-docs](./P03.missing-tokens-and-docs.md)

## 상태

- [x] P01 완료
- [x] P02 완료
- [x] P03 완료

## 완료
아카이브일: 2026-04-10
