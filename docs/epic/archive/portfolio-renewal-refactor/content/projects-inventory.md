# 프로젝트 콘텐츠 인벤토리

> **목적**: DB에 저장된 프로젝트 데이터를 리뉴얼 템플릿 형식으로 정리하고, 누락된 정보를 식별

> **작성일**: 2025-01-04  
> **데이터 소스**: `projects` 테이블 (PostgreSQL)

---

## 📋 템플릿-DB 필드 매핑 테이블

### 리뉴얼 템플릿 항목

리뉴얼 시 필요한 프로젝트 정보 구조:

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

### 매핑 테이블

| 템플릿 항목 | DB 필드 | 현재 상태 | 개선 필요 여부 | 비고 |
|------------|---------|----------|---------------|------|
| **Project Name** | `title` | ✅ 사용 가능 | - | 프로젝트 제목 |
| **Time Period** | `start_date`, `end_date` | ✅ 사용 가능 | - | 시작일/종료일 |
| **My Role** | `role` | ✅ 사용 가능 | - | 팀 프로젝트에서의 역할 |
| **Initial Situation** | `readme` | ✅ 사용 가능 | README에서 추출 | README 마크다운에 포함 |
| **Key Problems** | `readme` | ✅ 사용 가능 | README에서 추출 | README 마크다운에 포함 |
| **Direction/Decision** | `readme` | ✅ 사용 가능 | README에서 추출 | README 마크다운에 포함 |
| **Outcome** | `status` | ✅ 사용 가능 | - | ENUM 타입 (completed, in_progress, maintenance 등) |
| **References** | `github_url`, `live_url`, `external_url` | ✅ 사용 가능 | - | 외부 링크 |

### 추가 활용 가능한 필드

| DB 필드 | 용도 | 비고 |
|---------|------|------|
| `description` | 프로젝트 간단 소개 | 간단한 한 줄 소개 |
| `readme` | README 마크다운 | 상세 내용 (Initial Situation, Key Problems, Direction/Decision 포함) |
| `my_contributions` | TEXT[] 배열 | 내 기여 내용 (팀 프로젝트) |
| `is_team` | BOOLEAN | 팀/개인 프로젝트 구분 |
| `team_size` | INTEGER | 팀 크기 |
| `type` | VARCHAR(100) | 프로젝트 타입 |
| `source` | VARCHAR(100) | 소스 (github, local, certification) |
| `image_url` | VARCHAR(500) | 대표 이미지 |
| `screenshots` | TEXT[] | 스크린샷 배열 (레거시) |

### 기술 스택 정보

| 정보 | DB 테이블/필드 | 비고 |
|------|---------------|------|
| 기술 스택 목록 | `project_tech_stack` (관계 테이블) | `tech_stack_metadata`와 조인 |
| 기술 카테고리 | `tech_stack_metadata.category` | Backend, Frontend, Database 등 |
| 기술 레벨 | `tech_stack_metadata.level` | expert, intermediate, beginner |
| 핵심 기술 여부 | `tech_stack_metadata.is_core` | BOOLEAN |
| 사용 설명 | `project_tech_stack.usage_description` | 프로젝트에서의 사용 목적 |

### 스크린샷 정보

| 정보 | DB 테이블/필드 | 비고 |
|------|---------------|------|
| 스크린샷 목록 | `project_screenshots` (관계 테이블) | 별도 테이블로 관리 |
| 표시 순서 | `project_screenshots.display_order` | 정렬 순서 |
| 스크린샷 URL | `project_screenshots.image_url` | 이미지 URL |

---

## 📊 프로젝트별 인벤토리

> **참고**: 아래는 템플릿 형식입니다. 실제 DB 데이터를 조회하여 각 프로젝트별로 작성해야 합니다.

### 템플릿 형식

```markdown
## [프로젝트명]

### 기본 정보
- **Project Name**: [DB: title]
- **Business ID**: [DB: business_id]
- **Time Period**: [DB: start_date] ~ [DB: end_date]
- **My Role**: [DB: role]
- **Status**: [DB: status]
- **Type**: [DB: type]
- **Source**: [DB: source]
- **Is Team**: [DB: is_team]
- **Team Size**: [DB: team_size]

### 현재 DB 콘텐츠
- **Description**: [DB: description] - 간단한 소개
- **README**: [DB: readme] - 상세 내용 (Initial Situation, Key Problems, Direction/Decision 포함)
- **My Contributions**: [DB: my_contributions 배열]

### 리뉴얼 시 필요한 정보

#### Initial Situation (프로젝트 시작 배경)
- **추출 방법**: README 마크다운에서 추출
- **현재 상태**: [README에 해당 섹션이 있는지 확인]
- **개선 방안**: 필요시 README에 구조화된 섹션 추가 (점진적 개선)

#### Key Problems (주요 문제점)
- **추출 방법**: README 마크다운에서 추출
- **현재 상태**: [README에 해당 섹션이 있는지 확인]
- **개선 방안**: 필요시 README에 구조화된 섹션 추가 (점진적 개선)

#### Direction/Decision (방향성/결정 사항)
- **추출 방법**: README 마크다운에서 추출
- **현재 상태**: [README에 해당 섹션이 있는지 확인]
- **개선 방안**: 필요시 README에 구조화된 섹션 추가 (점진적 개선)

#### Outcome (결과)
- **Status**: [DB: status]
- **추가 정보 필요 여부**: [결과에 대한 상세 설명이 필요한지]

### 기술 스택
- [DB: project_tech_stack 관계 테이블 기반]
  - **Backend**: [...]
  - **Frontend**: [...]
  - **Database**: [...]
  - **기타**: [...]

### 스크린샷
- [DB: project_screenshots 관계 테이블 기반]
  - 총 [N]개 스크린샷

### 참고 링크
- **GitHub**: [DB: github_url]
- **Live**: [DB: live_url]
- **External**: [DB: external_url]
- **Image**: [DB: image_url]

### 개선 제안
- [이 프로젝트에 필요한 DB 필드 추가 제안]
- [콘텐츠 보완이 필요한 부분]
```

