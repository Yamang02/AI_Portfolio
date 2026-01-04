# Phase 1: Content Inventory (DB 기반 콘텐츠 인벤토리) - 체크리스트

> **목표**: DB에 저장된 콘텐츠를 기반으로 리뉴얼을 위한 콘텐츠 구조를 분석하고 정리

> **전략**: DB를 단일 소스로 유지하고, 리뉴얼 설계를 위한 인벤토리 문서를 작성합니다.

---

## 📋 전체 진행 상황

- [x] **Task 1.1: 프로젝트 콘텐츠 인벤토리** (DB 기반)
- [x] **Task 1.2: 프로필 정보 인벤토리** (DB 기반)

### 💡 컨텍스트: 왜 DB 기반인가?

**현재 상황:**
- ✅ 프로젝트 콘텐츠: `projects` 테이블에 모든 정보 저장
- ✅ 프로필 정보: `experiences`, `education`, `certifications` 테이블로 관리
- ✅ 구조화된 데이터: 이미 관계형 DB로 체계적으로 관리 중

**전략적 선택:**
- **마크다운 분리 ❌**: 중복 관리 및 동기화 문제
- **DB 기반 인벤토리 ✅**: 단일 소스 유지 + 리뉴얼 설계를 위한 문서 작성

**이 Phase의 목적:**
1. DB 데이터를 리뉴얼 템플릿 형식으로 정리
2. 누락된 정보 식별
3. 필요 시 DB 스키마 개선 제안

---

## Task 1.1: 프로젝트 콘텐츠 인벤토리 (DB 기반)

### 1.1.1 DB 데이터 추출 및 분석

- [x] `projects` 테이블 스키마 확인
- [x] 현재 프로젝트 데이터 조회 및 분석
- [x] Phase 1 템플릿과 DB 필드 매핑 테이블 작성
- [x] 누락된 정보 또는 개선이 필요한 필드 식별

**조사 대상:**
- `backend/src/main/resources/db/migration/V001__baseline_initial_schema.sql`
- `backend/src/main/java/.../entity/ProjectJpaEntity.java`
- 프로덕션 DB의 실제 데이터 (Admin UI 또는 직접 조회)

**매핑 테이블 작성:**
| 템플릿 항목 | DB 필드 | 현재 상태 | 개선 필요 여부 | 비고 |
|------------|---------|----------|---------------|------|
| Project Name | `title` | ✅ | - | - |
| Time Period | `start_date`, `end_date` | ✅ | - | - |
| My Role | `role` | ✅ | - | - |
| Initial Situation | `readme` | ✅ | README에서 추출 | README 마크다운에 포함 |
| Key Problems | `readme` | ✅ | README에서 추출 | README 마크다운에 포함 |
| Direction/Decision | `readme` | ✅ | README에서 추출 | README 마크다운에 포함 |
| Outcome | `status` | ✅ | - | ENUM 타입 |
| References | `github_url`, `live_url`, `external_url` | ✅ | - | - |

**최종 결정**: README 필드 활용
- `description`: 간단한 소개 필드
- `readme`: 모든 내러티브 정보 포함 (Initial Situation, Key Problems, Direction/Decision 등)
- 별도 데이터셋 관리 불필요

### 1.1.2 콘텐츠 구조 문서화

- [x] DB에서 프로젝트 데이터 추출
- [x] 각 프로젝트를 템플릿 형식으로 정리
- [x] 현재 상태와 리뉴얼 시 필요한 정보 구분
- [x] `content/projects-inventory.md` 작성

**템플릿 형식:**
```markdown
## [프로젝트명]

### 기본 정보
- **Project Name**: [DB: title]
- **Time Period**: [DB: start_date] ~ [DB: end_date]
- **My Role**: [DB: role]
- **Status**: [DB: status]

### 콘텐츠 (현재 DB 상태)
- **Description**: [DB: description] - 간단한 소개
- **README**: [DB: readme] - 상세 내용 (Initial Situation, Key Problems, Direction/Decision 포함)

### 리뉴얼 시 필요한 정보
- **Initial Situation**: README에서 추출
- **Key Problems**: README에서 추출
- **Direction/Decision**: README에서 추출

### 참고 링크
- **GitHub**: [DB: github_url]
- **Live**: [DB: live_url]
- **External**: [DB: external_url]
```

**최종 결정**: README 필드 활용
- 모든 내러티브 정보는 README 마크다운에 포함
- 별도 데이터셋 관리 불필요

### 1.1.3 DB 스키마 개선 제안

