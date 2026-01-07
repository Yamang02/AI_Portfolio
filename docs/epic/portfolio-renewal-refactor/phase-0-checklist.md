# Phase 0: Current State Snapshot - 체크리스트

> **목표**: 리뉴얼 전 현재 상태를 완전히 기록하여 비교 기준점 확보

---

## 📋 전체 진행 상황

- [ ] **Step 1: 코드 조사** (예상 1-2시간)
- [ ] **Step 2: 실제 동작 확인** (예상 1시간)
- [ ] **Step 3: 문서화** (예상 1-2시간)

---

## Step 1: 코드 조사

### 1.1 라우팅 구조 파악
- [ ] `App.tsx` 라우팅 설정 확인
- [ ] 모든 페이지 경로 목록화
- [ ] 각 페이지 역할 기술

**조사 파일:**
- `frontend/src/main/App.tsx`

### 1.2 페이지 컴포넌트 분석

#### HomePage
- [ ] `HomePage.tsx` 읽기
- [ ] Hero Section 내용 파악
- [ ] Portfolio Section 구조 파악
- [ ] Props 및 상태 관리 방식 확인

**조사 파일:**
- `frontend/src/main/layout/components/HomePage.tsx`
- `frontend/src/main/layout/components/HeroSection.tsx`

#### ProjectDetailPage
- [ ] `ProjectDetailPage.tsx` 읽기
- [ ] 페이지 구성 요소 파악
- [ ] 데이터 로딩 방식 확인
- [ ] 사이드바/TOC 구조 확인

**조사 파일:**
- `frontend/src/main/pages/ProjectDetail/ProjectDetailPage.tsx`
- `frontend/src/main/pages/ProjectDetail/components/*`

### 1.3 주요 Feature 컴포넌트 조사

#### 프로젝트 관련
- [ ] `PortfolioSection` 구조 파악
- [ ] `ProjectCard` Props 및 렌더링 내용 확인
- [ ] `ProjectFilter` 필터링 로직 파악

**조사 파일:**
- `frontend/src/main/features/projects/components/PortfolioSection.tsx`
- `frontend/src/main/features/projects/components/ProjectCard.tsx`
- `frontend/src/main/features/projects/components/ProjectFilter.tsx`

#### 히스토리 패널
- [ ] `HistoryPanel` 구조 파악
- [ ] `ExperienceCard` 표시 내용 확인
- [ ] `EducationCard` 표시 내용 확인
- [ ] `CertificationCard` 표시 내용 확인

**조사 파일:**
- `frontend/src/main/features/projects/components/HistoryPanel.tsx`
- `frontend/src/main/features/projects/components/ExperienceCard.tsx`
- `frontend/src/main/features/projects/components/EducationCard.tsx`
- `frontend/src/main/features/projects/components/CertificationCard.tsx`

#### 챗봇
- [ ] `Chatbot` 컴포넌트 구조 파악
- [ ] `ChatInputBar` Props 확인
- [ ] `SpeedDialFab` 기능 확인

**조사 파일:**
- `frontend/src/main/features/chatbot/components/Chatbot.tsx`
- `frontend/src/main/features/chatbot/components/ChatMessage.tsx`

### 1.4 공통 UI 컴포넌트 인벤토리
- [ ] Modal 컴포넌트 목록화
- [ ] TechStack 관련 컴포넌트 목록화
- [ ] 기타 공통 컴포넌트 목록화

**조사 디렉토리:**
- `frontend/src/main/components/common/*`
- `frontend/src/main/shared/ui/*`

### 1.5 데이터 타입 및 API 조사
- [ ] Project 타입 정의 확인
- [ ] Experience 타입 정의 확인
- [ ] Education 타입 정의 확인
- [ ] Certification 타입 정의 확인
- [ ] API 엔드포인트 파악

**조사 파일:**
- `frontend/src/main/entities/project/types.ts`
- `frontend/src/main/entities/experience/types.ts`
- `frontend/src/main/entities/education/types.ts`
- `frontend/src/main/entities/certification/types.ts`
- `frontend/src/main/entities/*/api/*Api.ts`

### 1.6 스타일 및 디자인 토큰 조사
- [ ] Tailwind 설정 확인
- [ ] 색상 팔레트 추출
- [ ] 폰트 설정 확인
- [ ] 간격(spacing) 체계 확인
- [ ] 반응형 브레이크포인트 확인

