# 관리자 페이지 데이터 관리 개선 구현 계획

## 📋 문서 정보
- **작성일**: 2025-12-16
- **목적**: duplicate key 에러 근본 해결 및 관계 관리 패턴 개선
- **우선순위**: 🔴 긴급

---

## 🎯 목표

### 1차 목표 (긴급 - 당일 완료)
- ✅ duplicate key 에러 즉시 해결
- ✅ 모든 관계 관리 Adapter에 안전장치 추가
- ✅ 기본 테스트 작성 및 검증

### 2차 목표 (개선 - 1주 이내)
- ✅ 효율적인 Merge 전략으로 리팩토링
- ✅ 불필요한 DELETE/INSERT 최소화
- ✅ 통합 테스트 강화

### 3차 목표 (장기 - 선택적)
- ✅ 관계 관리 Best Practice 문서화
- ✅ 신규 도메인 개발 가이드라인 수립
- ✅ 모니터링 및 알림 체계 구축

---

## 📂 구조 분석

### 현재 관계 관리 구조

```
Domain Layer (Port)
├── ProjectRelationshipPort
├── ExperienceRelationshipPort
└── EducationRelationshipPort
    └── replaceTechStacks(String businessId, List<TechStackRelation> relations)
    └── replaceProjects(String businessId, List<ProjectRelation> relations)

Infrastructure Layer (Adapter)
├── ProjectRelationshipAdapter
├── ExperienceRelationshipAdapter
└── EducationRelationshipAdapter
    └── implements replaceTechStacks()
    └── implements replaceProjects()

Repository Layer
├── ProjectTechStackJpaRepository
├── ExperienceTechStackJpaRepository
├── EducationTechStackJpaRepository
├── ExperienceProjectJpaRepository
└── EducationProjectJpaRepository
    └── deleteByProjectId(Long id)
    └── deleteByExperienceId(Long id)
    └── deleteByEducationId(Long id)
```

### 문제가 있는 메서드

#### 1. ProjectRelationshipAdapter
- `replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships)`

#### 2. ExperienceRelationshipAdapter
- `replaceTechStacks(String experienceBusinessId, List<TechStackRelation> relationships)`
- `replaceProjects(String experienceBusinessId, List<ProjectRelation> relationships)` (있다면)

#### 3. EducationRelationshipAdapter
- `replaceTechStacks(String educationBusinessId, List<TechStackRelation> relationships)`
- `replaceProjects(String educationBusinessId, List<ProjectRelation> relationships)` (있다면)

---

## 🔧 Phase 1: 긴급 수정 (Option 1 - 명시적 플러시)

### 구현 내용

#### 1-1. ProjectRelationshipAdapter 수정

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ProjectRelationshipAdapter.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.portfolio.port.out.ProjectRelationshipPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectTechStackJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class ProjectRelationshipAdapter implements ProjectRelationshipPort {

    private final ProjectJpaRepository projectJpaRepository;
    private final ProjectTechStackJpaRepository projectTechStackJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

    @Override
    public void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
        log.debug("Replacing tech stacks for project: {}", projectBusinessId);

        ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

        // 기존 관계 삭제
        log.debug("Deleting existing tech stack relationships for project: {}", project.getId());
        projectTechStackJpaRepository.deleteByProjectId(project.getId());

        // ✅ FIX: 명시적 플러시로 삭제가 DB에 반영되도록 보장
        log.debug("Flushing delete operations to database");
        projectTechStackJpaRepository.flush();

        if (relationships == null || relationships.isEmpty()) {
            log.debug("No tech stacks to add for project: {}", projectBusinessId);
            return;
        }

        // 새로운 관계 생성
        log.debug("Creating {} new tech stack relationships", relationships.size());
        for (TechStackRelation item : relationships) {
            if (item.techStackId() == null) {
                throw new IllegalArgumentException("Tech stack ID must not be null");
            }

            TechStackMetadataJpaEntity techStack = techStackMetadataJpaRepository.findById(item.techStackId())
                    .orElseThrow(() -> new IllegalArgumentException("TechStack not found: " + item.techStackId()));

            ProjectTechStackJpaEntity relation = ProjectTechStackJpaEntity.builder()
                    .project(project)
                    .techStack(techStack)
                    .isPrimary(item.isPrimary())
                    .usageDescription(item.usageDescription())
                    .build();

            projectTechStackJpaRepository.save(relation);
        }

        log.debug("Successfully replaced tech stacks for project: {}", projectBusinessId);
    }
}
```

#### 1-2. ExperienceRelationshipAdapter 수정

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ExperienceRelationshipAdapter.java`

