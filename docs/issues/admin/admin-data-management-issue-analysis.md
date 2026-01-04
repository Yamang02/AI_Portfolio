# 관리자 페이지 데이터 관리 이슈 분석 및 해결 방안

## 📋 문서 정보
- **작성일**: 2025-12-16
- **문제**: 프로젝트 수정 시 duplicate key 에러 발생
- **영향 범위**: Admin 페이지의 모든 관계형 데이터 관리

---

## 🔴 문제 상황

### 발생한 에러
```
duplicate key value violates unique constraint
at org.springframework.transaction.interceptor.TransactionInterceptor
```

### 문제 발생 시나리오
1. 관리자가 기존 프로젝트를 수정하려고 함
2. 기술 스택 목록을 변경하지 않고 다른 필드만 수정
3. **중복 키 제약 조건 위반 에러 발생**

---

## 🔍 근본 원인 분석

### 1. 데이터베이스 스키마 (V002 Migration)

```sql
CREATE TABLE project_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tech_stack_id)  -- 복합 유니크 제약조건
);
```

**문제점**:
- `project_id`와 `tech_stack_id`의 조합이 유니크해야 함
- 동일한 프로젝트에 동일한 기술 스택을 중복 추가할 수 없음

### 2. 관계 관리 로직 (ProjectRelationshipAdapter)

