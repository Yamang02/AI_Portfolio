# Phase 6 — Profile & Chat Pages + Admin Login Design - Checklist

**작성일**: 2026-01-06
**최종 업데이트**: 2026-01-07
**참고 문서**: [phase-6-design.md](./phase-6-design.md)
**상태**: 🚧 진행 중 (Task 6.1 완료)

---

## 📊 진행 상황 요약

### 완료된 작업
- ✅ **Task 6.1: Profile 페이지 구현** (100%)
  - ProfilePage 컴포넌트 및 모든 하위 컴포넌트 완성
  - IntroductionSection, CareerTimeline, CareerTimelineSection 구현
  - ExperienceSection, EducationSection, CertificationSection 구현
  - CareerCard 통합 컴포넌트 구현
  - API 연동 및 로딩 상태 처리
  - 반응형 레이아웃 완성
  - 디자인 시스템 완전 준수

### 진행 중인 작업
- 🔄 **Task 6.4: 네비게이션 및 라우팅** (부분 완료)
  - ⚠️ `/profile` 라우트 추가 필요
  - ⚠️ Footer 네비게이션 추가 필요

### 미완료 작업
- ❌ **Task 6.2: Chatbot 독립 페이지화** (0%)
- ❌ **Task 6.3: Admin 로그인 페이지 디자인 통합** (0%)
- ❌ **Task 6.4: 네비게이션 및 라우팅** (30% - 일부 완료)

### 다음 단계
1. `/profile` 라우트를 App.tsx에 추가
2. Footer 네비게이션 컴포넌트 구현
3. Chat 페이지 구현 시작
4. Admin 로그인 페이지 리팩토링

---

## Task 6.1: Profile 페이지 구현

### Subtask 6.1.1: Profile 페이지 구조 설계

- [x] Profile 페이지 파일 생성
  - [x] `frontend/src/pages/ProfilePage/ProfilePage.tsx` 생성
  - [x] `frontend/src/pages/ProfilePage/index.ts` 생성
- [x] 페이지 기본 구조 구현
  - [x] Hero Section 추가 (이름, 직책, 간단한 소개) - IntroductionSection으로 구현
  - [x] Experience Section 영역 추가 - CareerTimeline/CareerTimelineSection으로 구현
  - [x] Education Section 영역 추가 - CareerTimeline/CareerTimelineSection으로 구현
  - [x] Project History Timeline Section 영역 추가 - CareerTimelineSection으로 구현
  - [x] Footer 추가 - PageLayout 사용
- [x] 페이지 레이아웃 설정
  - [x] max-width 컨테이너 설정
  - [x] Spacing 토큰 적용
  - [x] 반응형 그리드 레이아웃 설정

### Subtask 6.1.2: Experience/Education 섹션 구현

- [x] Experience 섹션 컴포넌트 생성
  - [x] `frontend/src/pages/ProfilePage/components/ExperienceSection.tsx` 생성
  - [x] main 디렉토리의 ExperienceCard 구조 참고
  - [x] 디자인 시스템 Card 컴포넌트 사용 - CareerCard로 통합
  - [x] SectionTitle 컴포넌트 사용
  - [x] API 연동 (`useExperiencesQuery()`)
  - [x] 로딩 상태 UI (SkeletonCard) - isLoading 처리
  - [x] 에러 상태 UI
- [x] Education 섹션 컴포넌트 생성
  - [x] `frontend/src/pages/ProfilePage/components/EducationSection.tsx` 생성
  - [x] main 디렉토리의 EducationCard 구조 참고
  - [x] 디자인 시스템 Card 컴포넌트 사용 - CareerCard로 통합
  - [x] SectionTitle 컴포넌트 사용
  - [x] API 연동 (`useEducationQuery()`)
  - [x] 로딩 상태 UI (SkeletonCard) - isLoading 처리
  - [x] 에러 상태 UI
- [x] 디자인 시스템 준수 확인
  - [x] 모든 색상이 CSS 변수 사용
  - [x] 모든 간격이 Spacing 토큰 사용
  - [x] 모든 텍스트가 Typography 토큰 사용
  - [x] 하드코딩된 스타일 없음

### Subtask 6.1.3: 프로젝트 히스토리 타임라인 통합

- [x] ProjectHistoryTimeline 컴포넌트 공유 준비
  - [x] CareerTimeline/CareerTimelineSection으로 통합 구현
  - [x] Experience/Education 모두 포함하는 통합 타임라인
  - [x] 별도 variant prop 없이 구현 (단일 버전)
