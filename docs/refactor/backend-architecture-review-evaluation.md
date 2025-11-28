# Backend Architecture Review 평가 및 리팩토링 계획

> **작성일**: 2025-01-28
> **평가 대상**: `backend-architecture-review.md`
> **목적**: 리뷰의 정확성 검증 및 실현 가능한 리팩토링 계획 수립

---

## 📋 리뷰 정확성 평가

### ✅ 정확하게 지적된 문제점

#### 1. **DTO가 Domain Layer에 위치** ✅ **정확함**

**검증 결과**:
- `domain/admin/dto/response/ProjectResponse.java` 존재 확인
- `domain/admin/model/dto/` 디렉토리에 다수 DTO 존재:
  - `CloudUsageSnapshot.java`
  - `CloudUsageMetric.java`
  - `ImageUploadResponse.java`
  - `AdminUserInfo.java`

**심각도**: 🔴 **높음** (Hexagonal Architecture 핵심 원칙 위반)

---

#### 2. **Domain Model의 Jackson 애노테이션** ✅ **정확함**

**검증 결과**:
```java
// domain/portfolio/model/Project.java
@JsonProperty("isTeam")  // 라인 67
private boolean isTeam;

@JsonIgnore              // 라인 89, 97
public boolean isOngoing() { ... }
```

**심각도**: 🟡 **중간** (기능상 문제는 없으나 아키텍처 원칙 위반)

---

#### 3. **Domain Model의 Validation 애노테이션** ✅ **정확함**

**검증 결과**:
```java
// domain/portfolio/model/Project.java
@NotBlank(message = "프로젝트 ID는 필수입니다")  // 라인 24
@Size(max = 200, message = "...")              // 라인 28
@URL(message = "...")                           // 라인 39, 42, 45, 72
@NotNull(message = "...")                       // 라인 62
```

**총 16개의 Validation 애노테이션 발견**

**심각도**: 🟡 **중간** (기능상 문제는 없으나 계층 책임 분리 위반)

---

#### 4. **Controller의 JPA Repository 직접 의존** ✅ **정확함**

**검증 결과**:
```java
// infrastructure/web/admin/controller/AdminProjectController.java:32
private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

// 라인 197에서 직접 사용
techStackMetadataJpaRepository.findByName(name)
```

**해결 가능성**: ✅ **쉬움** (`TechStackMetadataRepositoryPort` 이미 존재)

**심각도**: 🔴 **높음** (계층 우회, 테스트 어려움)

---

#### 5. **UseCase가 DTO 반환** ✅ **정확함**

**검증 결과**:
```java
// domain/admin/port/in/ManageProjectUseCase.java:19, 28
ProjectResponse createProject(ProjectCreateCommand command);
ProjectResponse updateProject(String id, ProjectUpdateCommand command);
```

**심각도**: 🟡 **중간** (UseCase는 Domain Model 반환해야 함)

---

#### 6. **BaseCrudService 미활용** ✅ **정확함**

**검증 결과**:
- `BaseCrudService.java` 존재 확인 (227줄)
- 실제 사용: `package-info.java`에만 언급, 실제 서비스에서 상속 없음
- `ManageEducationService`, `ManageExperienceService` 등이 중복 코드 보유

**심각도**: 🟢 **낮음** (코드 중복이지만 기능상 문제 없음)

---

### ⚠️ 리뷰에서 보완이 필요한 부분

#### 1. **Specification 패턴 미활용** ⚠️ **부분적으로 부정확**

**리뷰 내용**: "Specification 디렉토리가 있지만 내용이 비어있을 가능성"

**실제 상황**:
- `ProjectSpecification.java` 존재 (93줄)
- `withFilter()` 메서드로 동적 쿼리 구현됨
- **실제로는 사용되고 있음**

**수정 필요**: 리뷰의 "미활용" 주장은 부정확. 다만 다른 엔티티(Education, Experience 등)에는 Specification이 없을 수 있음.

---

#### 2. **TechStackMetadata 조회 방법** ⚠️ **추가 정보 필요**

**리뷰 내용**: Controller에서 JPA Repository 직접 사용

**실제 상황**:
- `TechStackMetadataRepositoryPort` 이미 존재
- `GetTechStackMetadataUseCase` 인터페이스 존재
- `TechStackMetadataService` 구현체 존재

**해결 방안**: Controller에서 `GetTechStackMetadataUseCase` 사용하도록 변경

---

## 📊 리뷰 정확도 종합 평가

| 항목 | 정확도 | 비고 |
|-----|--------|------|
| **DTO 위치 문제** | ✅ 100% | 정확히 지적됨 |
| **Jackson 애노테이션** | ✅ 100% | 정확히 지적됨 |
| **Validation 애노테이션** | ✅ 100% | 정확히 지적됨 |
| **Controller JPA 의존** | ✅ 100% | 정확히 지적됨 |
| **UseCase DTO 반환** | ✅ 100% | 정확히 지적됨 |
| **BaseCrudService 미활용** | ✅ 100% | 정확히 지적됨 |
| **Specification 미활용** | ⚠️ 50% | Project는 사용 중, 다른 엔티티는 미확인 |