**파일**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ProjectRelationshipAdapter.java`

```java
@Override
public void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
    ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

    // ⚠️ 문제 1: 삭제가 트랜잭션 내에서 즉시 반영되지 않을 수 있음
    projectTechStackJpaRepository.deleteByProjectId(project.getId());

    // ⚠️ 문제 2: 삭제 직후 바로 삽입 시 유니크 제약 조건 위반 가능
    for (TechStackRelation item : relationships) {
        ProjectTechStackJpaEntity relation = ProjectTechStackJpaEntity.builder()
                .project(project)
                .techStack(techStack)
                .isPrimary(item.isPrimary())
                .usageDescription(item.usageDescription())
                .build();

        projectTechStackJpaRepository.save(relation);
    }
}
```

**근본 문제**:
1. **트랜잭션 타이밍 이슈**: `deleteByProjectId()` 호출 후 `save()` 호출 사이에 DB 플러시가 보장되지 않음
2. **Cascade 설정 부재**: JPA Entity의 관계가 명시적으로 관리되지 않음
3. **명시적 플러시 없음**: 삭제와 삽입 사이에 `flush()`가 호출되지 않음

---

## 🎯 영향 범위

### 영향받는 도메인

| 도메인 | 관계 관리 | 동일 패턴 | 위험도 |
|--------|----------|-----------|--------|
| **Project** | ProjectRelationshipAdapter | ✅ | 🔴 높음 |
| **Experience** | ExperienceRelationshipAdapter | ✅ | 🔴 높음 |
| **Education** | EducationRelationshipAdapter | ✅ | 🔴 높음 |
| **Certification** | (관계 없음) | ❌ | ⚪ 없음 |
| **TechStack** | (관계 없음) | ❌ | ⚪ 없음 |

### 영향받는 테이블
```
project_tech_stack         (project_id, tech_stack_id) UNIQUE
experience_tech_stack      (experience_id, tech_stack_id) UNIQUE
education_tech_stack       (education_id, tech_stack_id) UNIQUE
experience_project         (experience_id, project_id) UNIQUE (추정)
education_project          (education_id, project_id) UNIQUE (추정)
```

---

## 🔧 해결 방안

### Option 1: **명시적 플러시 추가 (Quick Fix)** ⭐ 권장

**장점**:
- 최소한의 코드 변경
- 즉시 적용 가능
- 기존 아키텍처 유지

**단점**:
- 근본적인 설계 개선은 아님
- 트랜잭션 성능에 약간의 영향

**구현 방법**:
```java
@Override
public void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
    ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

    // 기존 관계 삭제
    projectTechStackJpaRepository.deleteByProjectId(project.getId());

    // ✅ 명시적 플러시로 삭제 보장
    projectTechStackJpaRepository.flush();

    if (relationships == null || relationships.isEmpty()) {
        return;
    }

    // 새로운 관계 생성
    for (TechStackRelation item : relationships) {
        // ... (기존 코드)
    }
}
```

---

### Option 2: **Merge 전략 (Optimal Solution)** 🎯 최적

**장점**:
- 불필요한 DELETE/INSERT 최소화
- DB 트랜잭션 효율 향상
- 히스토리 추적 가능 (id 유지)

**단점**:
- 복잡한 로직
- 개발 시간 증가

**구현 방법**:
```java
@Override
public void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
    ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

    // 1. 기존 관계 조회
    List<ProjectTechStackJpaEntity> existing =
        projectTechStackJpaRepository.findByProjectId(project.getId());

    // 2. 요청된 tech_stack_id 집합
    Set<Long> requestedIds = relationships.stream()
        .map(TechStackRelation::techStackId)
        .collect(Collectors.toSet());

    // 3. 기존 관계 중 삭제할 것들
    List<ProjectTechStackJpaEntity> toDelete = existing.stream()
        .filter(e -> !requestedIds.contains(e.getTechStack().getId()))
        .collect(Collectors.toList());

    // 4. 기존에 있던 tech_stack_id 집합
    Set<Long> existingIds = existing.stream()
        .map(e -> e.getTechStack().getId())
        .collect(Collectors.toSet());

    // 5. 새로 추가할 관계들
    List<TechStackRelation> toAdd = relationships.stream()
        .filter(r -> !existingIds.contains(r.techStackId()))
        .collect(Collectors.toList());

    // 6. 삭제 실행
    projectTechStackJpaRepository.deleteAll(toDelete);

    // 7. 추가 실행
    for (TechStackRelation item : toAdd) {
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
```

---

### Option 3: **JPA Cascade 활용 (Architectural Refactoring)**

**장점**:
- JPA 표준 방식 활용
- 관계 관리 자동화
- 코드 간결화

**단점**:
- 대규모 리팩토링 필요
- Hexagonal Architecture 원칙 위반 가능성
- 테스트 복잡도 증가

**구현 방법**:
```java
// ProjectJpaEntity.java
@Entity
@Table(name = "projects")
public class ProjectJpaEntity {

    @OneToMany(
        mappedBy = "project",
        fetch = FetchType.LAZY,
        cascade = CascadeType.ALL,  // ✅ ALL 추가
        orphanRemoval = true  // ✅ 고아 객체 삭제
    )
    private List<ProjectTechStackJpaEntity> projectTechStacks;

    // ✅ Helper 메서드 추가
    public void setProjectTechStacks(List<ProjectTechStackJpaEntity> techStacks) {
        if (this.projectTechStacks == null) {
            this.projectTechStacks = new ArrayList<>();
        }

        // 기존 관계 제거 (orphanRemoval 트리거)
        this.projectTechStacks.clear();

        // 새로운 관계 추가
        if (techStacks != null) {
            this.projectTechStacks.addAll(techStacks);
            techStacks.forEach(t -> t.setProject(this));
        }
    }
}
```

---

## 📊 각 옵션 비교

| 기준 | Option 1 (플러시) | Option 2 (Merge) | Option 3 (Cascade) |
|------|------------------|------------------|-------------------|
| **구현 난이도** | ⭐ 쉬움 | ⭐⭐ 보통 | ⭐⭐⭐ 어려움 |
| **적용 시간** | 1-2시간 | 4-6시간 | 8-12시간 |
| **성능** | ⭐⭐ 보통 | ⭐⭐⭐ 좋음 | ⭐⭐ 보통 |
| **유지보수성** | ⭐⭐ 보통 | ⭐⭐⭐ 좋음 | ⭐⭐ 보통 |
| **Hexagonal 원칙** | ✅ 준수 | ✅ 준수 | ⚠️ 주의 필요 |
| **테스트 필요** | Unit + Integration | Unit + Integration | Full E2E |

---

## 🎯 권장 접근법

### 단계 1: 즉시 적용 (1-2시간)
**Option 1 (명시적 플러시)을 모든 Relationship Adapter에 적용**

적용 대상:
- ✅ `ProjectRelationshipAdapter.replaceTechStacks()`
- ✅ `ExperienceRelationshipAdapter.replaceTechStacks()`
- ✅ `EducationRelationshipAdapter.replaceTechStacks()`
- ✅ `ExperienceRelationshipAdapter.replaceProjects()` (있다면)
- ✅ `EducationRelationshipAdapter.replaceProjects()` (있다면)

### 단계 2: 점진적 개선 (차주)
**Option 2 (Merge 전략)으로 리팩토링**

- 한 번에 하나의 Adapter씩 리팩토링
- 충분한 테스트 코드 작성
- 프로덕션 배포 전 스테이징 환경 검증

### 단계 3: 장기 계획 (선택적)
**Option 3 (Cascade)는 신규 도메인에만 적용**

- 기존 코드는 Option 2 유지
- 새로운 도메인 추가 시에만 Cascade 패턴 적용
- Architecture Decision Record (ADR) 문서화

---

## 🧪 테스트 계획

### 1. Unit Test (각 Adapter별)
```java
@Test
void replaceTechStacks_shouldHandleDuplicateKeyCorrectly() {
    // Given: 기존 관계가 있는 프로젝트
    String projectId = "PJT001";
    List<TechStackRelation> existingRelations = Arrays.asList(
        new TechStackRelation(1L, false, null),
        new TechStackRelation(2L, false, null)
    );
    relationshipAdapter.replaceTechStacks(projectId, existingRelations);

    // When: 동일한 기술 스택으로 다시 교체
    List<TechStackRelation> sameRelations = Arrays.asList(
        new TechStackRelation(1L, false, null),
        new TechStackRelation(2L, false, null)
    );
    relationshipAdapter.replaceTechStacks(projectId, sameRelations);

    // Then: 에러 없이 성공
    List<ProjectTechStackJpaEntity> result =
        projectTechStackJpaRepository.findByProjectId(projectId);
    assertThat(result).hasSize(2);
}

@Test
void replaceTechStacks_shouldHandlePartialUpdate() {
    // Given: 기존 관계 [1, 2, 3]
    String projectId = "PJT001";
    List<TechStackRelation> existingRelations = Arrays.asList(
        new TechStackRelation(1L, false, null),
        new TechStackRelation(2L, false, null),
        new TechStackRelation(3L, false, null)
    );
    relationshipAdapter.replaceTechStacks(projectId, existingRelations);

    // When: [2, 3, 4]로 변경 (1 삭제, 4 추가)
    List<TechStackRelation> newRelations = Arrays.asList(
        new TechStackRelation(2L, false, null),
        new TechStackRelation(3L, false, null),
        new TechStackRelation(4L, false, null)
    );
    relationshipAdapter.replaceTechStacks(projectId, newRelations);

    // Then: [2, 3, 4]만 존재
    List<ProjectTechStackJpaEntity> result =
        projectTechStackJpaRepository.findByProjectId(projectId);
    assertThat(result).hasSize(3);
    assertThat(result)
        .extracting(e -> e.getTechStack().getId())
        .containsExactlyInAnyOrder(2L, 3L, 4L);
}
```

### 2. Integration Test (Controller → Service → Repository)
```java
@Test
void updateProject_shouldNotThrowDuplicateKeyError() {
    // Given: 기존 프로젝트
    ProjectResponse created = createProjectWithTechStacks(
        "Test Project",
        Arrays.asList(1L, 2L, 3L)
    );

    // When: 동일한 기술 스택으로 수정
    AdminProjectUpdateRequest request = AdminProjectUpdateRequest.builder()
        .title("Updated Title")
        .description("Updated Description")
        .technologies(Arrays.asList(1L, 2L, 3L))  // 동일
        .build();

    // Then: 에러 없이 성공
    ResponseEntity<ApiResponse<ProjectResponse>> response =
        adminProjectController.updateProject(created.getId(), request);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
}
```

### 3. E2E Test (Frontend → Backend)
```typescript
describe('Project Update with TechStacks', () => {
  it('should update project without duplicate key error', async () => {
    // Given: 기존 프로젝트 생성
    const project = await createProject({
      title: 'Test Project',
      description: 'Test Description',
      technologies: [1, 2, 3]
    });

    // When: 동일한 기술 스택으로 수정
    const response = await updateProject(project.id, {
      title: 'Updated Title',
      technologies: [1, 2, 3]  // 동일
    });

    // Then: 성공
    expect(response.status).toBe(200);
  });
});
```

---

## 🚀 실행 계획

### Phase 1: 긴급 수정 (1일)
- [ ] Option 1 (명시적 플러시) 적용
  - [ ] `ProjectRelationshipAdapter` 수정
  - [ ] `ExperienceRelationshipAdapter` 수정
  - [ ] `EducationRelationshipAdapter` 수정
- [ ] 기본 테스트 작성 및 실행
- [ ] 스테이징 환경 배포 및 검증
- [ ] 프로덕션 배포

### Phase 2: 개선 (1주)
- [ ] Option 2 (Merge 전략) 설계
- [ ] 각 Adapter별 리팩토링
  - [ ] `ProjectRelationshipAdapter`
  - [ ] `ExperienceRelationshipAdapter`
  - [ ] `EducationRelationshipAdapter`
- [ ] 통합 테스트 작성
- [ ] 코드 리뷰 및 피드백
- [ ] 프로덕션 배포

### Phase 3: 모니터링 및 문서화 (지속)
- [ ] 관계 관리 패턴 Best Practice 문서화
- [ ] ADR (Architecture Decision Record) 작성
- [ ] 신규 개발자 온보딩 가이드 업데이트
- [ ] 프로덕션 에러 로그 모니터링

---

## 📚 참고 자료

### 관련 파일
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ProjectRelationshipAdapter.java`
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ExperienceRelationshipAdapter.java`
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/EducationRelationshipAdapter.java`
- `backend/src/main/resources/db/migration/V002__add_admin_features.sql`

### 관련 문서
- [Hexagonal Architecture Guide](../ai/agent_guideline/backend/hexagonal-architecture-guide.md)
- [CRUD Template Guide](../ai/agent_guideline/backend/crud-template-guide.md)
- [JPA Best Practices](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)

### JPA 관련
- [EntityManager.flush()](https://docs.oracle.com/javaee/7/api/javax/persistence/EntityManager.html#flush--)
- [CascadeType Options](https://docs.oracle.com/javaee/7/api/javax/persistence/CascadeType.html)
- [orphanRemoval](https://docs.oracle.com/javaee/7/api/javax/persistence/OneToMany.html#orphanRemoval--)

---

## ✅ 체크리스트

### 수정 전 확인사항
- [ ] 현재 프로덕션 DB 백업 완료
- [ ] 로컬 환경에서 재현 가능 확인
- [ ] 영향받는 모든 도메인 식별 완료

### 수정 후 확인사항
- [ ] Unit 테스트 통과
- [ ] Integration 테스트 통과
- [ ] 스테이징 환경 검증 완료
- [ ] 프로덕션 배포 전 롤백 계획 수립
- [ ] 배포 후 모니터링 설정

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-12-16
**상태**: 분석 완료 → 구현 대기