**조사 파일:**
- `frontend/tailwind.config.js`
- `frontend/src/index.css`
- `frontend/src/main/shared/lib/constants/responsive.ts`

### 1.7 상태 관리 조사
- [ ] AppProvider 전역 상태 파악
- [ ] React Query 설정 확인
- [ ] 캐싱 전략 파악

**조사 파일:**
- `frontend/src/main/app/providers/AppProvider.tsx`
- `frontend/src/main/config/queryClient.ts`
- `frontend/src/main/config/queryCacheConfig.ts`

---

## Step 2: 실제 동작 확인

### 2.1 개발 환경 준비
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] 브라우저에서 접속 확인
- [ ] 개발자 도구 준비

### 2.2 HomePage 확인
- [ ] 첫 화면 로딩 확인
- [ ] Hero Section 내용 확인
- [ ] 프로젝트 목록 렌더링 확인
- [ ] 프로젝트 필터 동작 테스트
- [ ] 스크롤 동작 확인
- [ ] **스크린샷 촬영**: `homepage-full.png`
- [ ] **스크린샷 촬영**: `homepage-hero.png`
- [ ] **스크린샷 촬영**: `homepage-projects.png`

### 2.3 히스토리 패널 확인
- [ ] 히스토리 패널 토글 동작 확인
- [ ] Experience 카드 표시 내용 확인
- [ ] Education 카드 표시 내용 확인
- [ ] Certification 카드 표시 내용 확인
- [ ] **스크린샷 촬영**: `history-panel-open.png`

### 2.4 챗봇 확인
- [ ] 챗봇 열기/닫기 확인
- [ ] 메시지 입력 및 전송 테스트
- [ ] ChatInputBar 동작 확인
- [ ] SpeedDialFab 동작 확인
- [ ] **스크린샷 촬영**: `chatbot-open.png`

### 2.5 프로젝트 상세 페이지 확인
- [ ] 프로젝트 카드 클릭하여 상세 페이지 이동
- [ ] Header 내용 확인
- [ ] Overview 섹션 확인
- [ ] TechStack 섹션 확인
- [ ] Contribution 섹션 확인
- [ ] Gallery 섹션 확인 (있다면)
- [ ] TOC 동작 확인
- [ ] Sidebar 동작 확인
- [ ] **스크린샷 촬영**: `project-detail-full.png`
- [ ] **스크린샷 촬영**: `project-detail-sidebar.png`

### 2.6 반응형 확인
- [ ] 모바일 뷰 (375px) 확인
- [ ] 태블릿 뷰 (768px) 확인
- [ ] 데스크톱 뷰 (1024px+) 확인
- [ ] **스크린샷 촬영**: `responsive-mobile.png`
- [ ] **스크린샷 촬영**: `responsive-tablet.png`

### 2.7 상호작용 확인
- [ ] 모든 버튼 클릭 테스트
- [ ] 호버 효과 확인
- [ ] ESC 키 동작 확인
- [ ] 키보드 네비게이션 확인 (있다면)
- [ ] 뒤로가기 동작 확인
- [ ] 스크롤 위치 복원 확인

### 2.8 에러 케이스 확인
- [ ] 네트워크 에러 시 동작 확인
- [ ] 로딩 상태 UI 확인
- [ ] 빈 데이터 시 표시 확인

### 2.9 특수 기능 확인
- [ ] 이스터에그 기능 테스트
- [ ] 기타 발견된 숨겨진 기능 확인

---

## Step 3: 문서화

### 3.1 current-state.md 작성

#### 섹션 1: 페이지 구조
- [ ] 라우팅 테이블 작성
- [ ] 페이지별 역할 기술
- [ ] 페이지 간 이동 동선 다이어그램

#### 섹션 2: 주요 기능
- [ ] 기능 목록 작성 (체크박스 형식)
- [ ] 각 기능별 상세 설명 추가
- [ ] 기능별 사용 컴포넌트 명시

#### 섹션 3: UI 컴포넌트 인벤토리
- [ ] 레이아웃 컴포넌트 목록
- [ ] 프로젝트 관련 컴포넌트 목록
- [ ] 히스토리 관련 컴포넌트 목록
- [ ] 공통 UI 컴포넌트 목록
- [ ] 각 컴포넌트 위치 및 주요 Props 기술