**전체 정확도**: **약 93%** (7개 중 6개 완전 정확, 1개 부분 정확)

---

## 🎯 리팩토링 계획

### Phase 1: 즉시 수정 (High Priority) 🔥

#### 1.1 Controller의 JPA Repository 의존 제거

**대상 파일**: `AdminProjectController.java`

**현재 문제**:
```java
private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

private List<ManageProjectService.TechStackRelation> toTechStackRelations(List<String> techStackNames) {
    return techStackNames.stream()
        .map(name -> techStackMetadataJpaRepository.findByName(name)  // ❌
            .map(techStack -> new ManageProjectService.TechStackRelation(...))
            .orElseThrow())
        .collect(Collectors.toList());
}
```

**해결 방안**:
```java
// Option 1: UseCase 사용 (권장)
private final GetTechStackMetadataUseCase getTechStackMetadataUseCase;

private List<ManageProjectService.TechStackRelation> toTechStackRelations(List<String> techStackNames) {
    return techStackNames.stream()
        .map(name -> getTechStackMetadataUseCase.getTechStackMetadataByName(name)  // ✅
            .map(techStack -> new ManageProjectService.TechStackRelation(
                techStack.getId(), false, null))
            .orElseThrow(() -> new IllegalArgumentException("TechStack을 찾을 수 없습니다: " + name)))
        .collect(Collectors.toList());
}
```

**또는 Option 2: Service로 로직 이동 (더 권장)**
- `toTechStackRelations` 로직을 `ManageProjectService`로 이동
- Controller는 단순히 UseCase 호출만

**작업 시간**: 30분
**영향 범위**: Controller 1개 파일
**테스트 필요**: ✅ (기존 기능 동작 확인)

---

#### 1.2 DTO 위치 이동

**대상 파일들**:
```
domain/admin/dto/response/ProjectResponse.java
domain/admin/model/dto/CloudUsageSnapshot.java
domain/admin/model/dto/CloudUsageMetric.java
domain/admin/model/dto/ImageUploadResponse.java
domain/admin/model/dto/AdminUserInfo.java
```

**이동 경로**:
```
domain/admin/dto/response/* 
  → infrastructure/web/admin/dto/response/

domain/admin/model/dto/*
  → infrastructure/web/admin/dto/ (또는 적절한 위치)
```

**작업 단계**:
1. DTO 파일 이동
2. 패키지 선언 수정
3. Import 문 수정 (전체 프로젝트 검색 필요)
4. 컴파일 오류 확인 및 수정

**영향 범위**:
- `ManageProjectUseCase` 인터페이스
- `ManageProjectService` 구현체
- `ProjectResponseMapper`
- `AdminProjectController`
- 기타 DTO 사용하는 모든 파일

**작업 시간**: 2-3시간
**테스트 필요**: ✅ (전체 API 엔드포인트 테스트)

---

### Phase 2: 중기 개선 (Medium Priority) 🟡

#### 2.1 Domain Model에서 Jackson 애노테이션 제거

**대상 파일**: `domain/portfolio/model/Project.java`

**제거할 애노테이션**:
- `@JsonProperty("isTeam")` (라인 67)
- `@JsonIgnore` (라인 89, 97)

**작업 단계**:
1. Domain Model에서 애노테이션 제거
2. DTO에 JSON 매핑 추가:
   ```java
   // infrastructure/web/admin/dto/response/ProjectResponse.java
   @JsonProperty("isTeam")
   private Boolean isTeam;
   ```
3. JSON 직렬화 테스트 (API 응답 확인)

**주의사항**:
- 기존 API 응답 형식 유지 필요
- 프론트엔드와의 호환성 확인

**작업 시간**: 1-2시간
**영향 범위**: API 응답 형식

---

#### 2.2 Domain Model에서 Validation 애노테이션 제거

**대상 파일**: `domain/portfolio/model/Project.java` (16개 애노테이션)

**작업 단계**:
1. Domain Model에서 Validation 애노테이션 제거
2. Request DTO에 Validation 추가:
   ```java
   // infrastructure/web/admin/dto/AdminProjectCreateRequest.java
   @NotBlank
   @Size(max = 200)
   private String title;
   
   @URL
   private String githubUrl;
   ```
3. Domain Model에 비즈니스 검증 메서드 추가 (선택사항):
   ```java
   public void validateForCreation() {
       if (id == null || id.isBlank()) {
           throw new IllegalArgumentException("프로젝트 ID는 필수입니다");
       }
   }
   ```

