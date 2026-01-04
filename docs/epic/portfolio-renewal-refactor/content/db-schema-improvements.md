# DB 스키마 개선 제안

> **목적**: 리뉴얼 템플릿에 필요한 정보를 DB에 구조화하여 저장하기 위한 스키마 개선 제안

> **작성일**: 2025-01-04  
> **관련 문서**: 
> - [프로젝트 콘텐츠 인벤토리](./projects-inventory.md)
> - [프로필 정보 인벤토리](./profile-inventory.md)

---

## 📋 개요

### 개선 목적

리뉴얼 템플릿에 필요한 다음 정보를 DB에 구조화하여 저장:

1. **프로젝트 내러티브**: Initial Situation, Key Problems, Direction/Decision, Outcome
2. **협업/의사결정 경험**: 경력별 협업 스타일 및 의사결정 사례

### 개선 전략 (수정됨)

- **기존 필드 최대한 활용**: `description` (간단한 소개), `readme` (상세 내용 포함)
- **점진적 개선**: 모든 프로젝트에 힘을 많이 쏟지 않고, 필요시에만 README를 구조화된 형식으로 업데이트
- **DB 스키마 변경 최소화**: 기존 구조를 활용하여 리뉴얼 시 README에서 정보 추출/파싱
- **필요 시에만 새 필드 추가**: 기존 필드로 해결 불가능한 경우에만 고려

### 중요 방향성

- **프로젝트 상세페이지는 최신 정보만 표시**: 항상 현재 상태의 정보를 보여주는 것에 집중
- **프로젝트 히스토리/변경 이력은 고려하지 않음**: 나중에 기술블로그 형식의 페이지로 분리 예정
- **기술블로그는 별도 관리**: 필요시 프로젝트 ID를 매핑한 테이블로 관리 가능
- **현재는 프로젝트 상세페이지에 집중**: 최신 정보를 효과적으로 표시하는 것에 우선순위

---

## 🎯 프로젝트 관련 개선 제안

### 제안 0: README 필드 활용 (최종 결정 - 권장)

**목적**: 기존 `readme` 필드를 활용하여 프로젝트 내러티브 정보를 저장

**현재 구조**:
- `description`: 간단한 소개 필드
- `readme`: 상세 내용 (Initial Situation, Key Problems, Direction/Decision 등 포함)

**전략**:
1. **리뉴얼 시 README 파싱**: README 마크다운에서 필요한 정보 추출
2. **점진적 구조화**: 필요시에만 README를 구조화된 형식으로 업데이트
3. **DB 스키마 변경 없음**: 기존 필드만 활용
4. **별도 데이터셋 관리 불필요**: README에 모든 내러티브 정보 포함

**장점**:
- ✅ **확장성 최고**: 마크다운 형식으로 자유롭게 구조화 가능
- ✅ **DB 스키마 변경 불필요**: 기존 필드만 활용
- ✅ **기존 데이터 그대로 활용 가능**: 마이그레이션 작업 최소화
- ✅ **점진적 개선 가능**: 모든 프로젝트에 힘을 많이 쏟지 않아도 됨
- ✅ **유연한 구조**: 필요에 따라 섹션 추가/수정 가능
- ✅ **단일 소스**: README 하나로 모든 내러티브 정보 관리

**단점**:
- README 파싱 로직 필요 (하지만 마크다운 파싱은 표준적이고 쉬움)
- 구조화되지 않은 README는 추출이 어려울 수 있음 (점진적으로 구조화 가능)

**구현 방법**:
- README 마크다운에서 특정 섹션 추출 (예: `## Initial Situation`, `## Key Problems` 등)
- README를 구조화된 형식으로 점진적으로 업데이트
- 마크다운의 유연성을 활용하여 필요시 새로운 섹션 추가 가능

**결론**: README 필드 활용이 가장 확장성이 좋고 실용적인 방법입니다.

---