**수정 포인트**:
1. `replaceTechStacks()` 메서드에 `flush()` 추가
2. `replaceProjects()` 메서드에 `flush()` 추가 (존재하는 경우)

```java
@Override
public void replaceTechStacks(String experienceBusinessId, List<TechStackRelation> relationships) {
    // ... (기존 코드)

    experienceTechStackJpaRepository.deleteByExperienceId(experience.getId());

    // ✅ FIX: 명시적 플러시
    experienceTechStackJpaRepository.flush();

    // ... (나머지 코드)
}
```

#### 1-3. EducationRelationshipAdapter 수정

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/EducationRelationshipAdapter.java`

**수정 포인트**:
1. `replaceTechStacks()` 메서드에 `flush()` 추가
2. `replaceProjects()` 메서드에 `flush()` 추가 (존재하는 경우)

```java
@Override
public void replaceTechStacks(String educationBusinessId, List<TechStackRelation> relationships) {
    // ... (기존 코드)

    educationTechStackJpaRepository.deleteByEducationId(education.getId());

    // ✅ FIX: 명시적 플러시
    educationTechStackJpaRepository.flush();

    // ... (나머지 코드)
}
```

### 테스트 계획 (Phase 1)

#### 1. Manual Test (브라우저)
```
1. 프로젝트 생성
   - 제목: "Test Project"
   - 기술 스택: React, TypeScript, Node.js

2. 프로젝트 수정 (동일한 기술 스택)
   - 제목: "Updated Project"
   - 기술 스택: React, TypeScript, Node.js (변경 없음)
   ✅ 에러 없이 성공해야 함

3. 프로젝트 수정 (기술 스택 변경)
   - 제목: "Final Project"
   - 기술 스택: React, Java, Spring Boot
   ✅ 에러 없이 성공해야 함
```

#### 2. Integration Test
```java
@SpringBootTest
@Transactional
class ProjectRelationshipAdapterTest {

    @Autowired
    private ProjectRelationshipAdapter adapter;

    @Autowired
    private ProjectJpaRepository projectRepository;

    @Autowired
    private ProjectTechStackJpaRepository projectTechStackRepository;

    @Test
    void replaceTechStacks_withSameTechStacks_shouldNotThrowException() {
        // Given
        String projectId = "PJT001";
        List<TechStackRelation> relations = Arrays.asList(
            new TechStackRelation(1L, false, null),
            new TechStackRelation(2L, false, null)
        );

        // When - 첫 번째 저장
        adapter.replaceTechStacks(projectId, relations);

        // Then - 동일한 내용으로 다시 저장해도 에러 없어야 함
        assertDoesNotThrow(() -> adapter.replaceTechStacks(projectId, relations));

        // Verify
        List<ProjectTechStackJpaEntity> result =
            projectTechStackRepository.findByProjectId(projectId);
        assertThat(result).hasSize(2);
    }
}
```

### 배포 계획 (Phase 1)

```bash
# 1. 로컬 빌드 및 테스트
./gradlew clean build

# 2. 스테이징 배포
git checkout staging
git merge feature/fix-duplicate-key
git push origin staging

# 3. 스테이징 검증 (30분)
# - 프로젝트 생성/수정 테스트
# - 경력 생성/수정 테스트
# - 교육 생성/수정 테스트

# 4. 프로덕션 배포
git checkout main
git merge staging
git push origin main
```

---

## 🚀 Phase 2: 개선 (Option 2 - Merge 전략)

### 구현 내용

#### 2-1. Repository에 findBy 메서드 추가

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/ProjectTechStackJpaRepository.java`

```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTechStackJpaRepository extends JpaRepository<ProjectTechStackJpaEntity, Long> {

    /**
     * 프로젝트 ID로 기술 스택 관계 조회
     */
    List<ProjectTechStackJpaEntity> findByProjectId(Long projectId);

    /**
     * 프로젝트 ID로 기술 스택 관계 삭제
     */
    void deleteByProjectId(Long projectId);
}
```