---

## 🔍 DB 데이터 현황 분석

### 필드별 데이터 현황

> **참고**: 실제 DB 데이터를 조회하여 작성해야 합니다.

#### 필수 필드 (NOT NULL)
- `business_id`: ✅ 모든 프로젝트에 존재
- `title`: ✅ 모든 프로젝트에 존재
- `description`: ✅ 모든 프로젝트에 존재

#### 선택 필드 (NULL 허용)
- `readme`: ✅ 모든 프로젝트에 존재 (11/11) - 100%
- `start_date`: ⚠️ 일부 프로젝트에만 존재
- `end_date`: ⚠️ 일부 프로젝트에만 존재
- `role`: ⚠️ 팀 프로젝트에만 존재
- `github_url`: ⚠️ 일부 프로젝트에만 존재
- `live_url`: ⚠️ 일부 프로젝트에만 존재

#### 배열 필드
- `my_contributions`: ⚠️ 팀 프로젝트에만 존재
- `screenshots`: ⚠️ 레거시 필드 (새로운 project_screenshots 테이블 사용 권장)

### 관계 테이블 현황

#### project_tech_stack
- 프로젝트별 기술 스택 매핑
- `tech_stack_metadata`와 조인하여 기술 정보 조회

#### project_screenshots
- 프로젝트별 스크린샷 관리
- `display_order`로 정렬 순서 관리

---

## 💡 개선 제안

### 1. README 필드 활용 (최종 결정 - 권장)

**전략**: 기존 `readme` 필드를 활용하여 프로젝트 내러티브 정보 저장

**현재 구조**:
- `description`: 간단한 소개 필드
- `readme`: 상세 내용 (Initial Situation, Key Problems, Direction/Decision 등 포함)

**접근 방법**:
1. **리뉴얼 시 README 파싱**: README 마크다운에서 필요한 정보 추출
2. **점진적 구조화**: 필요시에만 README를 구조화된 형식으로 업데이트
3. **DB 스키마 변경 없음**: 기존 필드만 활용
4. **별도 데이터셋 관리 불필요**: README에 모든 내러티브 정보 포함

**장점**:
- ✅ **확장성 최고**: 마크다운 형식으로 자유롭게 구조화 가능
- ✅ DB 스키마 변경 불필요
- ✅ 기존 데이터 그대로 활용 가능
- ✅ 점진적 개선 가능 (모든 프로젝트에 힘을 많이 쏟지 않아도 됨)
- ✅ 마이그레이션 작업 최소화
- ✅ 단일 소스: README 하나로 모든 내러티브 정보 관리
- ✅ 유연한 구조: 필요에 따라 섹션 추가/수정 가능

**구현 방법**:
- README 마크다운에서 특정 섹션 추출 (예: `## Initial Situation`, `## Key Problems` 등)
- 또는 README를 구조화된 형식으로 점진적으로 업데이트

### 2. 별도 필드/테이블 추가 (비권장)

> **참고**: README 필드 활용이 더 확장성이 좋으므로 비권장합니다.

**이유**:
- 별도 필드/테이블로 관리하면 확장성이 제한됨
- README 마크다운이 더 유연하고 자유롭게 구조화 가능
- DB 스키마 변경이 필요함
- README 하나로 모든 내러티브 정보를 관리하는 것이 더 단순하고 확장성 좋음

**제안**: 프로젝트 내러티브를 별도 테이블로 관리

```sql
CREATE TABLE project_narratives (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    initial_situation TEXT,
    key_problems JSONB,
    decision_made TEXT,
    outcome_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**장점**:
- 프로젝트 기본 정보와 내러티브 정보 분리
- 확장성 좋음
- 기존 테이블 구조 변경 최소화

**단점**:
- 조인 쿼리 필요
- 복잡도 증가

---

## 📝 다음 단계

1. **실제 DB 데이터 조회** ✅ 완료
   - Railway PostgreSQL에서 프로젝트 데이터 조회 완료
   - 각 프로젝트별로 실제 데이터 기반 인벤토리 작성 (참고: `projects-inventory-actual.md`)

2. **README 내용 분석**
   - 각 프로젝트의 README에서 Initial Situation, Key Problems, Direction/Decision 정보 추출
   - README 마크다운 파싱 로직 개발 또는 수동 추출

3. **점진적 개선**
   - 필요시에만 README를 구조화된 형식으로 업데이트
   - 모든 프로젝트에 힘을 많이 쏟지 않고, 우선순위가 높은 프로젝트부터 개선

4. **프로젝트 상세페이지 설계**
   - **최신 정보만 표시**하는 것에 집중
   - 프로젝트 히스토리/변경 이력은 고려하지 않음
   - 기술블로그는 별도로 관리될 예정 (프로젝트 ID 매핑 가능)

5. **DB 스키마 개선 결정** (선택사항)
   - 기존 README 필드 활용이 어려운 경우에만 고려
   - 위 개선 제안 중 선택

---

**작성일**: 2025-01-04  
**작성자**: AI Agent (Claude)  
**버전**: 1.0
