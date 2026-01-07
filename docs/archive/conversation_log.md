# Conversation Log

### 📝 템플릿 사용 가이드

#### 작성 시점
- AI 에이전트와의 중요한 기술적 대화 완료 직후
- 주요 기능 구현이나 문제 해결 완료 후
- 새로운 기술 학습이나 아키텍처 결정 후

#### 세션 순서
- **최신 세션이 가이드 아래, 파일 상단에 위치**하도록 작성 (Session N이 위에, Session 1이 아래)
- 각 세션은 `---` 구분선으로 분리
- 백업된 기존 로그는 `docs/ai/backup/`에 보관

#### 기록할 가치가 있는 내용
- **기술적 의사결정**: 왜 그 선택을 했는지 근거
- **문제해결 과정**: 체계적 접근법과 결과
- **성능 개선**: Before/After 수치가 있는 최적화
- **새로운 학습**: 기존 지식에서 확장된 부분
- **실패와 교훈**: 시행착오에서 얻은 인사이트

#### 포트폴리오 활용 팁
- 면접에서 **"구체적 사례"** 질문에 바로 활용 가능
- 기술적 역량을 **정량적 지표**로 증명
- 문제해결 **사고 과정**을 체계적으로 보여줌
- 지속적 성장과 학습 **의지** 입증

## Portfolio Site Renewal: 설계 문서 및 구현 계획 완성
**날짜**: 2025-09-17
**컨텍스트**: PRD, Data-UI Mapping 분석 후 구체적인 설계 문서와 실행 계획 수립

### 완성된 문서들

#### 1. Design Specification 문서 생성
**위치**: `docs/ai/feature/Portfolio Site Renewal Plan/design-specification.md`

**주요 내용**:
- **시스템 아키텍처**: Frontend/Backend/DB 레이어 구조
- **데이터베이스 설계**: 새 필드 (`role`, `screenshots`) 추가 계획
- **API 설계**: Enhanced ProjectResponse 타입 및 필터링 API
- **컴포넌트 설계**: ProjectCard, ProjectModal 상세 스펙
- **상태 관리**: useProjects, useModal, useProjectFilter hooks
- **성능 최적화**: 지연 로딩, 메모이제이션, 번들 최적화

#### 2. 실행 가능한 Task 계획 수립
**위치**: `docs/ai/feature/Portfolio Site Renewal Plan/task.md`

**Phase별 우선순위**:
- **Phase 1 (Critical)**: DB 스키마, 도메인 모델, API 업데이트 (Task 1-3)
- **Phase 2 (High)**: TypeScript 타입, Custom Hooks (Task 4-5)
- **Phase 3 (High)**: 핵심 컴포넌트 구현 (Task 6-8)
- **Phase 4 (High)**: 그리드 레이아웃 (Task 9)
- **Phase 5 (Medium)**: 필터링 및 정렬 (Task 10-11)
- **Phase 6 (Medium)**: 통합 및 최적화 (Task 12-14)
- **Phase 7 (Low)**: RAG 확장 필드 (Task 15)

### 데이터 구조 최종 결정사항

#### 실제 DB 구조 확인 완료
**테이블**: projects, experiences, education, certifications
**프로젝트 테이블 핵심 필드**:
- `business_id` (PJT001, PJT002 등)
- `technologies` (TEXT[] 배열)
- `my_contributions` (TEXT[] 배열)
- `is_team` (BOOLEAN)
- `sort_order` (INTEGER)

#### 웹 UI vs RAG 데이터 분리
**웹 UI 필수 추가 필드**:
- `role` (VARCHAR) - 팀 프로젝트 역할 표시
- `screenshots` (TEXT[]) - 모달 이미지 갤러리용

**RAG 용 선택 필드** (향후):
- `achievements` (TEXT[]) - 챗봇 성과 설명용
- `learning` (TEXT[]) - 챗봇 학습 내용 설명용

### 아키텍처 결정사항

#### 컴포넌트 구조
```
ProjectSection
├── FilterControls (토글, 필터, 정렬)
├── ProjectGrid (반응형 그리드)
│   └── ProjectCard[] (카드 컴포넌트)
└── ProjectModal (상세 정보 모달)
    ├── ImageGallery (스크린샷 갤러리)
    └── TeamContribution (팀 프로젝트 정보)
```

#### 상태 관리 방식
- **useProjects**: API 통합, 데이터 관리
- **useModal**: 모달 상태 관리
- **useProjectFilter**: 필터링, 정렬 로직

#### 반응형 전략
- **Desktop**: 3컬럼 그리드, 오버레이 모달
- **Tablet**: 2컬럼 그리드
- **Mobile**: 1컬럼 그리드, 풀스크린 모달, 스와이프 갤러리

### 구현 준비 완료

#### 각 Task는 독립적인 Commit 단위
- 명확한 실행 단계와 파일 경로 제공
- Definition of Done으로 완료 기준 명시
- 전/후 체크리스트로 품질 보장

