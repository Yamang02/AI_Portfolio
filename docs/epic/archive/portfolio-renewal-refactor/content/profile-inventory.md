# 프로필 정보 인벤토리

> **목적**: DB에 저장된 프로필 데이터를 리뉴얼 템플릿 형식으로 정리하고, 누락된 정보를 식별

> **작성일**: 2025-01-04  
> **데이터 소스**: `experiences`, `education`, `certifications`, `tech_stack_metadata` 테이블 (PostgreSQL)

---

## 📋 템플릿-DB 필드 매핑 테이블

### 리뉴얼 템플릿 항목

리뉴얼 시 필요한 프로필 정보 구조:

```text
1. 역할 이력 요약
2. 기술 스택 단순 나열
3. 협업/의사결정 관련 경험 요약
```

### 매핑 테이블

| 템플릿 항목 | DB 테이블 | DB 필드 | 현재 상태 | 비고 |
|------------|----------|---------|----------|------|
| **역할 이력 요약** | `experiences` | `organization`, `title`, `role`, `start_date`, `end_date` | ✅ | 회사명, 직책, 역할, 기간 |
| **주요 담당 업무** | `experiences` | `main_responsibilities` | ✅ | JSONB 배열 (TEXT[]) |
| **주요 성과** | `experiences` | `achievements` | ✅ | JSONB 배열 (TEXT[]) |
| **기술 스택** | `tech_stack_metadata` | `name`, `category`, `level`, `is_core` | ✅ | 기술명, 카테고리, 레벨, 핵심 여부 |
| **교육 이력** | `education` | `organization`, `title`, `degree`, `major`, `start_date`, `end_date` | ✅ | 교육 기관, 과정명, 학위, 전공 |
| **자격증** | `certifications` | `name`, `issuer`, `date` | ✅ | 자격증명, 발급 기관, 취득일 |
| **협업/의사결정 경험** | `experiences` | `main_responsibilities`, `achievements` | ⚠️ | 추출 필요 (키워드 검색) |

### 추가 활용 가능한 필드

#### Experiences 테이블
| DB 필드 | 용도 | 비고 |
|---------|------|------|
| `description` | 경력 설명 | 전체적인 경력 맥락 |
| `job_field` | 직무 분야 | 개발, 교육, 디자인 등 |
| `employment_type` | 고용 형태 | 정규직, 계약직, 프리랜서 등 |
| `projects` | TEXT[] 배열 | 관련 프로젝트 목록 (레거시) |

#### Education 테이블
| DB 필드 | 용도 | 비고 |
|---------|------|------|
| `description` | 교육 설명 | 교육 과정 설명 |
| `gpa` | 학점 | DECIMAL(3,2) |
| `type` | 교육 타입 | EducationType enum |
| `projects` | TEXT[] 배열 | 관련 프로젝트 목록 (레거시) |

#### Certifications 테이블
| DB 필드 | 용도 | 비고 |
|---------|------|------|
| `expiry_date` | 만료일 | NULL이면 만료 없음 |
| `credential_id` | 자격증 번호 | 자격증 ID |
| `credential_url` | 확인 URL | 자격증 확인 링크 |
| `description` | 자격증 설명 | 상세 설명 |
| `category` | 카테고리 | IT, Language, Project Management 등 |