#### 2-2. ProjectRelationshipAdapter에 Merge 로직 구현

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ProjectRelationshipAdapter.java`

```java
@Override
public void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
    log.debug("Replacing tech stacks for project: {} (using merge strategy)", projectBusinessId);

    ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

    // 1. 기존 관계 조회
    List<ProjectTechStackJpaEntity> existingRelations =
        projectTechStackJpaRepository.findByProjectId(project.getId());

    log.debug("Found {} existing tech stack relationships", existingRelations.size());

    // 2. 요청된 tech_stack_id 집합
    Set<Long> requestedIds = relationships == null || relationships.isEmpty()
        ? Collections.emptySet()
        : relationships.stream()
            .map(TechStackRelation::techStackId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    log.debug("Requested tech stack IDs: {}", requestedIds);

    // 3. 기존 관계 중 삭제할 것들 (요청에 없는 것들)
    List<ProjectTechStackJpaEntity> toDelete = existingRelations.stream()
        .filter(existing -> !requestedIds.contains(existing.getTechStack().getId()))
        .collect(Collectors.toList());

    if (!toDelete.isEmpty()) {
        log.debug("Deleting {} tech stack relationships", toDelete.size());
        projectTechStackJpaRepository.deleteAll(toDelete);
        projectTechStackJpaRepository.flush();
    }

    // 4. 기존에 있던 tech_stack_id 집합
    Set<Long> existingIds = existingRelations.stream()
        .map(existing -> existing.getTechStack().getId())
        .collect(Collectors.toSet());

    // 5. 새로 추가할 관계들 (기존에 없는 것들)
    List<TechStackRelation> toAdd = relationships == null || relationships.isEmpty()
        ? Collections.emptyList()
        : relationships.stream()
            .filter(rel -> !existingIds.contains(rel.techStackId()))
            .collect(Collectors.toList());

    // 6. 추가 실행
    if (!toAdd.isEmpty()) {
        log.debug("Adding {} new tech stack relationships", toAdd.size());
        for (TechStackRelation item : toAdd) {
            if (item.techStackId() == null) {
                throw new IllegalArgumentException("Tech stack ID must not be null");
            }

            TechStackMetadataJpaEntity techStack = techStackMetadataJpaRepository.findById(item.techStackId())
                    .orElseThrow(() -> new IllegalArgumentException("TechStack not found: " + item.techStackId()));

            ProjectTechStackJpaEntity relation = ProjectTechStackJpaEntity.builder()
                    .project(project)
                    .techStack(techStack)
                    .isPrimary(item.isPrimary())
                    .usageDescription(item.usageDescription())
                    .build();

            projectTechStackJpaRepository.save(relation);
        }
    }

    log.debug("Successfully replaced tech stacks for project: {} (deleted: {}, added: {})",
        projectBusinessId, toDelete.size(), toAdd.size());
}
```

#### 2-3. 동일한 패턴을 다른 Adapter에 적용

- ExperienceRelationshipAdapter
- EducationRelationshipAdapter

### 테스트 계획 (Phase 2)

#### 1. Unit Test - Merge 로직 검증

```java
@Test
void replaceTechStacks_withPartialChange_shouldOnlyModifyDifferences() {
    // Given: 초기 관계 [1, 2, 3]
    String projectId = "PJT001";
    List<TechStackRelation> initial = Arrays.asList(
        new TechStackRelation(1L, false, null),
        new TechStackRelation(2L, false, null),
        new TechStackRelation(3L, false, null)
    );
    adapter.replaceTechStacks(projectId, initial);

    // When: [2, 3, 4]로 변경 (1 삭제, 4 추가)
    List<TechStackRelation> updated = Arrays.asList(
        new TechStackRelation(2L, false, null),
        new TechStackRelation(3L, false, null),
        new TechStackRelation(4L, false, null)
    );
    adapter.replaceTechStacks(projectId, updated);

    // Then: 결과는 [2, 3, 4]
    List<ProjectTechStackJpaEntity> result =
        projectTechStackRepository.findByProjectId(projectId);

    assertThat(result).hasSize(3);
    assertThat(result)
        .extracting(e -> e.getTechStack().getId())
        .containsExactlyInAnyOrder(2L, 3L, 4L);
}