**주의사항**:
- Request DTO에 이미 Validation이 있는지 확인
- Domain 비즈니스 규칙은 Domain에 유지

**작업 시간**: 2-3시간
**영향 범위**: 모든 Domain Model 파일 (Project, Education, Experience 등)

---

#### 2.3 UseCase 반환 타입 정리

**현재**:
```java
public interface ManageProjectUseCase {
    ProjectResponse createProject(ProjectCreateCommand command);
}
```

**목표**:
```java
public interface ManageProjectUseCase {
    Project createProject(ProjectCreateCommand command);
}

// Application Service에서 DTO 변환
@Service
public class ManageProjectService implements ManageProjectUseCase {
    private final ProjectResponseMapper mapper;
    
    public ProjectResponse createProjectForAdmin(ProjectCreateCommand command) {
        Project project = createProject(command);
        return mapper.toResponse(project);
    }
}
```

**작업 단계**:
1. UseCase 인터페이스 수정 (Domain Model 반환)
2. Service 구현체 수정
3. Controller에서 Mapper 사용하도록 수정

**주의사항**:
- 기존 API 응답 형식 유지
- 모든 UseCase 일괄 수정 필요

**작업 시간**: 4-6시간
**영향 범위**: 모든 UseCase 인터페이스 및 구현체

---

### Phase 3: 장기 개선 (Low Priority) 🟢

#### 3.1 BaseCrudService 활용

**대상 서비스**:
- `ManageEducationService`
- `ManageExperienceService`
- `ManageCertificationService`

**작업 단계**:
1. 각 서비스가 `BaseCrudService` 상속하도록 변경
2. 공통 CRUD 로직 제거
3. 특화 로직만 유지

**작업 시간**: 3-4시간
**영향 범위**: CRUD 서비스들

---

#### 3.2 Specification 패턴 확장

**현재**: `ProjectSpecification`만 존재

**목표**: Education, Experience, Certification에도 Specification 추가

**작업 시간**: 2-3시간
**영향 범위**: 조회 서비스들

---

## 📅 리팩토링 일정 제안

### Week 1: High Priority 작업
- **Day 1-2**: Controller JPA 의존 제거 (1.1)
- **Day 3-5**: DTO 위치 이동 (1.2)

### Week 2: Medium Priority 작업
- **Day 1-2**: Jackson 애노테이션 제거 (2.1)
- **Day 3-5**: Validation 애노테이션 제거 (2.2)

### Week 3: Medium Priority 작업 (계속)
- **Day 1-3**: UseCase 반환 타입 정리 (2.3)
- **Day 4-5**: 테스트 및 버그 수정

### Week 4: Low Priority 작업 (여유 있을 때)
- BaseCrudService 활용
- Specification 패턴 확장

---

## ⚠️ 리팩토링 시 주의사항

### 1. **점진적 리팩토링**
- 한 번에 모든 것을 바꾸지 말 것
- 각 Phase별로 테스트 후 다음 단계 진행

### 2. **API 호환성 유지**
- 기존 API 응답 형식 유지
- 프론트엔드와의 호환성 확인

### 3. **테스트 커버리지**
- 각 리팩토링 후 통합 테스트 필수
- 특히 DTO 이동 후 전체 API 엔드포인트 테스트

### 4. **Git 전략**
- 각 Phase별로 브랜치 생성
- 작은 단위로 커밋

---

## 📝 체크리스트

### Phase 1: High Priority
- [ ] Controller JPA 의존 제거
  - [ ] `AdminProjectController` 수정
  - [ ] UseCase 또는 Service로 로직 이동
  - [ ] 테스트
- [ ] DTO 위치 이동
  - [ ] 파일 이동
  - [ ] Import 수정
  - [ ] 컴파일 오류 수정
  - [ ] 통합 테스트

### Phase 2: Medium Priority
- [ ] Jackson 애노테이션 제거
  - [ ] Domain Model 수정
  - [ ] DTO에 매핑 추가
  - [ ] API 응답 테스트
- [ ] Validation 애노테이션 제거
  - [ ] Domain Model 수정
  - [ ] Request DTO에 추가
  - [ ] 검증 테스트
- [ ] UseCase 반환 타입 정리
  - [ ] UseCase 인터페이스 수정
  - [ ] Service 구현체 수정
  - [ ] Controller 수정
  - [ ] 전체 테스트

### Phase 3: Low Priority
- [ ] BaseCrudService 활용
- [ ] Specification 패턴 확장

---

## 🔗 관련 문서

- [Backend Architecture Review](./backend-architecture-review.md)
- [Backend Service Refactoring TODO](./backend-service-refactoring-todo.md)
- [Hexagonal Architecture Guide](../ai/agent_guideline/backend/hexagonal-architecture-guide.md)

---

**작성자**: Claude Agent
**최종 업데이트**: 2025-01-28