#### 백엔드 우선 → 프론트엔드 순서
1. DB 스키마 업데이트 (Task 1-3)
2. 프론트엔드 타입 및 Hook (Task 4-5)
3. UI 컴포넌트 구현 (Task 6-11)
4. 통합 및 완성도 (Task 12-14)

### 다음 단계
1. **Task 1** 실행: ProjectJpaEntity에 role, screenshots 필드 추가
2. 순서대로 Phase 1-7 실행
3. 각 Phase 완료 후 테스트 및 검증

---

## Portfolio Renewal: Project Section 타입 설계 결정사항
**날짜**: 2025-09-17
**컨텍스트**: 포트폴리오 리뉴얼 기획 구체화 과정에서 Project 데이터 구조 개선

### 결정된 사항들

#### 1. Project 타입 분리 및 개선
**배경**: 기존 `type: 'project' | 'certification'`가 UI 카드 형태와 프로젝트 성격을 동시에 담당해 혼란 발생

**해결책**:
```typescript
// UI 카드 타입 (표시 형태 구분)
export type CardDisplayType = 'project' | 'certification';

// 프로젝트 성격 분류 (PRD 기준)
export type ProjectCategory = 'build' | 'maintenance' | 'lab';

// 프로젝트 상태
export type ProjectStatus = 'completed' | 'in_progress' | 'maintenance';
```

**영향**:
- 카드 UI 형태와 프로젝트 분류가 독립적으로 관리됨
- PRD의 Build/Maintenance/Lab 분류 체계 반영 완료
- 향후 필터링 및 토글 기능 구현에 명확한 구조 제공

#### 2. 백엔드 데이터 소스 확인
**현황**: DB에서 프로젝트 데이터 관리 중 (fallback 정적 파일 존재)
**결정**: 실제 DB 구조 확인 후 팀 프로젝트 데이터 논의 예정

#### 3. 기술 스택 필터링 방식
**선택**: 클라이언트 사이드 필터링 + 기술별 인덱싱
**근거**:
- 프로젝트 수가 많지 않아 클라이언트 처리 가능
- 실시간 필터링 UX 제공
- 서버 부하 감소

#### 4. 모바일 UX 전략
**이미지 갤러리**: Swiper.js 채택
- React 최적화, 터치 제스처 완벽 지원
- 모바일 성능 우수

**모달 방식**: 브레이크포인트 기반 적응형
- Desktop: 오버레이 모달
- Mobile: 풀스크린 슬라이드업 모달

### 다음 단계
1. 백엔드 실행하여 실제 프로젝트 데이터 구조 확인
2. 팀 프로젝트 데이터 수집 및 구조화
3. 기본 UI 완성 후 필터링 로직 구현

---

## Database Schema 분석 및 TypeScript 타입 정렬
**날짜**: 2025-09-17
**컨텍스트**: Docker Compose 확인 후 실제 데이터베이스 스키마 분석

### 데이터베이스 구조 발견사항

#### Projects 테이블 실제 구조:
```sql
projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,           -- TS에 없음
    tech_stack TEXT[] NOT NULL,          -- TS: technologies
    start_date DATE,
    end_date DATE,
    github_url VARCHAR(500),             -- TS: githubUrl
    demo_url VARCHAR(500),               -- TS: liveUrl
    image_url VARCHAR(500),              -- TS: imageUrl
    category VARCHAR(100),               -- PRD 요구사항과 일치
    status VARCHAR(50) DEFAULT 'completed',
    featured BOOLEAN DEFAULT FALSE,      -- TS에 없음, 대표 프로젝트용
    sort_order INTEGER DEFAULT 0,       -- TS에 없음
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 타입 불일치 분석

#### 1. 필드명 차이 (camelCase vs snake_case)
- `tech_stack` ↔ `technologies`
- `github_url` ↔ `githubUrl`
- `demo_url` ↔ `liveUrl`
- `image_url` ↔ `imageUrl`

#### 2. 누락된 DB 필드들
- `detailed_description`: 모달 상세 설명용
- `featured`: 대표 프로젝트 표시 (PRD의 highlight 요구사항)
- `sort_order`: 프로젝트 정렬 순서

#### 3. 누락된 TS 필드들
- `isTeam`, `myContributions`, `teamSize`, `role`: 팀 프로젝트 정보
- `source`, `cardType`: UI 구분용
- `issuer`, `externalUrl`: 자격증용 (별도 certifications 테이블 존재)

### 해결 방안

#### 즉시 조치:
1. **TypeScript 타입 업데이트**: DB 스키마에 맞춘 필드명 정렬
2. **팀 프로젝트 정보**: metadata 필드 활용 또는 DB 마이그레이션
3. **Featured 플래그 활용**: 대표 프로젝트 표시에 이상적

#### 아키텍처 결정 필요:
- 자격증 관리: projects 테이블 category vs 별도 certifications 테이블
- 팀 정보 저장: metadata JSON vs 새 컬럼 추가

### 다음 단계
1. Docker Desktop 실행하여 실제 데이터 확인
2. TypeScript 타입 정의 업데이트
3. 팀 프로젝트 데이터 관리 방식 결정

---