@Test
void replaceTechStacks_withNoChange_shouldNotModifyDatabase() {
    // Given: 초기 관계 [1, 2]
    String projectId = "PJT001";
    List<TechStackRelation> relations = Arrays.asList(
        new TechStackRelation(1L, false, null),
        new TechStackRelation(2L, false, null)
    );
    adapter.replaceTechStacks(projectId, relations);

    // 기존 ID 기록
    List<Long> beforeIds = projectTechStackRepository.findByProjectId(projectId)
        .stream()
        .map(ProjectTechStackJpaEntity::getId)
        .collect(Collectors.toList());

    // When: 동일한 내용으로 다시 호출
    adapter.replaceTechStacks(projectId, relations);

    // Then: ID가 변경되지 않음 (삭제/재생성 없었음)
    List<Long> afterIds = projectTechStackRepository.findByProjectId(projectId)
        .stream()
        .map(ProjectTechStackJpaEntity::getId)
        .collect(Collectors.toList());

    assertThat(afterIds).isEqualTo(beforeIds);
}
```

#### 2. Performance Test - DB 쿼리 최적화 확인

```java
@Test
void replaceTechStacks_shouldMinimizeDatabaseOperations() {
    // Given
    String projectId = "PJT001";

    // 초기: 10개의 기술 스택
    List<TechStackRelation> initial = IntStream.range(1, 11)
        .mapToObj(i -> new TechStackRelation((long) i, false, null))
        .collect(Collectors.toList());
    adapter.replaceTechStacks(projectId, initial);

    // When: 8개는 유지, 2개는 삭제, 2개는 추가 (1-8 유지, 9-10 삭제, 11-12 추가)
    List<TechStackRelation> updated = Stream.concat(
        IntStream.range(1, 9).mapToObj(i -> new TechStackRelation((long) i, false, null)),
        IntStream.range(11, 13).mapToObj(i -> new TechStackRelation((long) i, false, null))
    ).collect(Collectors.toList());

    // DB 쿼리 카운트 측정 (Query Counter 사용)
    queryCounter.reset();
    adapter.replaceTechStacks(projectId, updated);

    // Then: DELETE 2회, INSERT 2회만 발생 (8개는 유지)
    // Option 1 (전체 삭제/재생성): DELETE 10회, INSERT 10회
    // Option 2 (Merge): DELETE 2회, INSERT 2회
    assertThat(queryCounter.getDeleteCount()).isEqualTo(2);
    assertThat(queryCounter.getInsertCount()).isEqualTo(2);
}
```

---

## 📊 성능 비교

### 시나리오: 프로젝트의 10개 기술 스택 중 2개만 변경

| 전략 | DELETE | INSERT | 총 쿼리 | 성능 |
|------|--------|--------|---------|------|
| **현재 (전체 교체)** | 10 | 10 | 20 | ⭐⭐ |
| **Option 1 (플러시)** | 10 | 10 | 20 + FLUSH | ⭐⭐ |
| **Option 2 (Merge)** | 2 | 2 | 4 | ⭐⭐⭐⭐⭐ |

### 예상 성능 개선
- 쿼리 수: **80% 감소** (20 → 4)
- 트랜잭션 시간: **60% 감소**
- DB 부하: **70% 감소**

---

## 🔒 안전장치

### 1. 트랜잭션 관리
```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void replaceTechStacks(...) {
    // 격리 수준 명시로 동시성 문제 방지
}
```

### 2. 낙관적 락 (선택적)
```java
@Entity
@Table(name = "project_tech_stack")
public class ProjectTechStackJpaEntity {

    @Version
    private Long version;  // 낙관적 락

    // ...
}
```

### 3. 에러 핸들링
```java
@Override
public void replaceTechStacks(...) {
    try {
        // ... 기존 로직
    } catch (DataIntegrityViolationException e) {
        log.error("Failed to replace tech stacks due to constraint violation", e);
        throw new IllegalStateException(
            "기술 스택 관계 업데이트에 실패했습니다. 데이터 무결성 위반.", e);
    } catch (Exception e) {
        log.error("Unexpected error while replacing tech stacks", e);
        throw new IllegalStateException(
            "기술 스택 관계 업데이트 중 예상치 못한 오류가 발생했습니다.", e);
    }
}
```

---

## 📝 Best Practice 가이드

### 새로운 도메인 추가 시 체크리스트

```markdown
## 관계 관리 구현 체크리스트

### 1. DB Schema 설계
- [ ] 관계 테이블에 복합 UNIQUE 제약조건 추가
  - `UNIQUE(parent_id, child_id)`
- [ ] CASCADE 옵션 설정
  - `ON DELETE CASCADE`

