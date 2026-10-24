# Backend conventions

> Status: maintained
> Scope: `backend/`

이 문서는 Java/Spring Boot 백엔드 코딩 관례를 소유한다. 공통 원칙은 [../conventions.md](../conventions.md)를 따른다.

## 계층과 책임

- 기존 Hexagonal Architecture의 Domain / Application / Infrastructure 경계를 유지한다.
- Domain은 비즈니스 의미와 불변식을 소유하고, JPA Entity·웹 DTO·HTTP 요청 같은 기술적 표현을 직접 의존하지 않는다.
- Application은 유스케이스를 조율하고 도메인 포트와 계약을 통해 외부 기능을 소비한다.
- Infrastructure는 웹, 영속성, 외부 서비스의 기술적 어댑터를 소유한다.
- 구형 코드에 경계 위반이 있으면 범위와 소비자를 조사한 뒤 별도 리팩터링으로 처리한다. 새 코드에서 이를 복제하지 않는다.
- 포트와 공통 CRUD 추상화는 구체적인 변경·교체 필요성이 입증될 때만 만든다. 모든 도메인에 똑같은 BaseCrudService나 템플릿을 강제하지 않는다.

## 모델과 식별자

- 비즈니스 불변식은 해당 도메인 소유자가 검증한다. 표현용 기본값·API 변환은 경계에서 구분한다.
- DB 내부 PK와 외부 businessId의 의미는 분리한다. 실제 API/DB/DTO 계약은 [식별자 가이드](../../technical/guides/identifier-usage-guide.md) 및 소스에서 검증한다.
- API DTO는 외부 계약으로 취급하고 JPA Entity를 그대로 노출하지 않는다.
- 매핑은 기술 표현과 도메인 의미 사이의 경계에서 담당한다. 무조건 정적 Mapper를 강제하지 않는다.

## Application, persistence, cache

- 변경 유스케이스의 트랜잭션 범위·실패·동시성을 명시한다. 실제 Spring 프록시/호출 경계를 확인한다.
- 스키마 변경은 Flyway 마이그레이션 및 기존 데이터 호환성·복구를 고려한다. `database-schema-design` 스킬은 절차, Dev 문서는 현재 기술 계약을 소유한다.
- Redis 등 캐시의 소유자와 명시적 무효화 정책은 현행 구현/관련 결정에 맞춘다. 과거 문서의 `@Cacheable`/`@CacheEvict` 예제를 현행 규칙으로 채택하지 않는다.
- 관계형 테이블 수정은 제약 조건과 쓰기 의미를 보존하며 변경 범위를 명확히 한다. 항상 단일 Merge 패턴만 강요하지 않는다.

## API, 오류, 보안

- Controller는 전송 계층, Application은 작업 조율, Domain은 비즈니스 오류 의미를 각각 책임진다.
- 공개 API 응답 및 오류 형태를 바꾸기 전에 클라이언트와 기존 소비자를 조사한다.
- 외부 입력·인증·권한·세션·비밀값은 신뢰 경계에서 검증한다. 민감한 내부 정보를 응답이나 로그에 노출하지 않는다.
- 새 의존성이나 외부 서비스 호출은 기존 어댑터와 운영 설정을 확인한다.

## 검증

- 단위: 도메인/유스케이스 계약, 어댑터 경계에 필요한 격리 테스트.
- 통합: 실제 DB/트랜잭션/HTTP 계약이나 마이그레이션에 적절한 테스트.
- 저장소에는 `npm run test:backend`, `npm run build:backend` 스크립트가 있지만 Maven을 Docker에서 실행한다는 기존 정책과 명령이 충돌한다. 실제 실행 환경을 확인하고 해결하기 전까지 로컬 직접 Maven 실행을 승인하지 않는다.
- SonarQube 정책은 [기존 품질 문서](../../basis/quality/SQ-01-local-sonarqube-workflow.md)에서 유지한다.

## Legacy reference

- [백엔드 코딩 원칙](../../technical/guides/backend/coding-principles.md): 포트/어댑터, 도메인, Mapper, 예외, 의존성 주입 등 상세 예시를 보존한 과거 자료. 충돌 시 현재 코드/계약과 이 문서의 원칙을 먼저 적용한다.
