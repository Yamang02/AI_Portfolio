# 관리자 페이지 데이터 관리 수정 계획 (Fix Directory)

## 📋 개요

관리자 페이지에서 프로젝트 수정 시 발생하는 **duplicate key constraint violation** 에러를 해결하기 위한 종합 분석 및 구현 계획입니다.

---

## 📚 문서 구조

### 1. [이슈 분석 문서](./admin-data-management-issue-analysis.md)
**파일**: `admin-data-management-issue-analysis.md`

**내용**:
- 🔴 문제 상황 및 에러 로그
- 🔍 근본 원인 분석
  - 데이터베이스 스키마 (UNIQUE 제약조건)
  - 관계 관리 로직 (트랜잭션 타이밍 이슈)
- 🎯 영향 범위 (Project, Experience, Education)
- 🔧 해결 방안 3가지
  - Option 1: 명시적 플러시 추가 (Quick Fix) ⭐ 권장
  - Option 2: Merge 전략 (Optimal Solution) 🎯 최적
  - Option 3: JPA Cascade 활용 (Architectural Refactoring)
- 📊 각 옵션 비교 및 평가
- 🧪 테스트 계획

**대상 독자**: 개발자, 아키텍트, 기술 리더

---

### 2. [구현 계획 문서](./implementation-plan.md)
**파일**: `implementation-plan.md`

**내용**:
- 🎯 3단계 목표 (긴급 수정 → 개선 → 장기)
- 📂 현재 구조 분석
- 🔧 Phase 1: 긴급 수정 (명시적 플러시)
  - 코드 예시
  - 테스트 계획
  - 배포 계획
- 🚀 Phase 2: 개선 (Merge 전략)
  - 상세 구현 방법
  - 성능 비교
  - 안전장치
- 📝 Best Practice 가이드
- 📅 일정 및 완료 기준
- 🚨 롤백 계획

**대상 독자**: 개발자, DevOps

---

## 🚀 Quick Start

### 긴급 수정이 필요한 경우 (즉시 적용)

1. **Phase 1 구현** (예상 시간: 2시간)
   ```bash
   # 1. 브랜치 생성
   git checkout -b fix/duplicate-key-error

   # 2. 다음 파일 수정 (implementation-plan.md 참고)
   # - ProjectRelationshipAdapter.java
   # - ExperienceRelationshipAdapter.java
   # - EducationRelationshipAdapter.java

   # 3. 빌드 및 테스트
   ./gradlew clean build

   # 4. 커밋 및 푸시
   git add .
   git commit -m "fix: Add explicit flush to prevent duplicate key error"
   git push origin fix/duplicate-key-error
   ```

2. **수동 테스트**
   - 프로젝트 생성 후 수정 (기술 스택 동일)
   - 프로젝트 수정 (기술 스택 변경)
   - 경력/교육 동일 테스트

3. **배포**
   - 스테이징 배포 → 검증 → 프로덕션 배포

---

## 🎯 권장 접근법

### 1단계: 즉시 적용 (당일)
✅ **Phase 1 (명시적 플러시)** 적용
- 최소 코드 변경
- 빠른 배포
- 문제 즉시 해결

### 2단계: 점진적 개선 (1주 이내)
✅ **Phase 2 (Merge 전략)** 리팩토링
- 성능 최적화 (쿼리 80% 감소)
- 불필요한 DELETE/INSERT 최소화
- 테스트 코드 강화

### 3단계: 장기 계획 (선택적)
✅ **Best Practice 문서화**
- 관계 관리 패턴 가이드
- 신규 도메인 개발 체크리스트
- ADR 작성

---

## 📊 핵심 요약

### 문제
```
프로젝트 수정 시 → duplicate key constraint violation
원인: DELETE 후 INSERT 시 트랜잭션 플러시 타이밍 이슈
```

### 해결책 (Phase 1)
```java
// Before
projectTechStackJpaRepository.deleteByProjectId(project.getId());
// INSERT 시작 → ❌ UNIQUE 제약 조건 위반

// After
projectTechStackJpaRepository.deleteByProjectId(project.getId());
projectTechStackJpaRepository.flush();  // ✅ 명시적 플러시
// INSERT 시작 → ✅ 안전
```

### 개선 (Phase 2)
```java
// 전체 DELETE/INSERT (비효율)
DELETE 10개, INSERT 10개 = 20 쿼리

// Merge 전략 (효율)
DELETE 2개, INSERT 2개 = 4 쿼리 (80% 감소)
```

---

## 🔍 영향 범위

| 도메인 | 파일 | 메서드 | 우선순위 |
|--------|------|--------|----------|
| **Project** | ProjectRelationshipAdapter | `replaceTechStacks()` | 🔴 높음 |
| **Experience** | ExperienceRelationshipAdapter | `replaceTechStacks()`, `replaceProjects()` | 🔴 높음 |
| **Education** | EducationRelationshipAdapter | `replaceTechStacks()`, `replaceProjects()` | 🔴 높음 |

