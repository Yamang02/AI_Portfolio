# Epic E17: multi-site-schema-and-content-model

## 목표

- E16에서 분리된 `project_visibility` 중심 멀티사이트 스키마 설계를 구현 가능한 Phase로 구체화한다.
- `portfolio`/`business` 사이트 컨텍스트와 콘텐츠 모델(기술카드/아티클)의 경계를 확정한다.
- DB 마이그레이션, 백엔드 API, 프런트 타입/렌더링 변경의 실행 순서를 확정한다.

## 배경 / 맥락

- E16에서 도메인 전략 Option B(단계적 분리)가 확정되었고, 도메인/인프라 정합성은 `D01`에 고정되었다.
- 기존 `D04.technical-portfolio-schema-design.md`는 실행 설계 범위가 커서 E16 완결 범위를 초과했다.
- 따라서 D04를 E17의 P01로 승격하여 후속 구현 에픽으로 분리한다.

## Phase 목록

- [P01: technical-portfolio-schema-design](./P01.technical-portfolio-schema-design.md)

## 상태

- [ ] P01 완료