- [x] Profile 페이지에 타임라인 통합
  - [x] CareerTimeline import 및 사용
  - [x] CareerTimelineSection으로 확장된 정보 표시
  - [x] 스타일 조정 (Profile 페이지 레이아웃에 맞게)
- [x] 디자인 개선
  - [x] 디자인 시스템 준수
  - [x] 반응형 레이아웃

**참고**: Archive 페이지는 별도로 존재하지 않으며, ProfilePage에서 통합 구현됨

### Subtask 6.1.4: 반응형 레이아웃 적용

- [x] 모바일 레이아웃 (< 768px)
  - [x] 모든 섹션 세로 배치
  - [x] 카드 1단 레이아웃
  - [x] 타이틀 크기 조정
- [x] 태블릿 레이아웃 (≥ 768px)
  - [x] 카드 1단 레이아웃 (넓은 카드)
  - [x] 간격 조정
- [x] 데스크톱 레이아웃 (≥ 1024px)
  - [x] 2단 레이아웃 적용 (IntroductionSection 왼쪽, CareerTimeline 오른쪽)
  - [x] topGrid 사용한 그리드 레이아웃
- [x] 브레이크포인트 동작 테스트
  - [x] 모바일 디바이스 테스트 (개발 환경)
  - [x] 태블릿 디바이스 테스트 (개발 환경)
  - [x] 데스크톱 브라우저 테스트 (개발 환경)

---

## Task 6.2: Chatbot 독립 페이지화

### Subtask 6.2.1: Chat 페이지 라우트 추가

- [ ] Chat 페이지 파일 생성
  - [ ] `frontend/src/pages/ChatPage/ChatPage.tsx` 생성
  - [ ] `frontend/src/pages/ChatPage/index.ts` 생성
- [ ] 페이지 기본 구조 구현
  - [ ] ChatHeader 컴포넌트 추가 (optional)
  - [ ] ChatMessages 영역 추가
  - [ ] ChatInput 영역 추가 (하단 고정)
- [ ] 라우팅 추가
  - [ ] `App.tsx`에 `/chat` 라우트 추가
  - [ ] 라우트 정상 동작 확인

### Subtask 6.2.2: 기존 Chatbot 컴포넌트 페이지 레이아웃으로 전환

- [ ] Chatbot 컴포넌트 분리
  - [ ] 패널 UI 제거 (슬라이드, 그림자, 애니메이션)
  - [ ] 메시지 표시 로직만 유지
  - [ ] 전체 페이지 레이아웃 적용
- [ ] ChatInputBar 재사용
  - [ ] 하단 고정 레이아웃 유지
  - [ ] 페이지 모드에서도 정상 동작 확인
- [ ] 상태 관리 업데이트
  - [ ] `isChatbotOpen` 상태 제거
  - [ ] 챗봇 메시지 상태 유지
  - [ ] AppProvider에서 불필요한 상태 제거
- [ ] 스타일 최적화
  - [ ] 디자인 시스템 토큰 사용
  - [ ] 반응형 레이아웃 적용
  - [ ] 패널 관련 스타일 완전 제거

### Subtask 6.2.3: 네비게이션 통합

- [ ] Chat 페이지 링크 추가
  - [ ] Footer에 Chat 링크 추가
  - [ ] 또는 SpeedDialFab에 Chat 링크 추가
- [ ] 랜딩 페이지 CTA 추가
  - [ ] "Chat with AI" CTA 버튼 추가 (optional)
- [ ] 라우팅 링크 동작 확인
  - [ ] TextLink 컴포넌트 사용
  - [ ] 클릭 시 `/chat` 이동 확인

### Subtask 6.2.4: 기존 패널 제거 및 링크 업데이트

- [ ] 챗봇 패널 제거
  - [ ] HomePage에서 Chatbot 패널 제거
  - [ ] ProjectDetailPage에서 Chatbot 패널 제거
  - [ ] 관련 import 제거
- [ ] 상태 관리 정리
  - [ ] `isChatbotOpen` 상태 완전 제거
  - [ ] `toggleChatbot` 함수 제거
  - [ ] AppProvider 정리
- [ ] ChatInputBar 업데이트
  - [ ] 클릭 시 챗봇 패널 열기 → `/chat` 이동으로 변경
  - [ ] 또는 ChatInputBar 제거 (Chat 페이지에서만 사용)