### 제안 1: 프로젝트 내러티브 필드 추가 (비권장)

> **참고**: 제안 0 (README 필드 활용)이 더 확장성이 좋으므로 비권장합니다.

**이유**:
- 별도 필드로 관리하면 확장성이 제한됨
- README 마크다운이 더 유연하고 자유롭게 구조화 가능
- DB 스키마 변경이 필요함

**목적**: 리뉴얼 템플릿의 "Initial Situation", "Key Problems", "Direction/Decision", "Outcome" 항목에 직접 매핑

**SQL**:
```sql
-- 프로젝트 내러티브 필드 추가
ALTER TABLE projects ADD COLUMN initial_situation TEXT;
ALTER TABLE projects ADD COLUMN key_problems TEXT[]; -- 배열 형태로 저장
ALTER TABLE projects ADD COLUMN decision_made TEXT;
ALTER TABLE projects ADD COLUMN outcome_summary TEXT;
```

**장점**:
- 간단하고 직관적
- 기존 테이블에 필드만 추가
- 조인 쿼리 불필요

**단점**:
- `projects` 테이블이 더 커짐
- 확장성 제한 (추가 정보 저장 어려움)

**마이그레이션 전략**:
1. 새 필드 추가 (NULL 허용)
2. 기존 `description`, `detailed_description`, `readme`에서 데이터 추출하여 채우기
3. 수동으로 보완 필요

---

### 제안 2: 프로젝트 내러티브 별도 테이블 (비권장)

> **참고**: 제안 0 (README 필드 활용)이 더 확장성이 좋으므로 비권장합니다.

**이유**:
- 별도 테이블로 관리하면 조인 쿼리 필요 및 복잡도 증가
- README 마크다운이 더 유연하고 자유롭게 구조화 가능
- DB 스키마 변경이 필요함
- README 하나로 모든 내러티브 정보를 관리하는 것이 더 단순하고 확장성 좋음

---

### 제안 3: 하이브리드 접근 (비권장)

> **참고**: 제안 0 (README 필드 활용)이 더 확장성이 좋으므로 비권장합니다.

**이유**:
- 별도 필드/테이블로 관리하면 확장성이 제한됨
- README 마크다운이 더 유연하고 자유롭게 구조화 가능
- DB 스키마 변경이 필요함

---

## 👤 프로필 관련 개선 제안

### 제안 1: 협업 스타일 필드 추가

**목적**: 경력별 협업 스타일을 명시적으로 저장

**SQL**:
```sql
ALTER TABLE experiences ADD COLUMN collaboration_style TEXT;
```

**예시 값**:
- "팀 리더십", "크로스 펑셔널 협업", "원격 협업", "오픈소스 기여", "멘토링" 등

**마이그레이션 전략**:
1. 새 필드 추가 (NULL 허용)
2. `main_responsibilities`와 `achievements`에서 키워드 검색하여 추출
3. 수동으로 보완 필요

---

### 제안 2: 의사결정 사례 테이블 추가

**목적**: 의사결정 사례를 구조화하여 저장

**SQL**:
```sql
CREATE TABLE decision_making_examples (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    situation TEXT NOT NULL, -- 상황 설명
    decision TEXT NOT NULL, -- 결정 사항
    rationale TEXT, -- 결정 근거
    outcome TEXT, -- 결과
    impact TEXT, -- 영향도
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_decision_making_examples_experience_id ON decision_making_examples(experience_id);
```

**장점**:
- 경력별로 여러 의사결정 사례 저장 가능
- 상황-결정-결과 구조로 명확하게 정리
- 리뉴얼 템플릿에 직접 활용 가능

**마이그레이션 전략**:
1. 새 테이블 생성
2. `main_responsibilities`와 `achievements`에서 의사결정 관련 내용 추출
3. 수동으로 구조화하여 입력

---

### 제안 3: 프로젝트-경력 연결 강화

**목적**: 경력과 프로젝트 간의 관계를 명확히 관리

