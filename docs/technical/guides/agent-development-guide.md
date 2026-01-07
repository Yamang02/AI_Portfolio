# AI Agent 개발 가이드

이 문서는 AI 에이전트가 프로젝트를 이해하고 개발 작업을 수행할 때 참고하는 종합 가이드입니다.

## 프로젝트 개요

이 프로젝트는 AI 포트폴리오 웹 애플리케이션으로, 다음과 같은 아키텍처를 따릅니다:

- **백엔드**: Hexagonal Architecture (Ports and Adapters)
- **프론트엔드**: Feature-Sliced Design (FSD)

---

## 📚 아키텍처 가이드라인

### 백엔드 (Hexagonal Architecture)

**참고 문서**: [`backend/hexagonal-architecture-guide.md`](./backend/hexagonal-architecture-guide.md), [`backend/crud-template-guide.md`](./backend/crud-template-guide.md)

#### 핵심 원칙
1. **의존성 역전 원칙 (DIP)**: 모든 의존성은 안쪽(도메인)을 향합니다
2. **비즈니스 로직 격리**: 도메인 계층은 외부 기술에 독립적입니다
3. **포트를 통한 통신**: 계층 간 통신은 인터페이스(포트)를 통해서만 이루어집니다

#### 계층 구조
```
Infrastructure (Adapters)
    ↓ (의존)
Application (Use Cases)
    ↓ (의존)
Domain (Ports + Models)
```

#### 주요 패키지 구조
```
backend/src/main/java/com/aiportfolio/backend/
├── domain/{도메인}/              # 도메인 계층
│   ├── model/                   # 도메인 모델
│   ├── port/in/                 # Use Case 인터페이스
│   ├── port/out/                # Repository 포트
│   └── service/                 # 도메인 서비스
├── application/{도메인}/         # 애플리케이션 계층
│   └── {UseCase}Service.java   # Use Case 구현
└── infrastructure/              # 인프라 계층
    ├── persistence/postgres/   # 영속성 어댑터
    └── web/                    # 웹 어댑터
```

**중요 규칙**:
- ❌ Domain Layer에서 JPA, Spring Framework 등 인프라 기술 의존 금지
- ❌ Application Layer에서 Infrastructure 구체 클래스 직접 의존 금지
- ✅ 모든 외부 의존성은 Port 인터페이스를 통해 접근

---

### 프론트엔드 (Feature-Sliced Design)

**참고 문서**: [`frontend/frontend-architecture-guide.md`](./frontend/frontend-architecture-guide.md), [`frontend/crud-template-guide.md`](./frontend/crud-template-guide.md)

#### 핵심 원칙
1. **계층화**: 각 계층은 명확한 책임을 가집니다
2. **단방향 의존성**: 상위 계층만 하위 계층에 의존합니다
3. **독립성**: 각 기능(feature)은 독립적으로 작동합니다
4. **재사용성**: shared 계층을 통해 공통 로직을 공유합니다

#### 계층 구조 (위에서 아래로)
```
app         → 애플리케이션 진입점 및 전역 설정
 ↓
pages       → 라우팅 및 페이지 조합
 ↓
features    → 비즈니스 기능 (사용자 시나리오)
 ↓
entities    → 비즈니스 엔티티 (도메인 모델)
 ↓
shared      → 재사용 가능한 공통 코드
```

#### 주요 디렉토리 구조
```
frontend/src/admin/
├── app/                        # 앱 설정
├── pages/                      # 페이지
│   └── {Entity}Management.tsx
├── features/{entity}-management/ # 기능
│   ├── hooks/                  # 비즈니스 로직 훅
│   └── ui/                     # UI 컴포넌트
├── entities/{entity}/          # 엔티티
│   ├── model/                  # 타입 정의
│   └── api/                    # API Client, React Query
└── shared/                     # 공통 코드
```

**중요 규칙**:
- ❌ 하위 계층이 상위 계층 import 금지
- ❌ Feature 간 직접 의존 금지
- ✅ 각 계층은 `index.ts`를 통해 Public API만 노출

