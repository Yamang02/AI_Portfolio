# P02: 백엔드 아키텍처 정리

## 목표

헥사고날 아키텍처 원칙 위반을 수정하고, 스팸/검증 로직의 중복을 제거한다.
이 Phase 완료 후 레이어 경계가 명확해지고 멀티 인스턴스 환경에서 Rate Limit이 안정적으로 동작한다.

## 구현 상세

### 1. DataController의 JPA 직접 의존성 제거

**문제:** `DataController`(인프라 레이어)가 `ProjectJpaRepository`(인프라 레이어)를 직접 주입받음.
컨트롤러는 UseCase 포트를 통해서만 도메인에 접근해야 함.

**접근:**
- `DataController`에서 `ProjectJpaRepository` 의존성 제거
- 해당 데이터 조회를 `GetProjectsUseCase` 또는 기존 `PortfolioApplicationService`의 메서드로 위임
- UseCase 포트에 필요한 메서드가 없으면 추가

**변경 파일:**
- `backend/.../infrastructure/web/controller/DataController.java`
- `backend/.../application/portfolio/PortfolioApplicationService.java` (필요 시 메서드 추가)
- `backend/.../domain/portfolio/port/in/GetProjectsUseCase.java` (필요 시 메서드 추가)

### 2. SpamProtectionService를 Redis 기반으로 전환

**문제:** `SpamProtectionService`가 `ConcurrentHashMap`으로 클라이언트 제한 상태를 인메모리에 저장.
Cloud Run 재시작이나 스케일아웃 시 제한 기록이 초기화됨. Redis가 이미 인프라에 존재.

**접근:**
- Application 레이어에서 `RedisTemplate`을 직접 사용하면 레이어 경계 위반이므로,
  Outbound Port를 정의하고 Infrastructure에서 Redis Adapter를 구현한다
- `SpamProtectionService`는 Port만 의존하도록 변경
- Redis TTL을 기존 윈도우 만료 시간과 동일하게 설정

**Port 설계:**
```java
// Domain 또는 Application 레이어
public interface RateLimitStoragePort {
    void recordRequest(String clientId);
    int getRequestCount(String clientId, Duration window);
    boolean isBlocked(String clientId);
}
```

**변경 파일:**
- `backend/.../domain/chatbot/port/out/RateLimitStoragePort.java` (신규)
- `backend/.../infrastructure/persistence/redis/adapter/RedisRateLimitStorageAdapter.java` (신규)
- `backend/.../application/chatbot/validation/SpamProtectionService.java` (Port 의존으로 변경)
- `backend/.../infrastructure/config/RedisConfig.java` (RedisTemplate Bean 확인/추가)

### 3. 프론트-백 검증 로직 단일화

**문제:** `questionValidator.ts`(프론트)와 `InputValidationService.java`(백엔드)가 스팸 패턴을 각각 중복 구현.
패턴 수 불일치 (프론트 8개, 백엔드 16개+), 유지보수 시 동기화 실패 위험.

**접근:**
- 프론트엔드 `questionValidator.ts`에서 스팸 패턴 검증 로직 제거
- 프론트는 UX 즉각 피드백용 최소 검증만 유지: 빈 값, 길이 초과(500자)
- 스팸/패턴 검증은 백엔드에 완전 위임

**변경 파일:**
- `frontend/.../chatbot/utils/questionValidator.ts`

## 체크리스트

- [x] `DataController`에서 `ProjectJpaRepository` 직접 주입 제거 확인
- [x] `DataController`가 UseCase/Service 포트를 통해서만 데이터 접근하는지 확인
- [x] `RateLimitStoragePort` 인터페이스가 `domain/` 또는 `application/` 레이어에 정의되었는지 확인
- [x] `RedisRateLimitStorageAdapter`가 `infrastructure/` 레이어에서 Port를 구현하는지 확인
- [x] `SpamProtectionService`가 `RateLimitStoragePort`만 의존하고 `RedisTemplate`을 직접 참조하지 않는지 확인
- [ ] 로컬 Redis 재시작 후에도 요청 제한 기록이 유지되는지 확인 (수동 QA)
- [x] `questionValidator.ts`에서 스팸 패턴 중복 로직 제거 확인
- [x] 프론트에서 빈 값, 500자 초과 검증은 여전히 동작하는지 확인
- [x] `npm run build` 성공 확인
- [ ] 백엔드 `mvn clean compile -DskipTests` 성공 확인 (로컬 Maven 또는 Docker backend 이미지)
