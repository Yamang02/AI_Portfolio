# Phase 6 — Profile & Chat Pages + Admin Login Design

**작성일**: 2026-01-06
**목표**: Profile 페이지 추가, Chatbot 독립 페이지화, Admin 로그인 페이지 디자인 시스템 통합
**상태**: 📝 설계 중

---

## 목표 (Goals)

Phase 6에서는 다음을 목표로 합니다:

1. **Profile 페이지 생성**
   - main 디렉토리의 경력(Experience), 교육(Education) 데이터 구조 참고
   - 히스토리 패널의 타임라인 구조 활용
   - 디자인 시스템 기반으로 새롭게 구현
   - 개발자 프로필 중심의 구조화된 페이지

2. **Chatbot 독립 페이지화**
   - 현재 패널로 존재하는 챗봇을 별도 페이지로 분리
   - 독립적인 라우트 제공 (`/chat`)
   - 더 나은 사용자 경험 제공

3. **Admin 로그인 페이지 디자인 통합**
   - 현재 admin 로그인 페이지를 새로운 디자인 시스템에 맞게 리뉴얼
   - admin 내부 관리 페이지는 제외 (로그인 페이지만)

---

## Global Constraints (중요)

```text
- 디자인은 최소화한다
- 새로운 기능을 만들지 않는다 (기존 기능의 재배치)
- 기존 기능은 필요 시 제거한다
- 디자인 시스템을 벗어난 UI 추가 금지
- Phase 5에서 구축한 디자인 시스템만 사용
```

---

## 작업 범위 (Scope)

### In Scope

✅ **Profile 페이지**
- 경력(Experience) 섹션
- 교육(Education) 섹션
- 프로젝트 히스토리 타임라인
- Contact 정보 (optional)

✅ **Chatbot 페이지**
- 독립 페이지로 분리 (`/chat`)
- 기존 챗봇 기능 유지
- 페이지 레이아웃 최적화

✅ **Admin 로그인 페이지**
- 디자인 시스템 Button, Input 컴포넌트 적용
- 브랜드 일관성 유지
- 반응형 디자인

### Out of Scope

❌ **Admin 관리 페이지**
- 내부 관리 페이지들은 이번 리뉴얼 범위에서 제외
- 로그인 후 진입하는 관리 UI는 기존 유지

❌ **새로운 기능 추가**
- Profile 페이지는 기존 데이터만 표시
- Chatbot 기능 확장 없음

---

## Task 구조

```text
Task 6.1: Profile 페이지 구현
  ├─ Subtask 6.1.1: Profile 페이지 구조 설계
  ├─ Subtask 6.1.2: Experience/Education 섹션 구현
  ├─ Subtask 6.1.3: 프로젝트 히스토리 타임라인 통합
  └─ Subtask 6.1.4: 반응형 레이아웃 적용

Task 6.2: Chatbot 독립 페이지화
  ├─ Subtask 6.2.1: Chat 페이지 라우트 추가
  ├─ Subtask 6.2.2: 기존 Chatbot 컴포넌트 페이지 레이아웃으로 전환
  ├─ Subtask 6.2.3: 네비게이션 통합
  └─ Subtask 6.2.4: 기존 패널 제거 및 링크 업데이트

Task 6.3: Admin 로그인 페이지 디자인 통합
  ├─ Subtask 6.3.1: 로그인 페이지 컴포넌트 리팩토링
  ├─ Subtask 6.3.2: 디자인 시스템 컴포넌트 적용
  └─ Subtask 6.3.3: 브랜드 일관성 확인

Task 6.4: 네비게이션 및 라우팅 업데이트
  ├─ Subtask 6.4.1: 네비게이션 메뉴 추가 (Profile, Chat)
  ├─ Subtask 6.4.2: 라우팅 구조 업데이트
  └─ Subtask 6.4.3: 페이지 간 이동 동선 최적화
```

---

## Task 6.1: Profile 페이지 구현

### 목표

기존의 경력(Experience), 교육(Education) 데이터와 히스토리 패널의 타임라인을 활용하여 개발자 프로필 페이지를 생성합니다.

### Subtask 6.1.1: Profile 페이지 구조 설계

**페이지 구조**:

```
/profile

[ProfilePage]
  ├─ Hero Section (간단한 소개)
  │   ├─ 이름
  │   ├─ 직책
  │   └─ 간단한 한 줄 소개
  │
  ├─ Experience Section
  │   ├─ SectionTitle ("Experience")
  │   └─ Experience Cards (디자인 시스템 기반 새 구현)
  │
  ├─ Education Section
  │   ├─ SectionTitle ("Education")
  │   └─ Education Cards (디자인 시스템 기반 새 구현)
  │
  ├─ Project History Timeline Section
  │   ├─ SectionTitle ("Project History")
  │   └─ ProjectHistoryTimeline (Archive 페이지의 타임라인 재사용)
  │
  └─ Footer
```

**와이어프레임 레퍼런스**:
- Phase 4의 와이어프레임 구조 참고
- 단순하고 명확한 정보 계층

**정보 우선순위**:
1. Experience (가장 중요)
2. Education
3. Project History Timeline

### Subtask 6.1.2: Experience/Education 섹션 구현

**참고할 기존 구조** (main 디렉토리):
```
frontend/src/main/features/projects/components/
  ├─ ExperienceCard.tsx
  └─ EducationCard.tsx
```

**구현 전략**:

1. **디자인 시스템 기반 새 컴포넌트 생성**
   - 위치: `frontend/src/pages/ProfilePage/components/`
   - `ExperienceSection.tsx`: Experience 목록 표시
   - `EducationSection.tsx`: Education 목록 표시
   - main의 기존 컴포넌트는 데이터 구조와 레이아웃만 참고

2. **컴포넌트 구성 요소**
   - Card 컴포넌트 사용 (디자인 시스템)
   - SectionTitle 컴포넌트 사용
   - 디자인 토큰만 사용하여 스타일링

3. **API 연동**
   - `useExperiencesQuery()` 훅 사용
   - `useEducationQuery()` 훅 사용
   - 로딩 상태 및 에러 처리

**컴포넌트 요구사항**:
- ✅ 디자인 시스템 토큰만 사용
- ✅ Card 컴포넌트 기반 레이아웃
- ✅ 반응형 디자인
- ✅ 불필요한 인터랙션 제거 (하이라이트, 호버 등)

### Subtask 6.1.3: 프로젝트 히스토리 타임라인 통합

**기존 타임라인 위치**:
```
frontend/src/pages/ProjectsListPage/components/ProjectHistoryTimeline.tsx
```

**재사용 전략**:

1. **컴포넌트 공유**
   - `ProjectHistoryTimeline`을 `widgets` 레이어로 이동
   - Archive 페이지와 Profile 페이지에서 공유
   - 위치: `frontend/src/widgets/ProjectHistoryTimeline/`

2. **스타일 조정**
   - Profile 페이지 레이아웃에 맞게 스타일 조정
   - 타임라인 높이/너비 최적화

**컴포넌트 props**:
```typescript
interface ProjectHistoryTimelineProps {
  projects: Project[];
  variant?: 'default' | 'compact'; // Profile에서는 compact 사용
  showTitle?: boolean; // Profile에서는 SectionTitle 따로 표시
}
```

### Subtask 6.1.4: 반응형 레이아웃 적용

**브레이크포인트**:
- Mobile: 기본 (< 768px) - 1단 레이아웃
- Tablet: `md:` (≥ 768px) - 1단 레이아웃 (넓은 카드)
- Desktop: `lg:` (≥ 1024px) - 2단 레이아웃 (타임라인 옆에 표시)

**레이아웃 전략**:
- 모바일: 모든 섹션 세로 배치
- 데스크톱: Experience/Education 왼쪽, Timeline 오른쪽 (optional)

---

## Task 6.2: Chatbot 독립 페이지화

### 목표

현재 우측 슬라이드 패널로 존재하는 챗봇을 독립 페이지로 분리하여 더 나은 사용자 경험을 제공합니다.

### Subtask 6.2.1: Chat 페이지 라우트 추가

**라우팅 구조**:
```typescript
// App.tsx
<Route path="/chat" element={<ChatPage />} />
```

**페이지 구조**:
```
/chat

[ChatPage]
  ├─ ChatHeader (optional)
  │   ├─ 타이틀 ("AI Portfolio Assistant")
  │   └─ 사용량 표시
  │
  ├─ ChatMessages (메인 영역)
  │   └─ 기존 ChatMessage 컴포넌트 재사용
  │
  └─ ChatInput (하단 고정)
      └─ 기존 ChatInputBar 컴포넌트 재사용
```

### Subtask 6.2.2: 기존 Chatbot 컴포넌트 페이지 레이아웃으로 전환

**기존 Chatbot 컴포넌트 위치**:
```
frontend/src/features/chatbot/components/Chatbot.tsx
frontend/src/main/shared/ui/ChatInputBar.tsx
```

**전환 전략**:

1. **컴포넌트 분리**
   - `Chatbot.tsx`: 패널 UI 제거, 메시지 표시 로직만 유지
   - `ChatInputBar.tsx`: 재사용 (하단 고정 레이아웃)

2. **레이아웃 최적화**
   - 패널 스타일 제거 (슬라이드, 그림자 등)
   - 전체 페이지 레이아웃 적용
   - 디자인 시스템 토큰 사용

3. **상태 관리**
   - 기존 `isChatbotOpen` 상태 제거 (페이지이므로 불필요)
   - 챗봇 메시지 상태는 유지

### Subtask 6.2.3: 네비게이션 통합

**네비게이션 추가**:
- 헤더 또는 SpeedDialFab에 "Chat" 링크 추가
- 랜딩 페이지에서 Chat 페이지로 이동하는 CTA 추가

**라우팅 링크**:
```typescript
<TextLink to="/chat">Chat with AI</TextLink>
```

### Subtask 6.2.4: 기존 패널 제거 및 링크 업데이트

**제거 대상**:
- ✅ 우측 슬라이드 패널 (Chatbot 컴포넌트)
- ✅ `isChatbotOpen` 상태 및 관련 로직
- ✅ SpeedDialFab의 챗봇 토글 버튼 → Chat 페이지 링크로 변경

**업데이트 대상**:
- ✅ ChatInputBar 클릭 시 챗봇 패널 열기 → `/chat` 페이지로 이동
- ✅ HomePage, ProjectDetailPage에서 챗봇 패널 제거

---

## Task 6.3: Admin 로그인 페이지 디자인 통합

### 목표

현재 admin 로그인 페이지를 새로운 디자인 시스템에 맞게 리뉴얼합니다.

### Subtask 6.3.1: 로그인 페이지 컴포넌트 리팩토링

**기존 로그인 페이지 위치** (추정):
```
frontend/src/admin/pages/LoginPage.tsx (또는 유사한 경로)
```

**페이지 구조**:
```
/admin/login

[AdminLoginPage]
  ├─ Login Form Container
  │   ├─ Logo/Title
  │   ├─ Input (Username)
  │   ├─ Input (Password)
  │   ├─ Button (Login)
  │   └─ Error Message (optional)
  │
  └─ Background (선택 사항: 그라데이션)
```

### Subtask 6.3.2: 디자인 시스템 컴포넌트 적용

**적용할 디자인 시스템 컴포넌트**:

1. **Button 컴포넌트**
   - 로그인 버튼: `<Button variant="primary" size="large">Login</Button>`

2. **Input 컴포넌트** (새로 추가 필요)
   - Username, Password 입력 필드
   - 위치: `frontend/src/design-system/components/Input/`
   - Props: `type`, `placeholder`, `value`, `onChange`, `error`

3. **Card 컴포넌트** (선택 사항)
   - 로그인 폼을 Card로 감싸기
   - `<Card variant="elevated" padding="large">`

**Input 컴포넌트 정의** (Task 6.3에서 추가):

```typescript
interface InputProps {
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}
```

**Input 컴포넌트 스타일**:
- 디자인 토큰 사용 (color, spacing, typography)
- 포커스 상태, 에러 상태 지원
- 접근성 (aria-label, aria-invalid)

### Subtask 6.3.3: 브랜드 일관성 확인

**색상 일관성**:
- Primary 색상 사용 (Button, Focus 상태)
- 배경색은 `--color-background` 사용
- 에러 메시지는 `--color-status-error` 사용

**타이포그래피 일관성**:
- 타이틀: 디자인 시스템 타이포그래피 토큰
- 입력 필드: Body 텍스트 토큰

**레이아웃 일관성**:
- Spacing 토큰 사용
- 중앙 정렬 레이아웃
- 반응형 디자인 (모바일/데스크톱)

---

## Task 6.4: 네비게이션 및 라우팅 업데이트

### 목표

새로운 페이지들을 위한 네비게이션과 라우팅을 추가합니다.

### Subtask 6.4.1: 네비게이션 메뉴 추가

**네비게이션 구조** (전역 헤더 또는 Footer):

```
[Navigation]
  ├─ Home (/)
  ├─ Profile (/profile)
  ├─ Projects (/projects)
  └─ Chat (/chat)
```

**구현 위치**:
- 옵션 1: 전역 헤더 추가 (모든 페이지에 표시)
- 옵션 2: Footer에 네비게이션 링크 추가
- 옵션 3: SpeedDialFab에 페이지 링크 추가