---

## 📁 파일 위치

### Backend
```
backend/src/main/java/com/aiportfolio/backend/
├── infrastructure/persistence/postgres/adapter/
│   ├── ProjectRelationshipAdapter.java         ⬅️ 수정 필요
│   ├── ExperienceRelationshipAdapter.java      ⬅️ 수정 필요
│   └── EducationRelationshipAdapter.java       ⬅️ 수정 필요
├── infrastructure/persistence/postgres/repository/
│   ├── ProjectTechStackJpaRepository.java      ⬅️ (Phase 2) 메서드 추가
│   ├── ExperienceTechStackJpaRepository.java
│   └── EducationTechStackJpaRepository.java
└── domain/portfolio/port/out/
    ├── ProjectRelationshipPort.java
    ├── ExperienceRelationshipPort.java
    └── EducationRelationshipPort.java
```

### Database
```
backend/src/main/resources/db/migration/
└── V002__add_admin_features.sql                ⬅️ UNIQUE 제약조건 확인
```

---

## 🧪 테스트 전략

### 1. Unit Test
```java
✅ replaceTechStacks_withSameTechStacks_shouldNotThrowException()
✅ replaceTechStacks_withPartialChange_shouldOnlyModifyDifferences()
✅ replaceTechStacks_withNoChange_shouldNotModifyDatabase()
```

### 2. Integration Test
```java
✅ updateProject_shouldNotThrowDuplicateKeyError()
✅ updateExperience_shouldNotThrowDuplicateKeyError()
✅ updateEducation_shouldNotThrowDuplicateKeyError()
```

### 3. Manual Test (Browser)
```
✅ 프로젝트 생성 → 수정 (기술 스택 동일)
✅ 프로젝트 생성 → 수정 (기술 스택 변경)
✅ 경력 생성 → 수정
✅ 교육 생성 → 수정
```

---

## 📞 도움이 필요한 경우

### 질문 체크리스트

1. **Phase 1을 먼저 적용해야 하나요?**
   - ✅ 예. 즉시 문제를 해결하고, 이후 Phase 2로 개선하세요.

2. **Phase 2는 필수인가요?**
   - ⚠️ 선택적. 성능 개선이 필요하면 적용하세요.

3. **모든 Adapter를 한 번에 수정해야 하나요?**
   - ✅ 예. Project, Experience, Education 모두 동일한 문제가 있습니다.

4. **테스트는 어디까지 해야 하나요?**
   - ✅ Phase 1: Manual Test + Basic Integration Test
   - ✅ Phase 2: Unit Test + Integration Test + Performance Test

5. **롤백 계획이 있나요?**
   - ✅ 예. [implementation-plan.md](./implementation-plan.md)의 "롤백 계획" 참고

---

## 📚 참고 자료

### 프로젝트 내부 문서
- [Hexagonal Architecture Guide](../ai/agent_guideline/backend/hexagonal-architecture-guide.md)
- [CRUD Template Guide](../ai/agent_guideline/backend/crud-template-guide.md)
- [Frontend Architecture Guide](../ai/agent_guideline/frontend/frontend-architecture-guide.md)

### 외부 문서
- [JPA EntityManager.flush()](https://docs.oracle.com/javaee/7/api/javax/persistence/EntityManager.html#flush--)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [PostgreSQL UNIQUE Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)

---

## 📊 진행 상황 (체크리스트)

### Phase 1: 긴급 수정
- [ ] ProjectRelationshipAdapter 수정
- [ ] ExperienceRelationshipAdapter 수정
- [ ] EducationRelationshipAdapter 수정
- [ ] 수동 테스트 완료
- [ ] 스테이징 배포
- [ ] 프로덕션 배포

### Phase 2: 개선
- [ ] Repository 메서드 추가
- [ ] ProjectRelationshipAdapter 리팩토링
- [ ] ExperienceRelationshipAdapter 리팩토링
- [ ] EducationRelationshipAdapter 리팩토링
- [ ] Unit 테스트 작성
- [ ] Integration 테스트 작성
- [ ] 성능 테스트 및 검증
- [ ] 프로덕션 배포

### Phase 3: 문서화
- [ ] Best Practice 가이드 작성
- [ ] ADR 작성
- [ ] 온보딩 자료 업데이트
- [ ] 모니터링 설정

---

## 🎯 성공 기준

### 기능적 성공
- ✅ 프로젝트/경력/교육 수정 시 duplicate key 에러 미발생
- ✅ 모든 CRUD 작업 정상 동작
- ✅ 관계 관리 정확성 유지

### 비기능적 성공
- ✅ 쿼리 수 80% 감소 (Phase 2 적용 시)
- ✅ 트랜잭션 시간 60% 감소 (Phase 2 적용 시)
- ✅ 코드 가독성 및 유지보수성 개선

---

**작성일**: 2025-12-16
**작성자**: AI Agent (Claude)
**상태**: ✅ 분석 완료 → 구현 대기
