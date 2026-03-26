# Epic: code-quality-and-test-foundation

## 목표

프론트엔드와 백엔드 전반의 코드 품질을 높이고, 회귀 테스트 기반을 마련한다.
구체적으로는 아키텍처 원칙 준수, 가독성 개선, 불필요한 의존성 제거, 성능 최적화,
그리고 핵심 기능에 대한 테스트 커버리지 확보를 목표로 한다.

## 배경 / 맥락

코드베이스 분석 결과 다음 문제들이 발견됨:

**기능 결함**
- 챗봇 시스템 프롬프트가 사실상 비어있어 AI가 포트폴리오 내용을 모른 채 응답
- Gemini 모델명이 yml 설정값을 무시하고 상수로 고정됨
- `LLMException` 이중 정의 (하나는 데드코드)

**아키텍처 위반**
- `DataController`가 JPA Repository를 직접 참조 (헥사고날 원칙 위반)
- `SpamProtectionService`가 Redis 있는데 인메모리 Map 사용 → 재시작 시 초기화
- 프론트-백 스팸 검증 로직 이중 구현 (패턴 수도 불일치)

**프론트엔드 구조**
- `ChatPage.tsx` 560라인 단일 파일 (FSD 미준수)
- `ResponseType` 두 곳에 중복 정의
- `framer-motion` (~130KB gzip)을 페이지 전환 슬라이드 하나에만 사용
- `mermaid` (~500KB) 초기 번들 포함, 지연 로딩 없음
- 모든 페이지에서 4개 API 선제 로딩 (`/chat` 등 불필요한 곳 포함)

**테스트**
- 회귀 테스트 기반 없음

## 특이점

- 백엔드는 헥사고날 아키텍처를 지향하므로, 수정 시 레이어 경계를 명확히 유지
- 프론트는 FSD(Feature-Sliced Design)를 따르므로, 로직 이동 시 슬라이스 기준으로 분리
- 테스트는 "완벽한 커버리지"보다 "핵심 회귀 케이스 방지"에 집중
- 각 Phase는 독립적으로 배포 가능한 단위로 구성

## Phase 목록

- [P01: 백엔드 핵심 결함 수정](./P01-backend-critical-fixes.md) ⏸️ **보류** — AI_Minimal_Agent 완료 후 처리
- [P02: 백엔드 아키텍처 정리](./P02-backend-architecture-cleanup.md)
- [P03: 프론트엔드 코드 품질](./P03-frontend-code-quality.md)
- [P04: 프론트엔드 성능 최적화](./P04-frontend-performance.md)
- [P05: 테스트 기반 구축](./P05-test-foundation.md)
- [P06: SonarQube 보안 검사 도입](./P06-sonarqube-security-scan.md)

## 상태

- [ ] P01 완료 (보류)
- [ ] P02 완료 (코드 반영 완료 — Redis 재시작 QA·백엔드 Maven 컴파일 로컬 확인 남음, [P02 체크리스트](./P02-backend-architecture-cleanup.md) 참고)
- [ ] P03 완료 (코드 반영 완료 — 챗 페이지 수동 QA 남음, [P03 체크리스트](./P03-frontend-code-quality.md) 참고)
- [ ] P04 완료 (코드 반영 완료 — 전환·Network 수동 QA 남음, [P04 체크리스트](./P04-frontend-performance.md) 참고)
- [ ] P05 완료 (프론트 `vitest`는 통과, 백엔드는 테스트 파일 생성 완료이나 `mvnw test` 실행 미확인)
- [ ] P06 완료 (코드/워크플로우/설정 반영 완료, SonarCloud에서 PR 실제 분석/Quality Gate 표시 확인 남음)
