# 수정 대상 파일 목록

## 📋 개요
duplicate key 에러를 해결하기 위해 수정해야 할 파일들의 상세 목록입니다.

---

## 🔴 Phase 1: 긴급 수정 (필수)

### 1. ProjectRelationshipAdapter.java
**파일 경로**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ProjectRelationshipAdapter.java
```

**수정 위치**: Line 41-42
```java
// Before
projectTechStackJpaRepository.deleteByProjectId(project.getId());

if (relationships == null || relationships.isEmpty()) {

// After
projectTechStackJpaRepository.deleteByProjectId(project.getId());

// ✅ FIX: 명시적 플러시로 삭제가 DB에 반영되도록 보장
log.debug("Flushing delete operations to database");
projectTechStackJpaRepository.flush();

if (relationships == null || relationships.isEmpty()) {
```

**수정 메서드**: `replaceTechStacks()`

**예상 영향**:
- ✅ 프로젝트 수정 시 duplicate key 에러 해결
- ✅ 관계 관리 안정성 향상

---

### 2. EducationRelationshipAdapter.java
**파일 경로**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/EducationRelationshipAdapter.java
```

**수정 위치 1**: Line 47-48 (replaceTechStacks)
```java
// Before
educationTechStackJpaRepository.deleteByEducationId(education.getId());

if (relationships == null || relationships.isEmpty()) {

// After
educationTechStackJpaRepository.deleteByEducationId(education.getId());

// ✅ FIX: 명시적 플러시로 삭제가 DB에 반영되도록 보장
log.debug("Flushing delete operations to database");
educationTechStackJpaRepository.flush();

if (relationships == null || relationships.isEmpty()) {
```

**수정 위치 2**: Line 84-85 (replaceProjects)
```java
// Before
educationProjectJpaRepository.deleteByEducationId(education.getId());

if (relationships == null || relationships.isEmpty()) {

// After
educationProjectJpaRepository.deleteByEducationId(education.getId());

// ✅ FIX: 명시적 플러시로 삭제가 DB에 반영되도록 보장
log.debug("Flushing delete operations to database");
educationProjectJpaRepository.flush();

if (relationships == null || relationships.isEmpty()) {
```

**수정 메서드**:
- `replaceTechStacks()`
- `replaceProjects()`

**예상 영향**:
- ✅ 교육 이력 수정 시 duplicate key 에러 해결
- ✅ 교육-프로젝트 관계 관리 안정성 향상

---

### 3. ExperienceRelationshipAdapter.java (확인 필요)

**파일 경로**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/ExperienceRelationshipAdapter.java
```

**상태**: ⚠️ 파일이 존재하지 않을 수 있음

**확인 사항**:
1. 파일 존재 여부 확인
2. 존재한다면 다음 메서드 확인:
   - `replaceTechStacks()`
   - `replaceProjects()`
3. 동일한 패턴으로 `flush()` 추가

**예상 구조** (파일이 존재한다면):
```java
@Override
public void replaceTechStacks(String experienceBusinessId, List<TechStackRelation> relationships) {
    // ...
    experienceTechStackJpaRepository.deleteByExperienceId(experience.getId());

    // ✅ 추가
    experienceTechStackJpaRepository.flush();

    // ...
}

@Override
public void replaceProjects(String experienceBusinessId, List<ProjectRelation> relationships) {
    // ...
    experienceProjectJpaRepository.deleteByExperienceId(experience.getId());

    // ✅ 추가
    experienceProjectJpaRepository.flush();

    // ...
}
```

---

## 🚀 Phase 2: 성능 개선 (선택적)

### 1. ProjectTechStackJpaRepository.java

**파일 경로**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/ProjectTechStackJpaRepository.java
```

**추가할 메서드**:
```java
package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTechStackJpaRepository extends JpaRepository<ProjectTechStackJpaEntity, Long> {

    // ✅ 추가: Merge 전략을 위한 조회 메서드
    List<ProjectTechStackJpaEntity> findByProjectId(Long projectId);

    // 기존 메서드 (이미 존재)
    void deleteByProjectId(Long projectId);
}
```

---

### 2. EducationTechStackJpaRepository.java

**파일 경로**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/EducationTechStackJpaRepository.java
```

**추가할 메서드**:
```java
// ✅ 추가: Merge 전략을 위한 조회 메서드
List<EducationTechStackJpaEntity> findByEducationId(Long educationId);
```

---

### 3. EducationProjectJpaRepository.java

**파일 경로**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/EducationProjectJpaRepository.java
```

**추가할 메서드**:
```java
// ✅ 추가: Merge 전략을 위한 조회 메서드
List<EducationProjectJpaEntity> findByEducationId(Long educationId);
```

---

### 4. ProjectRelationshipAdapter.java (리팩토링)

**수정 내용**: `replaceTechStacks()` 메서드를 Merge 전략으로 변경

**참고**: [implementation-plan.md](./implementation-plan.md) Phase 2 참조

---

### 5. EducationRelationshipAdapter.java (리팩토링)

**수정 내용**:
- `replaceTechStacks()` 메서드를 Merge 전략으로 변경
- `replaceProjects()` 메서드를 Merge 전략으로 변경

**참고**: [implementation-plan.md](./implementation-plan.md) Phase 2 참조

---

## 📝 수정 체크리스트

### Phase 1 체크리스트

#### ProjectRelationshipAdapter
- [ ] `replaceTechStacks()` 메서드에 `flush()` 추가
- [ ] 로그 메시지 추가 확인
- [ ] 빌드 성공 확인
- [ ] 수동 테스트 완료

#### EducationRelationshipAdapter
- [ ] `replaceTechStacks()` 메서드에 `flush()` 추가
- [ ] `replaceProjects()` 메서드에 `flush()` 추가
- [ ] 로그 메시지 추가 확인
- [ ] 빌드 성공 확인
- [ ] 수동 테스트 완료

#### ExperienceRelationshipAdapter (존재하는 경우)
- [ ] 파일 존재 여부 확인
- [ ] `replaceTechStacks()` 메서드에 `flush()` 추가
- [ ] `replaceProjects()` 메서드에 `flush()` 추가 (존재하는 경우)
- [ ] 로그 메시지 추가 확인
- [ ] 빌드 성공 확인
- [ ] 수동 테스트 완료

#### 통합 테스트
- [ ] 프로젝트 생성 → 수정 (기술 스택 동일)
- [ ] 프로젝트 생성 → 수정 (기술 스택 변경)
- [ ] 교육 이력 생성 → 수정 (기술 스택 동일)
- [ ] 교육 이력 생성 → 수정 (프로젝트 동일)
- [ ] 경력 생성 → 수정 (존재하는 경우)

#### 배포
- [ ] 로컬 빌드 성공
- [ ] 스테이징 배포
- [ ] 스테이징 검증 (30분)
- [ ] 프로덕션 배포

---

### Phase 2 체크리스트

#### Repository 메서드 추가
- [ ] ProjectTechStackJpaRepository에 `findByProjectId()` 추가
- [ ] EducationTechStackJpaRepository에 `findByEducationId()` 추가
- [ ] EducationProjectJpaRepository에 `findByEducationId()` 추가
- [ ] ExperienceTechStackJpaRepository 확인 (존재하는 경우)
- [ ] ExperienceProjectJpaRepository 확인 (존재하는 경우)

#### Adapter 리팩토링
- [ ] ProjectRelationshipAdapter Merge 전략 구현
- [ ] EducationRelationshipAdapter (TechStack) Merge 전략 구현
- [ ] EducationRelationshipAdapter (Project) Merge 전략 구현
- [ ] ExperienceRelationshipAdapter 리팩토링 (존재하는 경우)

#### 테스트 작성
- [ ] Unit Test: 동일한 관계로 재호출
- [ ] Unit Test: 부분 변경
- [ ] Unit Test: 변경 없음
- [ ] Integration Test: 전체 플로우
- [ ] Performance Test: 쿼리 수 검증

#### 배포
- [ ] 로컬 빌드 성공
- [ ] Unit 테스트 통과
- [ ] Integration 테스트 통과
- [ ] 스테이징 배포 및 검증
- [ ] 성능 개선 확인
- [ ] 프로덕션 배포

---

## 🔍 파일 확인 명령어

### Backend 파일 존재 여부 확인
```bash
# Windows (PowerShell)
ls backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/*RelationshipAdapter.java

# Git Bash / Linux
ls backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/*RelationshipAdapter.java
```

### Repository 파일 확인
```bash
ls backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/repository/*JpaRepository.java
```

---

## 📦 관련 테이블 구조

### 영향받는 테이블

#### 1. project_tech_stack
```sql
CREATE TABLE project_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, tech_stack_id)  -- ⚠️ 이 제약조건이 문제 원인
);
```

#### 2. education_tech_stack
```sql
CREATE TABLE education_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES educations(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, tech_stack_id)  -- ⚠️ 이 제약조건이 문제 원인
);
```

#### 3. education_project
```sql
CREATE TABLE education_project (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES educations(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_type VARCHAR(50),
    grade VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, project_id)  -- ⚠️ 이 제약조건이 문제 원인
);
```

#### 4. experience_tech_stack (예상)
```sql
CREATE TABLE experience_tech_stack (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    tech_stack_id BIGINT NOT NULL REFERENCES tech_stack_metadata(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    usage_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, tech_stack_id)
);
```

#### 5. experience_project (예상)
```sql
CREATE TABLE experience_project (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, project_id)
);
```

---

## 🚨 주의사항

### 1. flush() 호출 위치
```java
// ✅ 올바른 위치
deleteByProjectId(projectId);
flush();  // DELETE 직후
// INSERT 시작

// ❌ 잘못된 위치
deleteByProjectId(projectId);
// INSERT 시작
flush();  // 너무 늦음
```

### 2. 트랜잭션 경계
- 모든 Relationship Adapter는 `@Transactional`로 표시되어 있음
- `flush()`는 트랜잭션 내에서만 유효
- 트랜잭션 외부에서는 효과 없음

### 3. 성능 고려사항
- Phase 1: `flush()`로 인한 성능 저하는 미미함 (밀리초 단위)
- Phase 2: Merge 전략으로 전체 성능 향상 가능

### 4. 롤백 시나리오
- Phase 1 적용 후 문제 발생 시: `flush()` 라인만 제거
- Phase 2 적용 후 문제 발생 시: Phase 1 버전으로 되돌림

---

## 📊 파일별 우선순위

| 우선순위 | 파일 | 영향도 | 수정 난이도 |
|---------|------|--------|------------|
| 🔴 1 | ProjectRelationshipAdapter | 높음 | 쉬움 |
| 🔴 2 | EducationRelationshipAdapter | 높음 | 쉬움 |
| 🟡 3 | ExperienceRelationshipAdapter | 중간 (파일 확인 필요) | 쉬움 |
| 🟢 4 | *JpaRepository (Phase 2) | 낮음 | 쉬움 |
| 🟢 5 | *RelationshipAdapter (Phase 2 리팩토링) | 낮음 | 보통 |

---

**작성일**: 2025-12-16
**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-12-16