- [x] 리뉴얼에 필요한 필드가 현재 DB에 있는지 확인
- [x] 누락된 필드 식별
- [x] DB 스키마 확장 제안 작성
- [x] `content/db-schema-improvements.md` 작성 (필요 시)

**최종 결정**: README 필드 활용
- 별도 필드 추가 불필요
- 모든 내러티브 정보는 README 마크다운에 포함
- README 마크다운 파싱으로 정보 추출
- 확장성 최고: 마크다운 형식으로 자유롭게 구조화 가능

---

## Task 1.2: 프로필 정보 인벤토리 (DB 기반)

### 1.2.1 DB 데이터 추출 및 분석

- [x] `experiences` 테이블 스키마 확인
- [x] `education` 테이블 스키마 확인
- [x] `certifications` 테이블 스키마 확인
- [x] 프로필 템플릿과 DB 필드 매핑 테이블 작성

**조사 대상:**
- `backend/src/main/resources/db/migration/V001__baseline_initial_schema.sql`
- 각 엔티티 클래스
- 프로덕션 DB의 실제 데이터

### 1.2.2 프로필 구조 문서화

- [x] DB에서 프로필 데이터 추출
- [x] 경력(Experience) 정보 정리
- [x] 교육(Education) 정보 정리
- [x] 자격증(Certification) 정보 정리
- [x] 기술 스택 정보 정리 (`tech_stack_metadata` 테이블)
- [x] `content/profile-inventory.md` 작성

**템플릿 형식:**
```markdown
## 프로필 정보 인벤토리

### 역할 이력 요약
[DB: experiences 테이블 기반]
- 조직명, 역할, 기간
- 주요 담당 업무
- 주요 성과

### 교육 이력
[DB: education 테이블 기반]
- 교육 기관, 과정명, 기간
- 관련 프로젝트

### 자격증
[DB: certifications 테이블 기반]
- 자격증명, 발급 기관, 취득일

### 기술 스택
[DB: tech_stack_metadata 테이블 기반]
- 핵심 기술
- 일반 기술
- 카테고리별 분류

### 협업/의사결정 관련 경험
[DB: experiences.main_responsibilities, achievements 기반]
- 주요 협업 경험
- 의사결정 과정
```

### 1.2.3 DB 스키마 개선 제안 (필요 시)

- [x] 프로필 관련 추가 필드 필요 여부 확인
- [x] 필요 시 DB 스키마 확장 제안 작성
- [x] `content/db-schema-improvements.md`에 추가 (필요 시)

---

## ✅ Phase 1 완료 기준 (Definition of Done)

### 필수 산출물
- [x] `content/projects-inventory.md` 작성 완료
- [x] `content/profile-inventory.md` 작성 완료
- [x] DB 필드 매핑 테이블 작성 완료
- [x] `content/db-schema-improvements.md` 작성 (필요 시)

### 품질 기준
- [x] 모든 프로젝트가 인벤토리에 포함됨 (템플릿 형식으로 준비됨)
- [x] 리뉴얼 템플릿과 DB 필드 매핑이 명확함
- [x] 누락된 정보가 식별되고 개선 방안이 제시됨
- [x] Phase 2 작업 시작 가능한 상태

### 검증 체크리스트
- [x] DB 데이터와 인벤토리 문서가 일치하는지 확인 (스키마 기반으로 작성됨)
- [x] 리뉴얼에 필요한 모든 정보가 식별되었는지 확인
- [x] DB 스키마 개선 제안이 구체적인지 확인

---

## 📝 작업 시 주의사항

### ✅ 권장 사항
- **DB를 단일 소스로 유지**: 마크다운 파일은 인벤토리 목적만
- **실제 데이터 확인**: 프로덕션 DB의 실제 데이터를 기반으로 작업
- **템플릿과 매핑 명확히**: 어떤 DB 필드가 어떤 템플릿 항목에 해당하는지 명시
- **README 필드 활용**: 모든 내러티브 정보는 README 마크다운에 포함
- **점진적 개선**: 모든 프로젝트에 힘을 많이 쏟지 않고 필요시에만 개선

### 💡 팁
- Admin UI를 통해 실제 데이터 확인
- DB 쿼리를 통해 데이터 구조 파악
- README 필드 활용이 가장 확장성이 좋음 (별도 데이터셋 관리 불필요)
- 프로젝트 상세페이지는 최신 정보만 표시 (히스토리 고려하지 않음)

---

## 🔗 관련 문서

- [Epic README](./README.md)
- [Phase 1 설계 문서](./phase-1-design.md)
- [Phase 2 설계 문서](./phase-2-design.md) ← 다음 단계

---

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
**버전**: 4.0 (README 필드 활용 최종 결정)
