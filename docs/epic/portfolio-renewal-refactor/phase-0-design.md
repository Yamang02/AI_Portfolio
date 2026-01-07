# Phase 0: Current State Snapshot - 설계 문서

## 목적

리뉴얼 작업 전 현재 포트폴리오 사이트의 상태를 정확히 기록하여:
- 변경 전/후 비교 기준점 확보
- 제거 대상 식별을 위한 기준 마련
- 리뉴얼 범위 명확화

---

## 조사 범위

### 1. 페이지 구조 파악

#### 1.1 라우팅 구조
- 현재 존재하는 모든 페이지 경로
- 각 페이지의 역할과 목적
- 페이지 간 이동 동선

**조사 대상:**
```
- frontend/src/main/App.tsx (라우팅 정의)
- 각 페이지 컴포넌트
```

#### 1.2 페이지별 콘텐츠 영역
각 페이지가 보여주는 정보 영역:
- Hero/Landing 영역
- 프로젝트 목록/상세
- 히스토리 패널
- 기타 섹션

---

### 2. 주요 기능 목록화

#### 2.1 핵심 기능
- [ ] 프로젝트 목록 표시
- [ ] 프로젝트 상세 보기
- [ ] 프로젝트 필터링
- [ ] AI 챗봇
- [ ] 히스토리 패널 (경험/교육/자격증)
- [ ] 이스터에그
- [ ] 기타 발견된 기능

#### 2.2 기능별 세부 사항
각 기능에 대해 기록:
- 현재 동작 방식
- 사용되는 컴포넌트
- 데이터 흐름
- 사용자 상호작용 패턴

---

### 3. UI 컴포넌트 인벤토리

#### 3.1 레이아웃 컴포넌트
```
- Header
- HeroSection
- Main Container
- Footer (있다면)
```

#### 3.2 프로젝트 관련 컴포넌트
```
- ProjectCard
- ProjectFilter
- ProjectDetailPage
- ProjectDetailHeader
- ProjectDetailOverview
- ProjectDetailTechStack
- ProjectDetailContribution
- ProjectDetailGallery
- ProjectDetailTOC
- ProjectDetailSidebar
```

#### 3.3 히스토리 관련 컴포넌트
```
- HistoryPanel
- PanelToggle
- ExperienceCard
- EducationCard
- CertificationCard
```

#### 3.4 공통 UI 컴포넌트
```
- Modal (ContactModal, ProjectModal)
- Chatbot
- ChatInputBar
- SpeedDialFab
- TechStackBadge
- TechStackList
- TechStackTetris
- SkeletonCard
- MarkdownRenderer
- ErrorBoundary
```

#### 3.5 각 컴포넌트 조사 항목
- 컴포넌트 파일 위치
- 주요 Props
- 렌더링하는 콘텐츠
- 스타일 특징
- 의존 관계

---

### 4. 디자인 시스템 현황

#### 4.1 색상 체계
- Primary 색상
- Secondary 색상
- Background 색상
- Text 색상
- Accent/Interactive 색상

#### 4.2 타이포그래피
- 폰트 패밀리
- 제목 스타일 (H1-H6)
- 본문 텍스트 스타일
- 특수 텍스트 (코드, 인용 등)

#### 4.3 간격(Spacing) 체계
- Container 여백
- Section 간격
- 컴포넌트 내부 여백
- 그리드 간격

#### 4.4 반응형 브레이크포인트
```
- Mobile
- Tablet
- Desktop
- Wide Screen
```

---

### 5. 콘텐츠 구조 파악

#### 5.1 프로젝트 데이터 구조
```typescript
// 현재 사용 중인 프로젝트 타입 조사
interface Project {
  // 필드 목록 기록
}
```

#### 5.2 히스토리 데이터 구조
```typescript
// Experience, Education, Certification 타입 조사
```

#### 5.3 콘텐츠 표시 우선순위
- 첫 화면에 보이는 정보
- 스크롤 후 보이는 정보
- 클릭 후 보이는 정보

---

### 6. 사용자 동선 파악

#### 6.1 주요 사용자 플로우
```
1. 첫 방문 → Hero → 프로젝트 목록 탐색
2. 프로젝트 카드 클릭 → 상세 페이지
3. 챗봇 사용
4. 히스토리 패널 탐색
```

#### 6.2 상호작용 요소
- 클릭 가능한 요소
- 호버 효과
- 스크롤 연동 기능
- 키보드 단축키 (ESC 등)

---

### 7. 기술적 구조

#### 7.1 상태 관리
- 전역 상태 (AppProvider)
- 로컬 상태
- 쿼리 캐싱 (React Query)

#### 7.2 데이터 페칭
- API 엔드포인트
- 로딩 상태 처리
- 에러 처리

#### 7.3 라우팅 및 네비게이션
- 페이지 전환 방식
- 스크롤 위치 저장/복원
- 뒤로가기 처리

---

## 산출물 구조

### current-state.md

```markdown
# Current State Snapshot

## 1. 페이지 구조
### 1.1 라우팅
- [라우팅 목록]

### 1.2 페이지별 콘텐츠
- HomePage
  - Hero Section: [설명]
  - Portfolio Section: [설명]
  - ...

## 2. 주요 기능
- [기능 목록 및 설명]

## 3. UI 컴포넌트
### 3.1 레이아웃
- [컴포넌트 목록]

### 3.2 프로젝트 관련
- [컴포넌트 목록]

...

## 4. 디자인 시스템
### 4.1 색상
- [색상 팔레트]

### 4.2 타이포그래피
- [폰트 설정]

...

## 5. 콘텐츠 구조
- [데이터 타입 및 구조]

## 6. 사용자 동선
- [플로우 다이어그램 또는 설명]

## 7. 스크린샷
- HomePage 전체
- Project 상세 페이지
- 히스토리 패널 열린 상태
- 챗봇 열린 상태
- 주요 UI 컴포넌트들

## 8. 현재 문제점 및 개선 필요 사항
- 정보 과부하 영역
- 불명확한 사용자 동선
- 불필요하거나 혼란스러운 UI 요소
```

---

## 작업 프로세스

### Step 1: 코드 조사
1. 라우팅 파일 분석
2. 페이지 컴포넌트 읽기
3. 공통 컴포넌트 목록화
4. 스타일 설정 확인

### Step 2: 실제 동작 확인
1. 개발 서버 실행
2. 각 페이지 방문
3. 모든 기능 테스트
4. 스크린샷 촬영

### Step 3: 문서화
1. `current-state.md` 작성
2. 스크린샷 저장 (`/screenshots/before/`)
3. 문제점 정리

---

## 체크리스트

이 설계 문서와 별도로 작성됩니다.
→ `phase-0-checklist.md` 참조

---

## 제약 사항

- **코드 수정 금지**: 조사만 진행, 변경 작업은 Phase 5 이후
- **새로운 도구 설치 금지**: 기존 환경에서만 조사
- **주관적 평가 최소화**: 객관적 사실 위주로 기록

---

## 예상 소요 시간

- 코드 조사: 1-2시간
- 실제 동작 확인: 1시간
- 문서화: 1-2시간
- **총 3-5시간**

---

## 성공 기준 (Phase 0 DoD)

- [ ] 모든 페이지가 문서화됨
- [ ] 모든 주요 기능이 목록화됨
- [ ] UI 컴포넌트 인벤토리 완성
- [ ] 주요 화면 스크린샷 저장
- [ ] 디자인 시스템 현황 파악 완료
- [ ] 사용자 동선 다이어그램 작성
- [ ] 현재 문제점 식별 완료

---

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
