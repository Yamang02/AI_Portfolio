# Technical Reference

이 디렉터리는 AI_Portfolio의 기술 참고자료, 과거 설계 및 운영 기록을 보존한다. **현행 개발 규칙의 SSOT가 아니며, 문서 자체를 `docs/dev/`로 이관하지 않는다.**

## 문서 성격

| 분류 | 의미 | 위치 및 대표 자료 |
|---|---|---|
| **Reference** | 기술 원리, 구현 패턴, 상세 예제 | [architecture](./architecture/), [guides](./guides/), [design-system](./design-system/) |
| **Historical** | 작성 당시의 설계·조사·구현 상태 기록 | [current-service-architecture](./architecture/current-service-architecture.md), [structure-analysis-and-improvements](./architecture/structure-analysis-and-improvements.md), [과거 문서화 결정](./decisions/agentic-docs-system-architecture.md) |
| **Operations** | 운영·배포·장애 조사 기록 및 절차 | [infrastructure](./infrastructure/README.md), [chunk load error](./guides/frontend/chunk-load-error-fix.md) |
| **Specification** | 실제 코드와 정합성을 따로 검증해야 하는 명세 | [api-spec.yml](./api-spec.yml), [API documentation](./guides/backend/api-documentation.md) |

이 분류는 문서를 삭제·이동하기 위한 기준이 아니라 **읽을 때의 성격**을 설명하기 위한 것이다. 하나의 자료가 여러 성격을 가질 수 있다.

## 우선순위와 사용 방법

- 현행 제품 의미·보장은 [Product](../product/README.md), 개발 아키텍처·코딩 규칙·기술 계약은 [Dev](../dev/README.md)가 소유한다.
- 공통 코딩 규칙: [Dev conventions](../dev/conventions.md). 프론트엔드: [Frontend conventions](../dev/frontend/conventions.md). 백엔드: [Backend conventions](../dev/backend/conventions.md).
- 실제 **구현 상태**는 소스 코드, 설정, 테스트 및 배포 구성을 통해 확인한다. 과거 문서에서 `현재`, `완료`, `표준`이라고 표현해도 최신 상태라는 뜻은 아니다.
- 참고자료의 코드 조각을 현행 권장 구현으로 자동 채택하지 않는다. 충돌하면 변경 범위의 실제 소유자와 현재 계약을 먼저 확인한다.
- 이 디렉터리의 원본 자료는 별도의 요청 없이 대량 수정하거나 Dev로 이전하지 않는다.

## 주의할 과거 사례

- [프론트엔드 초기 구조](./architecture/frontend-architecture.md)와 [Main/Admin 분리 설계](./architecture/fsd-refactoring.md)는 서로 다른 구조적 시점을 설명한다. 현재 구조는 코드를 확인한다.
- [서비스 구성 기록](./architecture/current-service-architecture.md)은 별도 FastAPI AI 서비스 등을 기술한다. 현재 배포 상태로 단정하지 않는다.
- [백엔드 아키텍처 가이드](./architecture/backend-architecture-guide.md), [코딩 예제](./guides/backend/coding-principles.md), [CRUD 예제](./guides/backend/crud-template-guide.md)에서 사용하는 `@Cacheable`/`@CacheEvict` 패턴은 현행 캐시 정책이 아니다. 적용 전에 실제 Port/Adapter 경계를 확인한다.
- [프론트엔드 코딩 예제](./guides/frontend/coding-principles.md)에 있는 고정 라인 수·스타일 제한은 [현행 Frontend conventions](../dev/frontend/conventions.md)를 대신하지 않는다.
- [인프라 인벤토리](./infrastructure/inventory.md)는 작성 당시의 스냅샷이다. 현행 리소스는 실제 운영 설정에서 확인한다.

## 탐색

### Architecture

- [전체 시스템 아키텍처](./architecture/system-architecture-overview.md)
- [서비스 구성 기록](./architecture/current-service-architecture.md)
- [백엔드 아키텍처 상세](./architecture/backend-architecture-guide.md)
- [프론트엔드 아키텍처 상세](./architecture/frontend-architecture.md)
- [FSD 재구성 자료](./architecture/fsd-refactoring.md)
- [헥사고날 데이터 전송 형태](./architecture/hexagonal-architecture-data-transfer.md)
- [구조 분석과 개선 기록](./architecture/structure-analysis-and-improvements.md)
- [디자인 패턴 분석](./architecture/design-patterns.md)

### Guides

- [개발 환경 참고 가이드](./guides/DEVELOPMENT.md)
- [Backend](./guides/backend/): 헥사고날 아키텍처, CRUD, 인증, 성능, 코딩 예제, 문제 해결
- [Frontend](./guides/frontend/): FSD, CRUD, Storybook, 반응형, 스타일, 성능, 문제 해결
- [식별자 사용 가이드](./guides/identifier-usage-guide.md)
- [SonarQube 이슈 학습](./guides/sonarqube-fixes-study-guide.md) — 운영 정책은 [SonarQube quality basis](../basis/quality/SQ-01-local-sonarqube-workflow.md) 참고

### Design and operations

- [디자인 시스템](./design-system/README.md): 토큰, 컬러, 사용법, 과거 Phase 3 구현 예시
- [Infrastructure](./infrastructure/README.md): 배포·운영 및 과거 인프라 자료
- [API 명세](./api-spec.yml): 코드 정합성 별도 확인
- [과거 Agentic 문서화 결정](./decisions/agentic-docs-system-architecture.md)

## 관련 진입점

- [docs/README.md](../README.md)
- [Frontend development guide](../../frontend/developmentGuide.md)
- [Backend development guide](../../backend/developmentGuide.md)