- [ ] SpeedDialFab 업데이트
  - [ ] 챗봇 토글 버튼 → Chat 페이지 링크로 변경
- [ ] 기능 동작 확인
  - [ ] Chat 페이지에서 챗봇 기능 정상 동작
  - [ ] 사용량 제한 표시 정상 동작
  - [ ] 메시지 입력/응답 정상 동작

---

## Task 6.3: Admin 로그인 페이지 디자인 통합

### Subtask 6.3.1: 로그인 페이지 컴포넌트 리팩토링

- [ ] 기존 로그인 페이지 확인
  - [ ] 현재 로그인 페이지 위치 확인
  - [ ] 기존 기능 동작 확인 (로그인 로직)
  - [ ] 필요한 props/state 파악
- [ ] 페이지 구조 재설계
  - [ ] 로그인 폼 컨테이너 구조 정리
  - [ ] Logo/Title 영역 추가
  - [ ] Input 필드 영역 (Username, Password)
  - [ ] Button 영역
  - [ ] Error Message 영역
- [ ] 레이아웃 구현
  - [ ] 중앙 정렬 레이아웃
  - [ ] 배경 스타일 (그라데이션 optional)
  - [ ] 반응형 레이아웃

### Subtask 6.3.2: 디자인 시스템 컴포넌트 적용

- [ ] Input 컴포넌트 생성
  - [ ] `frontend/src/design-system/components/Input/Input.tsx` 생성
  - [ ] `frontend/src/design-system/components/Input/Input.module.css` 생성
  - [ ] `frontend/src/design-system/components/Input/Input.stories.tsx` 생성
  - [ ] `frontend/src/design-system/components/Input/index.ts` 생성
- [ ] Input 컴포넌트 구현
  - [ ] Props 인터페이스 정의 (type, placeholder, value, onChange, error, disabled, fullWidth, label)
  - [ ] 기본 스타일 구현 (디자인 토큰 사용)
  - [ ] 포커스 상태 스타일
  - [ ] 에러 상태 스타일
  - [ ] 접근성 속성 추가 (aria-label, aria-invalid)
- [ ] Input Storybook 작성
  - [ ] Default 스토리
  - [ ] With Label 스토리
  - [ ] With Error 스토리
  - [ ] Disabled 스토리
  - [ ] Password Type 스토리
- [ ] AdminLoginPage에 디자인 시스템 적용
  - [ ] Input 컴포넌트 사용 (Username, Password)
  - [ ] Button 컴포넌트 사용 (Login 버튼)
  - [ ] Card 컴포넌트 사용 (optional, 폼 컨테이너)
  - [ ] 하드코딩된 스타일 제거

### Subtask 6.3.3: 브랜드 일관성 확인

- [ ] 색상 일관성 확인
  - [ ] Primary 색상 사용 (Button, Focus 상태)
  - [ ] 배경색 `--color-background` 사용
  - [ ] 에러 메시지 `--color-status-error` 사용
  - [ ] 하드코딩된 색상 없음
- [ ] 타이포그래피 일관성 확인
  - [ ] 타이틀: 디자인 시스템 Typography 토큰
  - [ ] 입력 필드: Body 텍스트 토큰
  - [ ] 에러 메시지: 적절한 폰트 크기
- [ ] 레이아웃 일관성 확인
  - [ ] Spacing 토큰 사용
  - [ ] 간격이 다른 페이지와 일관성 있음
  - [ ] 반응형 동작 확인
- [ ] 기능 동작 확인
  - [ ] 로그인 기능 정상 동작
  - [ ] 에러 처리 정상 동작
  - [ ] 유효성 검사 정상 동작

---

## Task 6.4: 네비게이션 및 라우팅 업데이트

### Subtask 6.4.1: 네비게이션 메뉴 추가

- [ ] Footer 컴포넌트 생성 (또는 기존 Footer 확장)
  - [ ] `frontend/src/widgets/Footer/Footer.tsx` 생성
  - [ ] 네비게이션 링크 영역 추가
  - [ ] 디자인 시스템 TextLink 컴포넌트 사용
- [ ] 네비게이션 링크 추가
  - [ ] Home (/) 링크
  - [ ] Profile (/profile) 링크
  - [ ] Projects (/projects) 링크
  - [ ] Chat (/chat) 링크
- [ ] Footer 스타일링
  - [ ] 디자인 시스템 토큰 사용
  - [ ] 반응형 레이아웃
  - [ ] 하단 고정 또는 페이지 하단 배치