---

## 🎯 CRUD 템플릿

프로젝트 내 모든 도메인은 일관된 CRUD 패턴을 따릅니다. 새로운 도메인 추가 시 템플릿을 참고하세요.

### 📚 템플릿 가이드 문서

백엔드와 프론트엔드의 템플릿 가이드가 분리되어 있습니다:

- **[백엔드 CRUD 템플릿 가이드](./backend/crud-template-guide.md)**
  - Hexagonal Architecture 기반
  - Domain, Application, Infrastructure 계층별 템플릿
  - 상세한 코드 예시 및 패턴

- **[프론트엔드 CRUD 템플릿 가이드](./frontend/crud-template-guide.md)**
  - Feature-Sliced Design 기반
  - Entities, Features, Pages, Shared 계층별 템플릿
  - 재사용 가능한 공통 UI 컴포넌트 포함

### 백엔드 템플릿 구성요소

1. **Domain Layer**
   - 도메인 모델 (`{Entity}.java`)
   - UseCase 인터페이스 (`Manage{Entity}UseCase`, `Get{Entity}UseCase`)
   - Repository Port (`{Entity}RepositoryPort`)
   - Domain Service (`{Entity}DomainService`)

2. **Application Layer**
   - Service 구현 (`Manage{Entity}Service`, `Get{Entity}Service`)
   - 공통 CRUD 로직 (`BaseCrudService` - 선택적)

3. **Infrastructure Layer**
   - JPA Entity, Repository, Mapper, Adapter
   - REST Controller, DTO

### 프론트엔드 템플릿 구성요소

1. **Shared Layer** (공통 컴포넌트 - 최초 1회만 작성)
   - `Table` - 재사용 가능한 테이블 (수정/삭제 액션 포함)
   - `Modal` - 재사용 가능한 폼 모달
   - `DetailPageLayout` - 재사용 가능한 상세 페이지
   - `StatsCards` - 재사용 가능한 통계 카드
   - `SearchFilter` - 재사용 가능한 검색 필터

2. **Entities Layer**
   - 타입 정의 (`{entity}.types.ts`)
   - API Client (`{entity}Api.ts`)
   - React Query 훅 (`use{Entity}Query.ts`)

3. **Features Layer**
   - 비즈니스 로직 훅 (`use{Entity}Filter.ts`, `use{Entity}Stats.ts`)
   - UI 컴포넌트 (`{Entity}TableColumns.tsx`)

4. **Pages Layer**
   - 페이지 컴포넌트 (`{Entity}Management.tsx`)
   - Shared 컴포넌트 활용

---

## 🚀 개발 워크플로우

### 새로운 도메인 추가 시

#### 1. 백엔드 개발
```bash
# 1. Domain Layer 작성 (인프라 의존성 없음)
domain/{도메인}/model/{Entity}.java
domain/{도메인}/port/in/Manage{Entity}UseCase.java
domain/{도메인}/port/in/Get{Entity}UseCase.java
domain/{도메인}/port/out/{Entity}RepositoryPort.java
domain/{도메인}/service/{Entity}DomainService.java

# 2. Application Layer 작성
application/{도메인}/Manage{Entity}Service.java
application/{도메인}/Get{Entity}Service.java

# 3. Infrastructure Layer 작성
infrastructure/persistence/postgres/entity/{Entity}JpaEntity.java
infrastructure/persistence/postgres/repository/{Entity}JpaRepository.java
infrastructure/persistence/postgres/mapper/{Entity}Mapper.java
infrastructure/persistence/postgres/adapter/{Entity}RepositoryAdapter.java
infrastructure/web/controller/{Entity}Controller.java
infrastructure/web/dto/{entity}/{Entity}Dto.java
```