**SQL**:
```sql
-- 기존 experiences.projects 배열 대신 관계 테이블 사용
CREATE TABLE IF NOT EXISTS experience_projects (
    id BIGSERIAL PRIMARY KEY,
    experience_id BIGINT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_in_project TEXT, -- 프로젝트에서의 역할
    contribution_summary TEXT, -- 기여 내용 요약
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, project_id)
);

-- 인덱스 생성
CREATE INDEX idx_experience_projects_experience_id ON experience_projects(experience_id);
CREATE INDEX idx_experience_projects_project_id ON experience_projects(project_id);
```

**마이그레이션 전략**:
1. 새 테이블 생성
2. 기존 `experiences.projects` 배열 데이터를 관계 테이블로 마이그레이션
3. `role_in_project`와 `contribution_summary`는 수동으로 입력

---

### 제안 4: 교육-프로젝트 연결 강화

**목적**: 교육과 프로젝트 간의 관계를 명확히 관리

**SQL**:
```sql
-- 기존 education.projects 배열 대신 관계 테이블 사용
CREATE TABLE IF NOT EXISTS education_projects (
    id BIGSERIAL PRIMARY KEY,
    education_id BIGINT NOT NULL REFERENCES education(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role_in_project TEXT, -- 프로젝트에서의 역할
    contribution_summary TEXT, -- 기여 내용 요약
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_id, project_id)
);

-- 인덱스 생성
CREATE INDEX idx_education_projects_education_id ON education_projects(education_id);
CREATE INDEX idx_education_projects_project_id ON education_projects(project_id);
```

**마이그레이션 전략**:
1. 새 테이블 생성
2. 기존 `education.projects` 배열 데이터를 관계 테이블로 마이그레이션
3. `role_in_project`와 `contribution_summary`는 수동으로 입력

---

## 📊 개선 제안 요약

### 프로젝트 관련

| 제안 | 방법 | 우선순위 | 복잡도 | 확장성 | 실용성 |
|------|------|---------|--------|--------|--------|
| 제안 0 | **README 필드 활용** | **✅ 최종 결정** | 낮음 | **최고** | 높음 |
| 제안 1 | `projects` 테이블에 필드 추가 | ❌ 비권장 | 낮음 | 낮음 | 중 |
| 제안 2 | 별도 `project_narratives` 테이블 | ❌ 비권장 | 중 | 중 | 중 |
| 제안 3 | 하이브리드 접근 | ❌ 비권장 | 중 | 중 | 중 |

**최종 결정**: 제안 0 (README 필드 활용)
- ✅ **확장성 최고**: 마크다운 형식으로 자유롭게 구조화 가능
- ✅ DB 스키마 변경 없음
- ✅ 기존 데이터 그대로 활용
- ✅ 점진적 개선 가능
- ✅ 모든 프로젝트에 힘을 많이 쏟지 않아도 됨
- ✅ 단일 소스: README 하나로 모든 내러티브 정보 관리
- ✅ 유연한 구조: 필요에 따라 섹션 추가/수정 가능

---

### 프로필 관련

| 제안 | 방법 | 우선순위 | 복잡도 | 확장성 |
|------|------|---------|--------|--------|
| 제안 1 | `experiences` 테이블에 필드 추가 | 중 | 낮음 | 낮음 |
| 제안 2 | 별도 `decision_making_examples` 테이블 | 높음 | 중 | 높음 |
| 제안 3 | `experience_projects` 관계 테이블 | 중 | 중 | 높음 |
| 제안 4 | `education_projects` 관계 테이블 | 낮음 | 중 | 높음 |

**권장**: 제안 1 + 제안 2 (협업 스타일 필드 + 의사결정 사례 테이블)

---

## 🚀 구현 계획 (최종 결정)

### Phase 1: README 필드 활용 (현재 Phase)