- [ ] 모든 페이지에 Footer 추가
  - [ ] HomePage에 Footer 추가
  - [ ] ProfilePage에 Footer 추가
  - [ ] ProjectsListPage에 Footer 추가
  - [ ] ProjectDetailPage에 Footer 추가
  - [ ] ChatPage에 Footer 추가

### Subtask 6.4.2: 라우팅 구조 업데이트

- [x] App.tsx 라우팅 업데이트 (부분 완료)
  - [x] `/` → HomePage
  - [ ] `/profile` → ProfilePage 추가 **⚠️ 미완료**
  - [ ] `/projects` → ProjectsListPage (현재 없음)
  - [x] `/projects/:id` → ProjectDetailPage
  - [ ] `/chat` → ChatPage 추가 **⚠️ 미완료**
  - [ ] `/admin/login` → AdminLoginPage (별도 앱)
  - [ ] 기존 admin 라우트 유지
- [ ] 라우트 정상 동작 확인
  - [ ] 모든 라우트 접근 가능
  - [ ] 404 페이지 처리 (optional)
  - [x] 라우트 전환 시 스크롤 위치 처리 (manual 설정)

### Subtask 6.4.3: 페이지 간 이동 동선 최적화

- [ ] Home → Profile 동선
  - [ ] CTA 버튼 또는 "Learn More About Me" 링크 추가
  - [ ] 클릭 시 `/profile` 이동 확인
- [ ] Home → Chat 동선
  - [ ] "Ask AI" CTA 버튼 추가 (optional)
  - [ ] 또는 Footer 링크 사용
  - [ ] 클릭 시 `/chat` 이동 확인
- [ ] Profile → Projects 동선
  - [ ] "View My Projects" CTA 버튼 추가 (optional)
  - [ ] 또는 Footer 링크 사용
  - [ ] 클릭 시 `/projects` 이동 확인
- [ ] Projects → Chat 동선
  - [ ] "Ask about this project" 링크 추가 (optional)
  - [ ] 또는 Footer 링크 사용
- [ ] 동선 테스트
  - [ ] 모든 페이지 간 이동 원활
  - [ ] 뒤로가기 정상 동작
  - [ ] 스크롤 위치 복원 정상 동작 (필요 시)

---

## Design System Compliance Checklist

### 색상 (Color)

- [ ] 모든 색상이 CSS 변수 사용
  - [ ] ProfilePage
  - [ ] ChatPage
  - [ ] AdminLoginPage
  - [ ] Input 컴포넌트
  - [ ] Footer 컴포넌트
- [ ] 하드코딩된 색상 값 없음
- [ ] 다크 모드 자동 적용 확인

### 타이포그래피 (Typography)

- [ ] 모든 제목이 Typography 토큰 사용
- [ ] 모든 본문 텍스트가 Typography 토큰 사용
- [ ] 커스텀 폰트 크기/두께 없음

### 간격 (Spacing)

- [ ] 모든 여백이 Spacing 토큰 사용
- [ ] 임의의 px 값 없음
- [ ] 일관된 간격 체계 유지

### 컴포넌트

- [ ] 디자인 시스템 컴포넌트만 사용
  - [ ] Button
  - [ ] TextLink
  - [ ] Card
  - [ ] SectionTitle
  - [ ] Input (새로 추가)
- [ ] 디자인 시스템 외 UI 없음

---

## Testing Plan

### Manual Testing

**ProfilePage**:
- [x] Hero Section 정상 표시 - IntroductionSection 구현 ✅
- [x] Experience 목록 정상 로드 - CareerTimeline 및 ExperienceSection ✅
- [x] Education 목록 정상 로드 - CareerTimeline 및 EducationSection ✅
- [x] Certification 목록 정상 로드 - CertificationSection 추가 ✅
- [x] Career Timeline 정상 표시 - CareerTimeline 구현 ✅
- [ ] Footer 네비게이션 정상 동작 (Footer 미구현)
- [x] 반응형 레이아웃 동작 확인 ✅
- [ ] **라우팅 추가 필요** - `/profile` 라우트가 App.tsx에 없음 ⚠️

**ChatPage**:
- [ ] 챗봇 메시지 표시 정상 동작
- [ ] 채팅 입력 정상 동작
- [ ] AI 응답 정상 동작
- [ ] 사용량 제한 표시 정상 동작
- [ ] Footer 네비게이션 정상 동작