#### 2. 프론트엔드 개발
```bash
# 0. Shared Layer (최초 1회만, 이후 재사용)
shared/ui/Table.tsx
shared/ui/Modal.tsx
shared/ui/DetailPageLayout.tsx
shared/ui/StatsCards.tsx
shared/ui/SearchFilter.tsx
shared/ui/index.ts

# 1. Entities Layer
entities/{entity}/model/{entity}.types.ts
entities/{entity}/api/{entity}Api.ts
entities/{entity}/api/use{Entity}Query.ts
entities/{entity}/index.ts

# 2. Features Layer
features/{entity}-management/hooks/use{Entity}Filter.ts
features/{entity}-management/hooks/use{Entity}Stats.ts
features/{entity}-management/ui/{Entity}TableColumns.tsx
features/{entity}-management/index.ts

# 3. Pages Layer
pages/{Entity}Management.tsx  # Shared 컴포넌트 활용
```

---

## 📋 체크리스트

### 백엔드 개발 시 확인사항
- [ ] Domain 모델은 순수 Java인가? (인프라 의존성 없음)
- [ ] 비즈니스 로직이 도메인 모델에 있는가?
- [ ] UseCase 인터페이스가 정의되어 있는가?
- [ ] Service는 UseCase를 구현하는가?
- [ ] 포트를 통해서만 Infrastructure에 의존하는가?
- [ ] JPA Entity와 도메인 모델이 분리되어 있는가?
- [ ] Mapper를 통해 Entity ↔ Domain 변환이 이루어지는가?
- [ ] Controller는 UseCase에만 의존하는가?

### 프론트엔드 개발 시 확인사항
- [ ] **Shared Layer**: 공통 UI 컴포넌트가 작성되어 있는가?
  - [ ] Table, Modal, DetailPageLayout, StatsCards, SearchFilter
  - [ ] Public API (index.ts)가 정의되어 있는가?
- [ ] **Entities Layer**: 타입이 entities/{entity}/model/에 정의되어 있는가?
- [ ] API Client가 entities/{entity}/api/에 있는가?
- [ ] React Query 훅이 정의되어 있는가?
- [ ] **Features Layer**: 비즈니스 로직이 features에 있는가?
- [ ] Feature 간 직접 의존이 없는가?
- [ ] **Pages Layer**: 페이지는 features와 shared를 조합만 하는가?
- [ ] Shared 컴포넌트를 적극 활용하고 있는가?
- [ ] 각 계층의 index.ts를 통해 Public API가 노출되는가?
- [ ] 하위 계층이 상위 계층을 import 하지 않는가?

---

## 🔍 참고 예시

### 좋은 예시

#### 1. 기술스택 (TechStack) 도메인

**백엔드**:
- ✅ `domain/portfolio/model/TechStackMetadata.java` - 순수 도메인 모델
- ✅ `domain/portfolio/port/in/ManageTechStackMetadataUseCase.java` - UseCase 인터페이스
- ✅ `domain/portfolio/port/out/TechStackMetadataRepositoryPort.java` - Repository Port
- ✅ `application/portfolio/ManageTechStackMetadataService.java` - UseCase 구현
- ✅ `infrastructure/persistence/postgres/adapter/PostgresTechStackMetadataRepository.java` - Port 구현

**프론트엔드**:
- ✅ `shared/ui/Table.tsx` - 재사용 가능한 테이블 컴포넌트
- ✅ `shared/ui/Modal.tsx` - 재사용 가능한 모달 컴포넌트
- ✅ `shared/ui/StatsCards.tsx` - 재사용 가능한 통계 카드
- ✅ `entities/tech-stack/model/techStack.types.ts` - 타입 정의
- ✅ `entities/tech-stack/api/adminTechStackApi.ts` - API Client
- ✅ `entities/tech-stack/api/useAdminTechStackQuery.ts` - React Query 훅
- ✅ `features/tech-stack-management/hooks/useTechStackFilter.ts` - 비즈니스 로직
- ✅ `features/tech-stack-management/ui/TechStackTableColumns.tsx` - 테이블 컬럼 정의
- ✅ `pages/TechStackManagement.tsx` - Shared 컴포넌트 활용한 페이지

