# Phase 1: Content Inventory - 설계 문서

> **목표**: DB에 저장된 콘텐츠를 기반으로 리뉴얼을 위한 콘텐츠 구조를 분석하고 정리

---

## 📌 개요

### 목적

현재 DB에 저장된 프로젝트 및 프로필 데이터를 분석하여:
1. 리뉴얼에 필요한 콘텐츠 구조를 파악
2. DB 필드와 리뉴얼 템플릿 간 매핑 관계 정의
3. 누락된 정보 식별 및 DB 스키마 개선 제안

### 전략

- **DB를 단일 소스로 유지**: 마크다운 파일로 분리하지 않음
- **인벤토리 문서 작성**: 리뉴얼 설계를 위한 참고 자료로 활용
- **DB 스키마 개선**: 필요 시 DB 필드 확장 제안

### 중요 방향성

- **프로젝트 상세페이지는 최신 정보만 표시**: 항상 현재 상태의 정보를 보여주는 것에 집중
- **프로젝트 히스토리/변경 이력은 고려하지 않음**: 나중에 기술블로그 형식의 페이지로 분리 예정
- **기술블로그는 별도 관리**: 필요시 프로젝트 ID를 매핑한 테이블로 관리 가능
- **현재는 프로젝트 상세페이지에 집중**: 최신 정보를 효과적으로 표시하는 것에 우선순위

---

## 🎯 작업 범위

### Task 1.1: 프로젝트 콘텐츠 인벤토리

#### 1.1.1 DB 데이터 추출 및 분석

**조사 대상:**
- `projects` 테이블 스키마
- `project_tech_stack` 관계 테이블
- `project_screenshots` 관계 테이블
- 실제 프로덕션 데이터

**분석 항목:**
- 현재 사용 중인 필드 목록
- 각 필드의 데이터 타입 및 제약조건
- 필드별 실제 데이터 현황
- NULL 허용 여부 및 기본값

#### 1.1.2 템플릿-DB 필드 매핑

**리뉴얼 템플릿 항목:**
```text
1. Project Name
2. Time Period
3. My Role
4. Initial Situation
5. Key Problems Observed
6. Direction / Decision Made
7. Outcome
8. References
```

**매핑 테이블 작성:**

| 템플릿 항목 | DB 필드 | 현재 상태 | 개선 필요 여부 | 비고 |
|------------|---------|----------|---------------|------|
| Project Name | `title` | ✅ 사용 가능 | - | - |
| Time Period | `start_date`, `end_date` | ✅ 사용 가능 | - | - |
| My Role | `role` | ✅ 사용 가능 | - | - |
| Initial Situation | `readme` | ✅ 사용 가능 | README에서 추출 | README 마크다운에 포함 |
| Key Problems | `readme` | ✅ 사용 가능 | README에서 추출 | README 마크다운에 포함 |
| Direction/Decision | `readme` | ✅ 사용 가능 | README에서 추출 | README 마크다운에 포함 |
| Outcome | `status` | ✅ 사용 가능 | - | ENUM 타입 |
| References | `github_url`, `live_url`, `external_url` | ✅ 사용 가능 | - | - |

**최종 결정**: README 필드 활용
- `description`: 간단한 소개 필드
- `readme`: 모든 내러티브 정보 포함 (Initial Situation, Key Problems, Direction/Decision 등)
- 별도 데이터셋 관리 불필요
- 확장성 최고: 마크다운 형식으로 자유롭게 구조화 가능

#### 1.1.3 콘텐츠 구조 문서화

**문서 형식:**
각 프로젝트를 다음 형식으로 정리:

```markdown
## [프로젝트명]

### 기본 정보
- **Project Name**: [DB: title]
- **Time Period**: [DB: start_date] ~ [DB: end_date]
- **My Role**: [DB: role]
- **Status**: [DB: status]

### 현재 DB 콘텐츠
- **Description**: [DB: description] - 간단한 소개
- **README**: [DB: readme] - 상세 내용 (Initial Situation, Key Problems, Direction/Decision 포함)

### 리뉴얼 시 필요한 정보
- **Initial Situation**: README에서 추출
- **Key Problems**: README에서 추출
- **Direction/Decision**: README에서 추출

**최종 결정**: README 필드 활용
- 모든 내러티브 정보는 README 마크다운에 포함
- README 마크다운 파싱으로 정보 추출
- 별도 데이터셋 관리 불필요

### 기술 스택
- [DB: project_tech_stack 관계 테이블 기반]

### 참고 링크
- **GitHub**: [DB: github_url]
- **Live**: [DB: live_url]
- **External**: [DB: external_url]

### 개선 제안
- [이 프로젝트에 필요한 DB 필드 추가 제안]
```

#### 1.1.4 DB 스키마 개선 제안

**최종 결정**: README 필드 활용

**전략:**
- DB 스키마 변경 불필요
- 기존 `readme` 필드 활용
- README 마크다운에서 필요한 정보 추출
- 점진적으로 README를 구조화된 형식으로 업데이트 (필요시에만)

**장점:**
- ✅ 확장성 최고: 마크다운 형식으로 자유롭게 구조화 가능
- ✅ DB 스키마 변경 불필요
- ✅ 기존 데이터 그대로 활용 가능
- ✅ 점진적 개선 가능 (모든 프로젝트에 힘을 많이 쏟지 않아도 됨)
- ✅ 단일 소스: README 하나로 모든 내러티브 정보 관리
- ✅ 유연한 구조: 필요에 따라 섹션 추가/수정 가능

**구현 방법:**
- README 마크다운에서 특정 섹션 추출 (예: `## Initial Situation`, `## Key Problems` 등)
- README를 구조화된 형식으로 점진적으로 업데이트

**참고**: 상세 내용은 `content/db-schema-improvements.md` 참고

---

### Task 1.2: 프로필 정보 인벤토리

#### 1.2.1 DB 데이터 추출 및 분석

**조사 대상:**
- `experiences` 테이블
- `education` 테이블
- `certifications` 테이블
- `tech_stack_metadata` 테이블

**분석 항목:**
- 각 테이블의 스키마
- 실제 데이터 현황
- 테이블 간 관계

#### 1.2.2 템플릿-DB 필드 매핑

**리뉴얼 템플릿 항목:**
```text
1. 역할 이력 요약
2. 기술 스택 단순 나열
3. 협업/의사결정 관련 경험 요약
```

**매핑 테이블:**

| 템플릿 항목 | DB 테이블 | DB 필드 | 현재 상태 | 비고 |
|------------|----------|---------|----------|------|
| 역할 이력 요약 | `experiences` | `company_name`, `title`, `start_date`, `end_date` | ✅ | - |
| 주요 담당 업무 | `experiences` | `main_responsibilities` | ✅ | JSONB 배열 |
| 주요 성과 | `experiences` | `achievements` | ✅ | JSONB 배열 |
| 기술 스택 | `tech_stack_metadata` | `name`, `category`, `proficiency_level` | ✅ | - |
| 교육 이력 | `education` | `institution_name`, `degree`, `field_of_study` | ✅ | - |
| 자격증 | `certifications` | `name`, `issuing_organization`, `issue_date` | ✅ | - |

#### 1.2.3 프로필 구조 문서화

**문서 형식:**

```markdown
## 프로필 정보 인벤토리

### 역할 이력 요약
[DB: experiences 테이블 기반]

#### [회사명 1]
- **직책**: [DB: title]
- **기간**: [DB: start_date] ~ [DB: end_date]
- **주요 담당 업무**:
  - [DB: main_responsibilities]
- **주요 성과**:
  - [DB: achievements]

### 교육 이력
[DB: education 테이블 기반]
- 교육 기관, 학위, 전공
- 관련 프로젝트

### 자격증
[DB: certifications 테이블 기반]
- 자격증명, 발급 기관, 취득일

### 기술 스택
[DB: tech_stack_metadata 테이블 기반]

#### 카테고리별
- **Backend**: [...]
- **Frontend**: [...]
- **DevOps**: [...]
- **Database**: [...]

### 협업/의사결정 관련 경험
[DB: experiences.main_responsibilities, achievements 기반]

**추출 방법:**
- `main_responsibilities`와 `achievements`에서 협업 관련 키워드 검색
- 예: "팀", "협업", "조율", "의사결정", "리드" 등

### 개선 제안
- [프로필 관련 추가 필드 제안]
```

