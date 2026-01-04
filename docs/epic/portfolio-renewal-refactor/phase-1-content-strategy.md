# Phase 1 콘텐츠 관리 전략 고민

## 현재 상황

### 프로젝트 콘텐츠
- ✅ **이미 DB로 관리 중**: `projects` 테이블에 모든 프로젝트 정보 저장
- ✅ **구조화된 데이터**: title, description, detailed_description, readme 등
- ✅ **관계형 데이터**: 기술 스택, 스크린샷 등 관계 테이블로 관리

### 프로필 정보
- ✅ **DB로 관리 중**: `experiences`, `education`, `certifications` 테이블
- ✅ **구조화된 데이터**: 역할, 조직, 날짜, 성과 등

---

## Phase 1의 원래 계획

### 원래 목표
```
각 프로젝트를 UI와 분리된 텍스트로 정리한다.
→ /docs/epic/portfolio-renewal-refactor/content/projects.md
→ /docs/epic/portfolio-renewal-refactor/content/profile.md
```

### 의도된 목적
- 리뉴얼을 위한 콘텐츠 구조화
- UI와 분리하여 콘텐츠 본질에 집중
- 새로운 페이지 구조 설계를 위한 콘텐츠 인벤토리

---

## 고민: 마크다운 파일 vs DB 관리

### 옵션 1: 마크다운 파일로 분리 (원래 계획)

**장점:**
- ✅ 리뉴얼 설계 단계에서 콘텐츠를 쉽게 검토/수정 가능
- ✅ 버전 관리 가능 (Git)
- ✅ UI와 완전히 분리된 순수 콘텐츠
- ✅ Phase 2-4 (설계 단계)에서 자유롭게 구조 변경 가능

**단점:**
- ❌ DB와 중복 관리 (동기화 문제)
- ❌ 실제 운영 시 DB로 다시 마이그레이션 필요
- ❌ 관리 포인트 증가 (DB + 파일)

### 옵션 2: DB로 통합 관리 (제안)

**장점:**
- ✅ **단일 소스 오브 트루스**: DB 하나로 모든 콘텐츠 관리
- ✅ **일관성**: 프로덕션과 개발 환경 동일한 데이터 소스
- ✅ **관리 효율성**: Admin UI로 쉽게 수정 가능
- ✅ **확장성**: 향후 기능 추가 시 DB 구조 활용 가능
- ✅ **이미 구축됨**: 추가 작업 최소화

**단점:**
- ❌ 설계 단계에서 콘텐츠 구조 변경이 DB 스키마 변경 필요
- ❌ Git으로 버전 관리 어려움 (DB 덤프 필요)

---

## 추천 방안: 하이브리드 접근

### Phase 1: DB 기반 콘텐츠 인벤토리 + 설계 문서

#### 1. 프로젝트 콘텐츠
```
✅ DB에 있는 데이터를 기반으로 콘텐츠 구조 분석
✅ Phase 1 템플릿에 맞춰 DB 데이터를 정리한 문서 작성
   - DB에서 추출한 데이터를 템플릿 형식으로 정리
   - 누락된 필드나 개선점 식별
   - 리뉴얼을 위한 콘텐츠 구조 제안
```

**작업 방식:**
1. DB에서 프로젝트 데이터 추출
2. Phase 1 템플릿 형식으로 정리:
   ```
   - Project Name: [DB의 title]
   - Time Period: [DB의 start_date ~ end_date]
   - My Role: [DB의 role]
   - Initial Situation: [DB의 description에서 추출/정리]
   - Key Problems: [DB의 detailed_description에서 추출]
   - Direction/Decision: [DB의 readme에서 추출]
   - Outcome: [DB의 status, achievements]
   - References: [DB의 github_url, live_url]
   ```
3. 문서화: `content/projects-inventory.md` (DB 기반 인벤토리)
4. **DB 스키마 개선 제안**: 누락된 필드가 있으면 DB 스키마 확장 제안

#### 2. 프로필 정보
```
✅ DB에 있는 experiences, education, certifications 기반으로 정리
✅ 리뉴얼을 위한 프로필 구조 제안
```

**작업 방식:**
1. DB에서 프로필 데이터 추출
2. Phase 1 템플릿 형식으로 정리
3. 문서화: `content/profile-inventory.md`
4. **DB 스키마 개선 제안**: 프로필 관련 추가 필드 필요 시 제안

### Phase 2-4: 설계 단계
- DB 기반 인벤토리 문서를 참고하여 페이지 구조 설계
- 필요한 경우 DB 스키마 확장 (예: `initial_situation`, `key_problems` 필드 추가)

### Phase 5: UI 구현
- **DB 데이터를 직접 사용**: 마크다운 파일 불필요
- Admin UI로 콘텐츠 관리
- DB 스키마가 리뉴얼된 구조를 지원

---

## 구체적 제안

### Phase 1 작업 내용 수정

#### Task 1.1: 프로젝트 콘텐츠 인벤토리 (DB 기반)
1. **DB 데이터 추출 및 분석**
   - 현재 `projects` 테이블의 데이터 구조 분석
   - Phase 1 템플릿과 매핑
   - 누락된 정보 식별

2. **콘텐츠 구조 문서화**
   - `content/projects-inventory.md`: DB 데이터를 템플릿 형식으로 정리
   - 각 프로젝트의 현재 상태와 리뉴얼 시 필요한 정보 정리

3. **DB 스키마 개선 제안**
   - 리뉴얼에 필요한 필드가 없으면 추가 제안
   - 예: `initial_situation`, `key_problems`, `decision_made` 등

#### Task 1.2: 프로필 정보 인벤토리 (DB 기반)
1. **DB 데이터 추출 및 분석**
   - `experiences`, `education`, `certifications` 테이블 분석
   - 프로필 템플릿과 매핑

2. **프로필 구조 문서화**
   - `content/profile-inventory.md`: DB 데이터 기반 정리
   - 리뉴얼을 위한 프로필 구조 제안

3. **DB 스키마 개선 제안** (필요 시)
   - 프로필 관련 추가 필드 제안

---

## 최종 권장사항

### ✅ DB로 통합 관리 권장

**이유:**
1. **이미 구축된 인프라 활용**: DB와 Admin UI가 이미 있음
2. **일관성**: 프로덕션과 개발 환경 동일한 데이터 소스
3. **관리 효율성**: 단일 소스로 관리
4. **확장성**: 향후 기능 추가 시 유리

### Phase 1 수정안

**기존 계획:**
```
프로젝트 콘텐츠 → 마크다운 파일로 분리
```

**수정된 계획:**
```
프로젝트 콘텐츠 → DB 기반 인벤토리 작성 + DB 스키마 개선 제안
```

**출력물:**
- `content/projects-inventory.md`: DB 데이터 기반 인벤토리 (템플릿 형식)
- `content/profile-inventory.md`: DB 데이터 기반 프로필 인벤토리
- `content/db-schema-improvements.md`: DB 스키마 개선 제안 (필요 시)

**장점:**
- ✅ DB를 단일 소스로 유지
- ✅ 리뉴얼 설계를 위한 콘텐츠 인벤토리는 여전히 제공
- ✅ 실제 구현 시 DB 직접 사용 가능
- ✅ 중복 관리 문제 해결

---

## 결론

**Phase 1은 DB 기반으로 진행하되, 리뉴얼 설계를 위한 인벤토리 문서를 작성하는 것이 가장 효율적입니다.**

마크다운 파일로 완전히 분리하는 것보다, DB 데이터를 기반으로 정리하고 필요한 경우 DB 스키마를 확장하는 방향이 더 실용적입니다.
