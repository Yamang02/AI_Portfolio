# P05: 스킬 기반 검토 및 반영

## 전제 조건

**P01~P04 구현이 끝난 뒤** 착수한다. 코드 변경은 “검토에서 발견된 항목”에 한정한다.

## 목표

프로젝트 로컬 `.cursor/skills/`에 복제한 basis 검토 스킬을 **E02 변경 범위**에 적용하고, 결과를 문서로 남긴다.  
**치명도가 낮은 개선**은 이 Phase에서 코드·에픽 문서에 반영하고, **범위 밖·대형 리팩터**는 백로그나 후속 에픽으로 넘긴다.

## 적용 스킬 (역할)

| 스킬 `name` | 역할 |
|-------------|------|
| `epic-architecture-review` | 에픽 단위: 레이어·의존 방향·Bounded Context·문서화된 선택 근거 |
| `pt-01-domain-modeling` | 도메인 모델·Aggregate/VO 경계 (캐시/직렬화와의 관계만 해당 시) |
| `pt-02-implementation-patterns` | Redis 어댑터 등 **Adapter** 형태 준수 여부 |
| `cc-02-method-level` | Application/Domain **메서드·호출 구조** (캐시 어노테이션 포함 서비스 샘플) |
| `cc-05-code-hygiene` | 주석 위치·미사용 코드·import |
| `file-basis-review` | **파일 단위** CN-01·CC-01~02·04·05 종합 패스 (대표 파일) |

스킬 정의 본문: 각 폴더의 `SKILL.md`.

## 구현 상세

### 1. 검토 범위 (파일·디렉터리 우선순위)

**필수 샘플 (file-basis-review 최소 3파일):**

- `infrastructure/config/RedisObjectMapperConfig.java`
- `infrastructure/config/CacheKeys.java`
- `infrastructure/cache/RedisCloudUsageCacheAdapter.java` 또는 `RedisRateLimitStorageAdapter.java`

**선택 샘플:**

- `infrastructure/persistence/redis/adapter/RedisCacheManagementAdapter.java`
- `application/admin/service/ManageExperienceService.java` (또는 동일 패턴 Manage* 1개)
- `application/portfolio/PortfolioService.java` (`@Cacheable`/`@CacheEvict`)

### 2. 스킬별 산출물 (이 문서에 섹션으로 기록)

| 스킬 | 기록할 내용 |
|------|-------------|
| epic-architecture-review | 통과/플래그, 에픽 README와 코드 불일치 시 **한 줄** 정리 |
| pt-01 | 도메인 모델 변경(`CloudUsage` 등)에 대한 판단 요약 |
| pt-02 | 포트–어댑터 분리·외부 타입 누수 여부 |
| cc-02 | 캐시 무효화가 Application 레이어 관심사로만 있는지 |
| cc-05 | 위반 0건 또는 수정 내역 |
| file-basis-review | 샘플 파일별 Pass / 수정 완료 |

### 3. 반영 규칙

- **문서만:** 에픽 `Readme.md`의 `배경/맥락`이 현재 구조와 어긋나면 짧게 수정한다.
- **코드:** CC-05-03/04, 명백한 네이밍·import 정도만 — 동작 변경이 큰 리팩터는 하지 않는다.
- 검증: 수정이 있으면 Docker `backend`에서 `mvn test` 실행 (`AGENTS.md`).

## 완료 기준 (체크리스트)

- [ ] `epic-architecture-review` 체크 완료, 결과 이 문서에 기록
- [ ] `pt-01-domain-modeling` 검토 완료, 결과 이 문서에 기록
- [ ] `pt-02-implementation-patterns` 검토 완료, 결과 이 문서에 기록
- [ ] `cc-02-method-level` 검토 완료 (대표 Application 서비스 1개 이상), 결과 기록
- [ ] `cc-05-code-hygiene` 검토 완료, 발견 시 수정 또는 “의도적 유지” 사유
- [ ] `file-basis-review` 대표 파일 3개 이상 패스 또는 수정 완료
- [ ] 에픽 README와 코드 불일치 시 README 보강 또는 “현재 기준” 한 줄 명시
- [ ] 코드 변경이 있었다면 Docker `backend`에서 `mvn test` 성공

## 검토 결과 (작성용)

### epic-architecture-review

- (작성)

### pt-01-domain-modeling

- (작성)

### pt-02-implementation-patterns

- (작성)

### cc-02-method-level

- (작성)

### cc-05-code-hygiene

- (작성)

### file-basis-review (파일별)

| 파일 | 결과 |
|------|------|
| | |