#### 섹션 4: 디자인 시스템 현황
- [ ] 색상 팔레트 테이블 작성
- [ ] 타이포그래피 설정 기술
- [ ] 간격 체계 정리
- [ ] 반응형 브레이크포인트 정리

#### 섹션 5: 콘텐츠 구조
- [ ] Project 타입 정의 문서화
- [ ] Experience 타입 정의 문서화
- [ ] Education 타입 정의 문서화
- [ ] Certification 타입 정의 문서화
- [ ] 데이터 우선순위 기술

#### 섹션 6: 사용자 동선
- [ ] 주요 사용자 플로우 다이어그램 작성
- [ ] 상호작용 요소 목록화
- [ ] 접근성 관련 기능 확인

#### 섹션 7: 스크린샷
- [ ] 스크린샷 파일 정리 (`screenshots/before/`)
- [ ] 스크린샷 캡션 작성
- [ ] 문서에 이미지 링크 추가

#### 섹션 8: 현재 문제점
- [ ] 정보 과부하 영역 식별
- [ ] 불명확한 동선 지적
- [ ] 불필요한 UI 요소 목록
- [ ] 디자인 일관성 문제 지적
- [ ] Phase 1 이후 작업을 위한 인사이트 정리

### 3.2 스크린샷 정리
- [ ] `screenshots/before/` 디렉토리 생성
- [ ] 모든 스크린샷 파일명 규칙에 맞게 저장
- [ ] 필요시 주석 추가

### 3.3 문서 검토
- [ ] 모든 섹션 작성 완료 확인
- [ ] 오타 및 문법 확인
- [ ] 링크 및 파일 경로 검증
- [ ] 누락된 정보 재확인

---

## ✅ Phase 0 완료 기준 (Definition of Done)

### 필수 산출물
- [ ] `current-state.md` 파일 작성 완료
- [ ] `screenshots/before/` 디렉토리에 최소 10개 스크린샷 저장
- [ ] 모든 페이지 문서화 완료
- [ ] 모든 주요 기능 목록화 완료

### 품질 기준
- [ ] 다른 사람이 문서만 보고 현재 상태를 이해할 수 있음
- [ ] 리뉴얼 후 비교 시 명확한 기준점이 됨
- [ ] 제거 대상 식별에 필요한 모든 정보 포함
- [ ] 객관적 사실 위주로 작성됨 (주관적 평가 최소화)

### 검증 체크리스트
- [ ] 팀원이 문서를 읽고 피드백 제공
- [ ] 누락된 페이지/기능이 없는지 재확인
- [ ] 스크린샷이 모든 주요 화면을 포함하는지 확인
- [ ] Phase 1 작업 시작 가능한 상태인지 확인

---

## 📝 작업 시 주의사항

### ⚠️ 금지 사항
- **코드 수정 금지**: 조사 및 문서화만 진행
- **새로운 패키지 설치 금지**: 기존 환경에서만 작업
- **디자인 변경 금지**: 현재 상태 그대로 기록

### ✅ 권장 사항
- **스크린샷 고해상도로 촬영**: 나중에 세부사항 확인 가능하도록
- **컴포넌트 트리 구조 기록**: 계층 관계를 명확히
- **데이터 플로우 간단히 도식화**: 나중에 리팩토링 시 참고
- **문제점은 별도 섹션에 기록**: Phase 6에서 제거 대상 식별 시 활용

### 💡 팁
- 브라우저 개발자 도구의 React DevTools 활용
- 컴포넌트 트리를 확인하며 조사하면 빠름
- 스크린샷은 전체 페이지와 특정 영역 모두 촬영
- 코드 주석에서 특이사항 발견 시 기록

---

## 📅 타임라인 (권장)

| 단계 | 예상 시간 | 완료 예정 |
|------|----------|----------|
| Step 1: 코드 조사 | 1-2시간 | Day 1 |
| Step 2: 실제 동작 확인 | 1시간 | Day 1 |
| Step 3: 문서화 | 1-2시간 | Day 1-2 |
| **총계** | **3-5시간** | **1-2일** |

---

## 🔗 관련 문서

- [Epic README](./README.md)
- [Phase 0 설계 문서](./phase-0-design.md)
- [Phase 1 체크리스트](./phase-1-checklist.md) ← 다음 단계

---

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
**버전**: 1.0
