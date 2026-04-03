# 핫픽스: Redis 캐시 경계 재설계 (Spring Cache 제거 + 인프라 DTO)

- **일자:** 2026-04-03  
- **영역:** 백엔드 Redis 캐시 경계 (`PortfolioService`, `GitHubIntegrationService`, Redis Adapter)

## 증상

포트폴리오/깃허브 페이지에서 캐시 히트 시 500이 반복 발생.

- `/api/data/projects` 초기 오류: `Unexpected token` 계열
- 후속 오류: `Problem deserializing 'setterless' property ("technologies")`
- GitHub 오류: `Project["durationInMonths"]` 직렬화 중 NPE

## 배경 (근거)

- Spring Data Redis의 generic/default-typing 조합은 컬렉션 루트/타입 메타데이터에서 역직렬화 이슈가 반복 보고된다 ([spring-data-redis#2361](https://github.com/spring-projects/spring-data-redis/issues/2361), [spring-data-redis#2697](https://github.com/spring-projects/spring-data-redis/issues/2697)).
- Spring 공식 문서는 캐시별 설정 가능성을 제공하지만, 도메인 엔티티를 그대로 generic serializer로 캐시하는 전략까지 보장하지 않는다 ([Redis Cache docs](https://docs.spring.io/spring-data-redis/reference/redis/redis-cache.html)).

## 원인 (요약)

1. `@Cacheable` 기반 AOP 캐시는 도메인 엔티티의 계산 getter까지 직렬화 경계로 노출시켰다.
   - `Experience`/`Education`: `getTechnologies()`가 setterless property로 인식되어 역직렬화 실패
   - `Project`: `getDurationInMonths()`가 null 안전하지 않아 직렬화 단계 NPE
2. 캐시 경계 모델이 Domain 타입과 분리되지 않아, 프레임워크 직렬화 동작에 도메인 메서드가 직접 영향을 받았다.
3. 일부 경로는 캐시를 통하고 일부 경로는 레포지토리를 직접 호출해(과거 `PortfolioApplicationService`) 관찰 가능한 동작 일관성이 약했다.

## 조치 (코드)

1. **Spring Cache 어노테이션 제거**
   - `@Cacheable`, `@CacheEvict`, `@EnableCaching` 사용 중단
   - 캐시 히트/미스 제어를 서비스 코드에서 명시적으로 수행
2. **Port/Adapter 구조로 전환**
   - Domain Out Port: `PortfolioCachePort`
   - Infra Adapter: `RedisPortfolioCacheAdapter`
3. **인프라 캐시 DTO(스냅샷) 도입**
   - 위치: `infrastructure.persistence.redis.model.portfolio.*`
   - `ProjectSnapshot`, `ExperienceSnapshot`, `EducationSnapshot`, `CertificationSnapshot`, `TechStackMetadataSnapshot`
   - 컬렉션은 `PortfolioListSnapshot<T>` 하위(`ProjectListSnapshot` 등)로 고정
4. **캐시 직렬화 계약 고정**
   - 캐시 DTO를 `ObjectMapper`로 구체 타입 직렬화/역직렬화
   - 역직렬화 실패 시 해당 키 삭제 후 캐시 미스로 폴백
5. **캐시 무효화 명시화**
   - 관리자 쓰기 서비스(프로젝트/경력/교육/자격증/아티클/기술스택)에서 `PortfolioCachePort`를 직접 호출해 무효화
6. **경로 일관성 유지**
   - `PortfolioApplicationService`는 `PortfolioService`를 통해 동일 캐시 경계 사용

회귀: `RedisSerializationTest`에서 `ProjectListSnapshot` 직렬화/역직렬화 확인.

## 운영

- 배포 직후 **한 번** Redis 플러시 권장(이전 포맷 키 제거).
- 이후 캐시 스키마 변경 시, 키 버전 또는 명시적 플러시 절차를 릴리즈 노트에 포함.

## 에픽 문서와의 관계

과거 [E03](../epic/archive/E03.2026-04-03_redis-cache-serialization-refactor/)·[E05](../epic/archive/E05.2026-04-03_cache-boundary-and-ui-primitives-refactor/) 대비, 본 핫픽스는 **프로젝트 수준 결정**으로 “도메인 직접 캐시 금지, 인프라 DTO 캐시”를 확정한다.