#### 2. 교육 (Education) 도메인

**백엔드**:
- ✅ `domain/portfolio/model/Education.java` - 도메인 모델
- ✅ `domain/portfolio/port/in/ManageEducationUseCase.java` - CUD UseCase
- ✅ `domain/portfolio/port/in/GetEducationUseCase.java` - R UseCase
- ✅ `application/portfolio/ManageEducationService.java` - CUD 구현
- ✅ `application/portfolio/GetEducationService.java` - R 구현
- ✅ `infrastructure/web/controller/EducationController.java` - REST API

**프론트엔드**:
- ✅ `entities/education/model/education.types.ts` - 타입 정의
- ✅ `entities/education/api/adminEducationApi.ts` - API Client
- ✅ `entities/education/api/useAdminEducationQuery.ts` - React Query 훅
- ✅ `features/education-management/hooks/useEducationFilter.ts` - 필터링 로직
- ✅ `features/education-management/hooks/useEducationStats.ts` - 통계 계산
- ✅ `features/education-management/ui/EducationTableColumns.tsx` - 테이블 컬럼
- ✅ `pages/EducationManagement.tsx` - Shared 컴포넌트 활용

#### 3. 경력 (Experience) 도메인

**백엔드**:
- ✅ `domain/portfolio/model/Experience.java` - 도메인 모델
- ✅ `domain/portfolio/port/in/ManageExperienceUseCase.java` - CUD UseCase
- ✅ `domain/portfolio/port/in/GetExperienceUseCase.java` - R UseCase
- ✅ `application/portfolio/ManageExperienceService.java` - CUD 구현
- ✅ `application/portfolio/GetExperienceService.java` - R 구현
- ✅ `infrastructure/web/controller/ExperienceController.java` - REST API

**프론트엔드**:
- ✅ `entities/experience/model/experience.types.ts` - 타입 정의
- ✅ `entities/experience/api/adminExperienceApi.ts` - API Client
- ✅ `entities/experience/api/useAdminExperienceQuery.ts` - React Query 훅
- ✅ `features/experience-management/hooks/useExperienceFilter.ts` - 필터링 로직
- ✅ `features/experience-management/hooks/useExperienceStats.ts` - 통계 계산
- ✅ `features/experience-management/ui/ExperienceTableColumns.tsx` - 테이블 컬럼
- ✅ `pages/ExperienceManagement.tsx` - Shared 컴포넌트 활용

---

## 📖 추가 학습 자료

### 아키텍처
- [Hexagonal Architecture 원문](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)

### 기술 스택
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [React 공식 문서](https://react.dev/)

---

## 🛠️ 도메인 구현 현황

### 완료된 도메인

| 순위 | 도메인 | 복잡도 | 소요 시간 | 상태 | 비고 |
|-----|--------|--------|----------|------|------|
| 1 | TechStack | 중 | - | ✅ 완료 | 템플릿 기준, Shared 컴포넌트 포함 |
| 2 | Education | 중 | ~6시간 | ✅ 완료 | Hexagonal Architecture + FSD 적용 |
| 3 | Experience | 중 | ~6시간 | ✅ 완료 | Hexagonal Architecture + FSD 적용 |
| 4 | Certification | 중 | ~4시간 | ✅ 완료 | 만료일 추적 기능 포함 |

### 다음 마이그레이션 대상

| 순위 | 도메인 | 복잡도 | 예상 시간 | 상태 | 비고 |
|-----|--------|--------|----------|------|------|
| 5 | Project | 높음 | 8-10시간 | 🔜 대기 | 복잡한 관계, TechStack 연관 |
| 6 | Skill | 중 | 4-6시간 | 🔜 대기 | TechStack과 통합 검토 필요 |
| 7 | Admin | 중 | 6-8시간 | 🔜 대기 | 인증/인가 로직 포함 |

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-01-26