1. **프로젝트 내러티브**
   - **제안 0 (README 필드 활용) 최종 결정** ✅
   - DB 스키마 변경 없음
   - 기존 `readme` 필드 활용
   - README 마크다운에서 정보 추출
   - 별도 데이터셋 관리 불필요

2. **프로필 정보**
   - 기존 `main_responsibilities`, `achievements` 필드 활용
   - 협업/의사결정 경험 추출 (키워드 검색)
   - 필요시에만 `collaboration_style` 필드 추가 고려

### Phase 2: README 분석 및 추출

1. **README 내용 분석**
   - 각 프로젝트의 README에서 Initial Situation, Key Problems, Direction/Decision 정보 추출
   - README 마크다운 파싱 로직 개발 또는 수동 추출

2. **점진적 개선**
   - 필요시에만 README를 구조화된 형식으로 업데이트
   - 모든 프로젝트에 힘을 많이 쏟지 않고, 우선순위가 높은 프로젝트부터 개선

### Phase 3: 검증 및 최적화

1. **추출된 정보 검증**
   - README에서 추출한 정보의 정확성 확인
   - 누락된 정보 식별

2. **필요시에만 스키마 개선**
   - 기존 README로 해결이 어려운 경우에만 새 필드 추가 고려
   - 점진적으로 필요한 프로젝트만 업데이트

---

## ⚠️ 주의사항

### 1. 기존 필드 활용 우선 (최우선)

- **새 필드 추가 전에 기존 필드로 해결 가능한지 확인**
- `description` (간단한 소개), `readme` (상세 내용) 최대한 활용
- DB 스키마 변경은 최후의 수단으로만 고려

### 2. 점진적 개선 전략

- **모든 프로젝트에 힘을 많이 쏟지 않고 점진적으로 개선**
- 필요시에만 README를 구조화된 형식으로 업데이트
- 우선순위가 높은 프로젝트부터 개선

### 3. README 파싱 전략

- README 마크다운에서 특정 섹션 추출 (예: `## Initial Situation`, `## Key Problems` 등)
- 구조화되지 않은 README는 수동으로 추출하거나 점진적으로 구조화
- 파싱이 어려운 경우에만 수동으로 보완

### 4. 필요시에만 스키마 변경

- 기존 README로 해결이 어려운 경우에만 새 필드 추가 고려
- DB 스키마 변경은 Phase 2-4 설계 후 진행 권장
- Phase 1은 분석 및 제안에 집중

### 5. 프로젝트 히스토리/변경 이력은 고려하지 않음

- **프로젝트 상세페이지는 최신 정보만 표시**
- 프로젝트의 변경 이력이나 히스토리 관리 불필요
- 나중에 기술블로그 형식의 페이지로 분리 예정
- 필요시 프로젝트 ID를 매핑한 테이블로 기술블로그와 프로젝트 연결 가능
- 현재는 프로젝트 상세페이지에 집중: 최신 정보를 효과적으로 표시하는 것에 우선순위

---

## 📝 다음 단계

1. **제안 검토 및 결정** ✅ 완료
   - 제안 0 (README 필드 활용) 최종 결정
   - 별도 데이터셋 관리 불필요
   - README 필드의 확장성 장점 확인

2. **프로젝트 상세페이지 설계**
   - **최신 정보만 표시**하는 것에 집중
   - 프로젝트 히스토리/변경 이력은 고려하지 않음
   - 기술블로그는 별도로 관리될 예정 (프로젝트 ID 매핑 가능)

3. **README 파싱 로직 개발** (필요시)
   - README 마크다운에서 필요한 정보 추출
   - 점진적으로 README 구조화

4. **마이그레이션 스크립트 작성** (필요시에만)
   - 기존 README로 해결이 어려운 경우에만 고려
   - Flyway 마이그레이션 파일 작성
   - 데이터 마이그레이션 스크립트 작성

---

**작성일**: 2025-01-04  
**작성자**: AI Agent (Claude)  
**버전**: 1.0