#### Tech Stack Metadata 테이블
| DB 필드 | 용도 | 비고 |
|---------|------|------|
| `display_name` | 표시명 | 화면에 표시될 이름 |
| `icon_url` | 아이콘 URL | 기술 아이콘 |
| `color_hex` | 색상 코드 | 배지 색상 (#RRGGBB) |
| `description` | 기술 설명 | 기술에 대한 설명 |
| `is_active` | 활성화 여부 | BOOLEAN |

### 관계 테이블

#### experience_tech_stack
- 경력별 기술 스택 매핑
- `tech_stack_metadata`와 조인하여 기술 정보 조회
- `is_primary`: 주요 기술 여부
- `usage_description`: 사용 목적 설명

#### education_tech_stack
- 교육별 기술 스택 매핑
- `tech_stack_metadata`와 조인하여 기술 정보 조회
- `is_primary`: 주요 기술 여부
- `usage_description`: 사용 목적 설명

---

## 📊 프로필 정보 인벤토리

### 역할 이력 요약

> **참고**: 아래는 템플릿 형식입니다. 실제 DB 데이터를 조회하여 작성해야 합니다.

#### 템플릿 형식

```markdown
## 역할 이력 요약

### [회사명/조직명]

- **Business ID**: [DB: business_id]
- **직책**: [DB: title]
- **역할**: [DB: role]
- **기간**: [DB: start_date] ~ [DB: end_date] (또는 현재 재직중)
- **직무 분야**: [DB: job_field]
- **고용 형태**: [DB: employment_type]

#### 주요 담당 업무
[DB: main_responsibilities 배열]
- [항목 1]
- [항목 2]
- [항목 3]

#### 주요 성과
[DB: achievements 배열]
- [성과 1]
- [성과 2]
- [성과 3]

#### 기술 스택
[DB: experience_tech_stack 관계 테이블 기반]
- **Backend**: [...]
- **Frontend**: [...]
- **Database**: [...]
- **기타**: [...]

#### 설명
[DB: description]
```

---

### 교육 이력

#### 템플릿 형식

```markdown
## 교육 이력

### [교육 기관명]

- **Business ID**: [DB: business_id]
- **과정명**: [DB: title]
- **교육 기관**: [DB: organization]
- **학위**: [DB: degree]
- **전공**: [DB: major]
- **기간**: [DB: start_date] ~ [DB: end_date]
- **학점**: [DB: gpa] / 4.0
- **타입**: [DB: type]

#### 설명
[DB: description]

#### 기술 스택
[DB: education_tech_stack 관계 테이블 기반]
- [기술 목록]

#### 관련 프로젝트
[DB: projects 배열]
```

---

### 자격증

#### 템플릿 형식

```markdown
## 자격증

### [자격증명]

- **Business ID**: [DB: business_id]
- **자격증명**: [DB: name]
- **발급 기관**: [DB: issuer]
- **취득일**: [DB: date]
- **만료일**: [DB: expiry_date] (또는 만료 없음)
- **자격증 번호**: [DB: credential_id]
- **확인 URL**: [DB: credential_url]
- **카테고리**: [DB: category]

#### 설명
[DB: description]
```

---

### 기술 스택

#### 템플릿 형식

```markdown
## 기술 스택

### 카테고리별 분류

#### Backend
[DB: tech_stack_metadata WHERE category = 'backend' AND is_active = true]
- **[기술명]** (레벨: [level], 핵심: [is_core])

#### Frontend
[DB: tech_stack_metadata WHERE category = 'frontend' AND is_active = true]
- **[기술명]** (레벨: [level], 핵심: [is_core])

#### Database
[DB: tech_stack_metadata WHERE category = 'database' AND is_active = true]
- **[기술명]** (레벨: [level], 핵심: [is_core])

#### DevOps
[DB: tech_stack_metadata WHERE category = 'devops' AND is_active = true]
- **[기술명]** (레벨: [level], 핵심: [is_core])

#### 기타
[DB: tech_stack_metadata WHERE category NOT IN ('backend', 'frontend', 'database', 'devops') AND is_active = true]
- **[기술명]** (레벨: [level], 핵심: [is_core])
```

---

### 협업/의사결정 관련 경험

#### 추출 방법

`experiences` 테이블의 `main_responsibilities`와 `achievements` 배열에서 다음 키워드를 검색:

- **협업 관련**: "팀", "협업", "조율", "리드", "멘토링", "코드 리뷰", "페어 프로그래밍"
- **의사결정 관련**: "의사결정", "아키텍처", "기술 선택", "설계", "기획", "제안"
- **소통 관련**: "커뮤니케이션", "문서화", "프레젠테이션", "회의"

#### 템플릿 형식

```markdown
## 협업/의사결정 관련 경험

### [회사명/조직명]

#### 협업 경험
- [main_responsibilities 또는 achievements에서 추출한 협업 관련 항목]

#### 의사결정 경험
- [main_responsibilities 또는 achievements에서 추출한 의사결정 관련 항목]

#### 소통 경험
- [main_responsibilities 또는 achievements에서 추출한 소통 관련 항목]
```

---

## 🔍 DB 데이터 현황 분석

### 필드별 데이터 현황

> **참고**: 실제 DB 데이터를 조회하여 작성해야 합니다.

#### Experiences 테이블

##### 필수 필드 (NOT NULL)
- `business_id`: ✅ 모든 경력에 존재
- `title`: ✅ 모든 경력에 존재
- `organization`: ✅ 모든 경력에 존재
- `role`: ✅ 모든 경력에 존재
- `start_date`: ✅ 모든 경력에 존재

##### 선택 필드 (NULL 허용)
- `description`: ⚠️ 일부 경력에만 존재
- `end_date`: ⚠️ 현재 재직중인 경우 NULL
- `job_field`: ⚠️ 일부 경력에만 존재
- `employment_type`: ⚠️ 일부 경력에만 존재
- `main_responsibilities`: ⚠️ 일부 경력에만 존재
- `achievements`: ⚠️ 일부 경력에만 존재

#### Education 테이블

##### 필수 필드 (NOT NULL)
- `business_id`: ✅ 모든 교육에 존재
- `title`: ✅ 모든 교육에 존재
- `organization`: ✅ 모든 교육에 존재

##### 선택 필드 (NULL 허용)
- `description`: ⚠️ 일부 교육에만 존재
- `degree`: ⚠️ 일부 교육에만 존재
- `major`: ⚠️ 일부 교육에만 존재
- `start_date`: ⚠️ 일부 교육에만 존재
- `end_date`: ⚠️ 일부 교육에만 존재
- `gpa`: ⚠️ 일부 교육에만 존재

#### Certifications 테이블

##### 필수 필드 (NOT NULL)
- `business_id`: ✅ 모든 자격증에 존재
- `name`: ✅ 모든 자격증에 존재
- `issuer`: ✅ 모든 자격증에 존재

##### 선택 필드 (NULL 허용)
- `date`: ⚠️ 일부 자격증에만 존재
- `expiry_date`: ⚠️ 만료 없는 자격증은 NULL
- `credential_id`: ⚠️ 일부 자격증에만 존재
- `credential_url`: ⚠️ 일부 자격증에만 존재
- `description`: ⚠️ 일부 자격증에만 존재
- `category`: ⚠️ 일부 자격증에만 존재

#### Tech Stack Metadata 테이블

##### 필수 필드 (NOT NULL)
- `name`: ✅ 모든 기술에 존재
- `display_name`: ✅ 모든 기술에 존재
- `category`: ✅ 모든 기술에 존재
- `level`: ✅ 모든 기술에 존재

##### 선택 필드 (NULL 허용)
- `icon_url`: ⚠️ 일부 기술에만 존재
- `color_hex`: ⚠️ 일부 기술에만 존재
- `description`: ⚠️ 일부 기술에만 존재

---

## 💡 개선 제안

### 1. 협업 스타일 필드 추가

**제안**: 경력별 협업 스타일을 명시적으로 저장

```sql
ALTER TABLE experiences ADD COLUMN collaboration_style TEXT;
```

**이유**: 
- 리뉴얼 템플릿의 "협업/의사결정 관련 경험" 항목에 직접 매핑
- `main_responsibilities`에서 추출하기 어려운 경우가 많음

**예시 값**:
- "팀 리더십", "크로스 펑셔널 협업", "원격 협업", "오픈소스 기여" 등

### 2. 의사결정 사례 테이블 추가

**제안**: 의사결정 사례를 별도 테이블로 관리

```sql
CREATE TABLE decision_making_examples (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT REFERENCES experiences(id) ON DELETE CASCADE,
    situation TEXT NOT NULL,
    decision TEXT NOT NULL,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**이유**:
- 리뉴얼 템플릿의 "협업/의사결정 관련 경험" 항목에 직접 매핑
- 구체적인 사례를 구조화하여 저장

**장점**:
- 경력별로 여러 의사결정 사례 저장 가능
- 상황-결정-결과 구조로 명확하게 정리

### 3. 프로젝트-경력 연결 강화

**제안**: `experiences.projects` 배열 대신 관계 테이블 사용

```sql
-- 이미 존재할 수 있음 (experience_projects 테이블)
CREATE TABLE IF NOT EXISTS experience_projects (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_in_project TEXT,
    contribution_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, project_id)
);
```

**이유**:
- 경력과 프로젝트 간의 관계를 명확히 관리
- 프로젝트에서의 역할과 기여 내용을 구조화

### 4. 교육-프로젝트 연결 강화

**제안**: `education.projects` 배열 대신 관계 테이블 사용

```sql
-- 이미 존재할 수 있음 (education_projects 테이블)
CREATE TABLE IF NOT EXISTS education_projects (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES education(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_in_project TEXT,
    contribution_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, project_id)
);
```

**이유**:
- 교육과 프로젝트 간의 관계를 명확히 관리
- 교육 과정에서 진행한 프로젝트를 구조화

---

## 📝 다음 단계

1. **실제 DB 데이터 조회**
   - Admin UI 또는 직접 쿼리를 통해 프로필 데이터 조회
   - 각 항목별로 위 템플릿 형식으로 작성

2. **협업/의사결정 경험 추출**
   - `main_responsibilities`와 `achievements`에서 키워드 검색
   - 추출된 내용을 구조화하여 정리

3. **DB 스키마 개선 결정**
   - 위 개선 제안 중 선택
   - 마이그레이션 전략 수립

---

**작성일**: 2025-01-04  
**작성자**: AI Agent (Claude)  
**버전**: 1.0