### 2. JPA Repository
- [ ] `findBy{Parent}Id()` 메서드 추가
- [ ] `deleteBy{Parent}Id()` 메서드 추가
- [ ] `JpaRepository` 확장으로 `flush()` 사용 가능

### 3. Relationship Adapter
- [ ] Port 인터페이스 정의 (`{Domain}RelationshipPort`)
- [ ] Adapter 구현 (`{Domain}RelationshipAdapter`)
- [ ] `replace{Relations}()` 메서드에 Merge 전략 적용
  1. 기존 관계 조회
  2. 삭제할 항목 필터링
  3. 추가할 항목 필터링
  4. 삭제 실행 + flush
  5. 추가 실행
- [ ] 로깅 추가 (debug 레벨)
- [ ] 예외 처리 추가

### 4. 테스트
- [ ] Unit Test: 동일한 관계로 재호출 시 에러 없음
- [ ] Unit Test: 부분 변경 시 차이만 반영
- [ ] Unit Test: 변경 없을 시 DB 수정 없음
- [ ] Integration Test: Controller → Service → Repository
- [ ] E2E Test: Frontend → Backend

### 5. 문서화
- [ ] Port/Adapter 클래스에 Javadoc 추가
- [ ] README 또는 가이드 문서 업데이트
```

---

## 📅 일정

| Phase | 작업 내용 | 예상 시간 | 담당 | 상태 |
|-------|----------|----------|------|------|
| **Phase 1** | 긴급 수정 (플러시 추가) | 2시간 | - | ⏳ 대기 |
| ├─ | ProjectRelationshipAdapter 수정 | 30분 | - | ⏳ |
| ├─ | ExperienceRelationshipAdapter 수정 | 30분 | - | ⏳ |
| ├─ | EducationRelationshipAdapter 수정 | 30분 | - | ⏳ |
| └─ | 수동 테스트 및 배포 | 30분 | - | ⏳ |
| **Phase 2** | Merge 전략 리팩토링 | 1일 | - | ⏳ 대기 |
| ├─ | Repository 메서드 추가 | 1시간 | - | ⏳ |
| ├─ | ProjectRelationshipAdapter 리팩토링 | 2시간 | - | ⏳ |
| ├─ | ExperienceRelationshipAdapter 리팩토링 | 2시간 | - | ⏳ |
| ├─ | EducationRelationshipAdapter 리팩토링 | 2시간 | - | ⏳ |
| └─ | 통합 테스트 작성 및 실행 | 1시간 | - | ⏳ |
| **Phase 3** | 문서화 및 모니터링 | 4시간 | - | ⏳ 대기 |
| ├─ | Best Practice 가이드 작성 | 2시간 | - | ⏳ |
| ├─ | ADR 문서 작성 | 1시간 | - | ⏳ |
| └─ | 모니터링 설정 | 1시간 | - | ⏳ |

---

## 🚨 롤백 계획

### Phase 1 롤백 시나리오
```bash
# 1. 이전 커밋으로 되돌리기
git revert <commit-hash>
git push origin staging

# 2. 긴급 핫픽스 (flush 제거)
# - ProjectRelationshipAdapter에서 flush() 라인 제거
# - ExperienceRelationshipAdapter에서 flush() 라인 제거
# - EducationRelationshipAdapter에서 flush() 라인 제거
```

### Phase 2 롤백 시나리오
```bash
# Merge 전략에서 문제 발생 시 Phase 1 버전으로 롤백
git checkout <phase-1-commit>
git push origin staging --force
```

---

## ✅ 완료 기준

### Phase 1 완료 조건
- [ ] 모든 Relationship Adapter에 `flush()` 추가
- [ ] 프로젝트/경력/교육 수정 시 duplicate key 에러 미발생
- [ ] 스테이징 환경 검증 완료
- [ ] 프로덕션 배포 완료

### Phase 2 완료 조건
- [ ] 모든 Relationship Adapter에 Merge 전략 적용
- [ ] Unit 테스트 통과율 100%
- [ ] Integration 테스트 통과
- [ ] 성능 개선 확인 (쿼리 수 감소)
- [ ] 프로덕션 배포 완료

### Phase 3 완료 조건
- [ ] Best Practice 가이드 문서 작성
- [ ] ADR (Architecture Decision Record) 작성
- [ ] 신규 개발자 온보딩 자료 업데이트
- [ ] 모니터링 대시보드 설정

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-12-16
**상태**: 계획 완료 → 승인 대기