**AdminLoginPage**:
- [ ] 로그인 폼 정상 표시
- [ ] Username 입력 정상 동작
- [ ] Password 입력 정상 동작
- [ ] 로그인 버튼 정상 동작
- [ ] 로그인 성공 시 리다이렉트 확인
- [ ] 로그인 실패 시 에러 메시지 표시

**Navigation**:
- [ ] Footer 모든 링크 정상 동작
- [ ] Home → Profile 이동 확인
- [ ] Home → Chat 이동 확인
- [ ] Profile → Projects 이동 확인
- [ ] Projects → Chat 이동 확인
- [ ] 뒤로가기 정상 동작

**Responsive**:
- [ ] 모바일 (iPhone SE, iPhone 12 Pro) 테스트
- [ ] 태블릿 (iPad, iPad Pro) 테스트
- [ ] 데스크톱 (1280px, 1920px) 테스트

**Accessibility**:
- [ ] 키보드 네비게이션 정상 동작
- [ ] Input 포커스 상태 확인
- [ ] 스크린 리더 호환성 확인 (기본)

### Browser Testing

- [ ] Chrome (최신) 테스트
- [ ] Firefox (최신) 테스트
- [ ] Safari (최신) 테스트
- [ ] Edge (최신) 테스트

---

## Performance Checklist

**Page Load**:
- [ ] ProfilePage: < 3초 (API 로드 포함)
- [ ] ChatPage: < 3초
- [ ] AdminLoginPage: < 2초

**Optimization**:
- [ ] 이미지 최적화 (lazy loading)
- [ ] 코드 분할 (React.lazy) 적용
- [ ] 번들 크기 확인

---

## Definition of Done

### Task 6.1: Profile 페이지 ✅ **완료**
- [x] Profile 페이지 구조 구현 완료
- [x] ExperienceSection, EducationSection 새롭게 구현 완료 (CareerCard로 통합)
- [x] CareerTimeline/CareerTimelineSection 통합 완료
- [x] 반응형 레이아웃 동작 확인
- [x] 디자인 시스템 외 스타일 사용 없음
- [x] API 연동 및 로딩 상태 처리

**완료일**: 2026-01-07
**구현 내용**:
- IntroductionSection: 자기소개, 연락처 정보
- CareerTimeline: 경력/교육 통합 타임라인
- CareerTimelineSection: 상세 경력/교육 정보 카드
- ExperienceSection/EducationSection: 개별 섹션 컴포넌트
- CertificationSection: 자격증 섹션 추가
- CareerCard: 통합 카드 컴포넌트
- PageLayout 사용으로 일관된 레이아웃
- 디자인 시스템 완전 준수

### Task 6.2: Chatbot 페이지
- [ ] `/chat` 라우트 추가 완료
- [ ] Chat 페이지 구현 완료
- [ ] 기존 챗봇 패널 제거 완료
- [ ] ChatInputBar 업데이트 완료 (또는 제거)
- [ ] 챗봇 기능 정상 동작 확인

### Task 6.3: Admin 로그인 페이지
- [ ] Input 컴포넌트 생성 및 Storybook 작성
- [ ] AdminLoginPage 리팩토링 완료
- [ ] 디자인 시스템 컴포넌트 적용 완료
- [ ] 브랜드 일관성 확인 (색상, 타이포그래피, 간격)
- [ ] 로그인 기능 정상 동작 확인

### Task 6.4: 네비게이션 및 라우팅
- [ ] Footer 네비게이션 추가 완료
- [ ] 모든 라우트 정상 동작 확인
- [ ] 페이지 간 이동 동선 최적화 완료

### 전체 검증
- [x] ProfilePage 디자인 시스템 준수 확인 ✅
- [ ] ChatPage 디자인 시스템 준수 확인 (미구현)
- [ ] AdminLoginPage 디자인 시스템 준수 확인 (미구현)
- [ ] Design System Compliance Checklist 부분 완료 (ProfilePage만)
- [ ] Manual Testing 체크리스트 부분 완료 (ProfilePage만)
- [ ] Browser Testing 체크리스트 부분 완료 (ProfilePage만)
- [ ] Performance Checklist 부분 확인 (ProfilePage만)

---

**작성일**: 2026-01-06
**참고 문서**: [phase-6-design.md](./phase-6-design.md)
**다음 문서**: [phase-6-completion.md](./phase-6-completion.md) (완료 후 작성)