#### 1.2.4 DB 스키마 개선 제안 (필요 시)

**확장 가능한 필드 예시:**

```sql
-- 협업 스타일 추가
ALTER TABLE experiences ADD COLUMN collaboration_style TEXT;

-- 의사결정 사례 추가
CREATE TABLE decision_making_examples (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT REFERENCES experiences(id),
    situation TEXT,
    decision TEXT,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 산출물

### 필수 문서

1. **`content/projects-inventory.md`**
   - 모든 프로젝트의 DB 데이터 인벤토리
   - 템플릿 형식으로 정리
   - 누락된 정보 식별

2. **`content/profile-inventory.md`**
   - 프로필 데이터 인벤토리
   - 역할 이력, 기술 스택, 협업 경험 정리

3. **`content/db-schema-improvements.md`** (필요 시)
   - DB 스키마 개선 제안
   - 새로운 필드 또는 테이블 제안
   - 마이그레이션 전략

### 문서 구조

```
docs/epic/portfolio-renewal-refactor/
├── phase-1-design.md          # 이 문서
├── phase-1-checklist.md       # 작업 체크리스트
├── phase-1-completion.md      # 완료 보고서 (작업 완료 시)
└── content/
    ├── projects-inventory.md
    ├── profile-inventory.md
    └── db-schema-improvements.md (필요 시)
```

---

## ✅ 완료 기준 (Definition of Done)

### 필수 조건

- [ ] 모든 프로젝트가 인벤토리에 포함됨
- [ ] 리뉴얼 템플릿과 DB 필드 매핑이 명확함
- [ ] 누락된 정보가 식별되고 개선 방안이 제시됨
- [ ] DB 데이터와 인벤토리 문서가 일치함
- [ ] Phase 2 작업 시작 가능한 상태

### 품질 기준

- [ ] DB 스키마 개선 제안이 구체적임 (필요 시)
- [ ] 각 프로젝트의 현재 상태와 리뉴얼 시 필요한 정보가 구분됨
- [ ] 프로필 데이터가 체계적으로 정리됨

---

## 💡 작업 시 주의사항

### ✅ 권장 사항

1. **DB를 단일 소스로 유지**
   - 마크다운 파일은 인벤토리 목적만
   - 실제 운영은 DB 사용

2. **실제 데이터 확인**
   - 프로덕션 DB의 실제 데이터 기반으로 작업
   - Admin UI 또는 직접 쿼리 활용

3. **템플릿과 매핑 명확히**
   - 어떤 DB 필드가 어떤 템플릿 항목에 해당하는지 명시
   - 부족한 부분 구체적으로 식별

4. **개선 제안 구체적으로**
   - DB 스키마 확장이 필요한 경우 구체적인 필드명과 타입 제안
   - 마이그레이션 전략 고려

### ⚠️ 주의사항

1. **기존 필드 최대한 활용**
   - 새 필드 추가 전에 기존 필드로 해결 가능한지 확인
   - `description`, `detailed_description`, `readme` 등 활용

2. **데이터 마이그레이션 고려**
   - 새 필드 추가 시 기존 데이터 처리 방법
   - 기본값 또는 NULL 허용 여부

3. **일관성 유지**
   - DB 스키마 변경은 Phase 2-4 설계 후 진행
   - Phase 1은 분석 및 제안에 집중

---

## 🔗 관련 문서

- [Epic README](./README.md)
- [Phase 1 체크리스트](./phase-1-checklist.md)
- [Phase 2 설계 문서](./phase-2-design.md) ← 다음 단계

---

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
**버전**: 2.0 (README 필드 활용 최종 결정)