**권장**: Footer에 간단한 네비게이션 링크 추가 (디자인 최소화 원칙)

### Subtask 6.4.2: 라우팅 구조 업데이트

**업데이트된 라우팅**:

```typescript
// App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/projects" element={<ProjectsListPage />} />
  <Route path="/projects/:id" element={<ProjectDetailPage />} />
  <Route path="/chat" element={<ChatPage />} />
  <Route path="/admin/login" element={<AdminLoginPage />} />
  {/* 기존 admin 라우트 유지 */}
</Routes>
```

### Subtask 6.4.3: 페이지 간 이동 동선 최적화

**주요 동선**:

1. **Home → Profile**
   - CTA 버튼 또는 "Learn More About Me" 링크

2. **Home → Chat**
   - ChatInputBar 클릭 시 `/chat`으로 이동
   - 또는 "Ask AI" CTA 버튼

3. **Profile → Projects**
   - "View My Projects" CTA 버튼

4. **Projects → Chat**
   - "Ask about this project" 링크

**Footer 네비게이션 추가**:
- 모든 페이지 하단에 Footer 컴포넌트 추가
- Home, Profile, Projects, Chat 링크 제공

---

## 새로운 디자인 시스템 컴포넌트

Phase 6에서 추가가 필요한 디자인 시스템 컴포넌트:

### Input 컴포넌트

**위치**: `frontend/src/design-system/components/Input/`

**파일 구조**:
```
Input/
  ├─ Input.tsx
  ├─ Input.module.css
  ├─ Input.stories.tsx
  └─ index.ts
```

**Props**:
```typescript
interface InputProps {
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
}
```

**특징**:
- 디자인 토큰 사용
- 포커스/에러 상태 스타일
- 접근성 지원 (aria-label, aria-invalid)

---

## Definition of Done (DoD)

### Task 6.1: Profile 페이지
- [ ] Profile 페이지 구조 구현 완료
- [ ] ExperienceSection, EducationSection 새롭게 구현 완료
- [ ] ProjectHistoryTimeline 통합 완료
- [ ] 반응형 레이아웃 동작 확인
- [ ] 디자인 시스템 외 스타일 사용 없음
- [ ] API 연동 및 로딩 상태 처리

### Task 6.2: Chatbot 페이지
- [ ] `/chat` 라우트 추가 완료
- [ ] Chat 페이지 구현 완료
- [ ] 기존 챗봇 패널 제거 완료
- [ ] ChatInputBar 클릭 시 `/chat` 이동 동작 확인
- [ ] 챗봇 기능 정상 동작 확인

### Task 6.3: Admin 로그인 페이지
- [ ] Input 컴포넌트 생성 및 Storybook 작성
- [ ] AdminLoginPage 리팩토링 완료
- [ ] 디자인 시스템 컴포넌트 적용 완료
- [ ] 브랜드 일관성 확인 (색상, 타이포그래피, 간격)
- [ ] 로그인 기능 정상 동작 확인

### Task 6.4: 네비게이션 및 라우팅
- [ ] 네비게이션 메뉴 추가 (Footer 또는 Header)
- [ ] 모든 라우트 정상 동작 확인
- [ ] 페이지 간 이동 동선 최적화 완료

### 전체 검증
- [ ] 모든 페이지 디자인 시스템 준수 확인
- [ ] 반응형 레이아웃 동작 확인 (모바일/태블릿/데스크톱)
- [ ] 브라우저 호환성 테스트 (Chrome, Firefox, Safari)
- [ ] 접근성 확인 (키보드 네비게이션, 스크린 리더)

---

## Performance Targets

- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

**최적화 전략**:
- 기존 컴포넌트 재사용으로 번들 크기 최소화
- React.lazy()로 페이지별 코드 분할
- 이미지 lazy loading 적용

---

## 참고 문서

- [Phase 5 완료 보고서](./phase-5-completion.md)
- [Phase 3 디자인 시스템](./phase-3-design.md)
- [Phase 4 와이어프레임](./phase-4-design.md)
- [Current State Snapshot](./current-state.md)
- [Epic README](./README.md)

---

## 다음 단계 (Phase 7)

Phase 6 완료 후:

1. **Cut & Validation** (원래 Phase 6)
   - 불필요한 요소 제거
   - 최종 사용자 테스트
   - Performance 최적화

2. **최종 배포 준비**
   - 프로덕션 빌드 최적화
   - SEO 메타 태그 추가
   - 배포 전 최종 검토

---

**작성일**: 2026-01-06
**다음 문서**: [phase-6-checklist.md](./phase-6-checklist.md)
