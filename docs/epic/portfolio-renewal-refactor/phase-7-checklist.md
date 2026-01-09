# Phase 7 — Cleanup & System Consolidation 체크리스트

**작성일**: 2026-01-09  
**최종 업데이트**: 2026-01-09  
**참고 문서**: [phase-7-design.md](./phase-7-design.md)  
**상태**: 🟡 진행 중 (대부분 완료, 최종 검증 남음)

---

## Task 7.1: Phase 6 남은 작업 완료

### Subtask 7.1.1: HomePage Chatbot 패널 제거
- [x] HomePage.tsx에서 Chatbot 컴포넌트 import 제거
- [x] HomePage.tsx에서 Chatbot 컴포넌트 사용 제거
- [x] isChatbotOpen 관련 상태 및 로직 제거
- [x] ChatInputBar 클릭 시 `/chat` 페이지로 이동하도록 변경
- [x] 동작 테스트 (기본 동작 확인 완료)

### Subtask 7.1.2: AppProvider 상태 정리
- [x] isChatbotOpen 상태 정의 위치 확인
- [x] isChatbotOpen 상태 제거
- [x] setChatbotOpen 함수 제거
- [x] 관련 Context 정리
- [x] MainApp.tsx에서 관련 로직 제거

### Subtask 7.1.3: Footer 네비게이션 추가
- [x] Footer 컴포넌트에 네비게이션 섹션 추가 (사용자 요청으로 제거됨)
- [x] Home (/) 링크 추가 (제거됨)
- [x] Profile (/profile) 링크 추가 (제거됨)
- [x] Projects (/projects) 링크 추가 (제거됨)
- [x] Chat (/chat) 링크 추가 (제거됨)
- [x] TextLink 컴포넌트 사용 (제거됨)
- [x] 스타일 적용 (Footer.module.css) (제거됨)
- [x] 반응형 레이아웃 확인 (불필요)

---

## Task 7.2: 중복 컴포넌트 통합 및 제거

### Subtask 7.2.1: shared/ui 중복 컴포넌트 제거
- [x] `shared/ui/skeleton/SkeletonCard.tsx` 사용처 확인
- [x] 사용처에서 design-system/components/Skeleton으로 import 변경 (SkeletonCard는 이미 design-system 사용 중)
- [ ] `shared/ui/skeleton/` 폴더 제거 (SkeletonSection은 특화 컴포넌트로 유지 필요)
- [x] `shared/ui/tooltip/Tooltip.tsx` 사용처 확인
- [x] 사용처에서 design-system/components/Tooltip으로 import 변경
- [x] `shared/ui/tooltip/` 폴더 제거
- [x] `shared/ui/index.ts` 업데이트 (skeleton은 별도 export 없음)

### Subtask 7.2.2: features/project-gallery 레거시 컴포넌트 정리
- [x] ProjectCard.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용)
- [x] ExperienceCard.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용)
- [x] EducationCard.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용)
- [x] CertificationCard.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용)
- [x] ProjectFilter.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용)
- [x] HistoryPanel.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용, export됨)
- [x] PanelToggle.tsx 사용 여부 확인 (PortfolioSection 내부에서만 사용, export됨)
- [x] PortfolioSection.tsx 사용 여부 확인 (HomePage에서 사용 중)
- [x] 미사용 컴포넌트 제거 (모두 사용 중이므로 유지)
- [x] index.ts 업데이트 (현재 상태 유지)

### Subtask 7.2.3: features/chatbot 정리
- [x] Chatbot.tsx 사용 여부 확인 (미사용)
- [x] ChatMessage.tsx 사용 여부 확인 (ChatPage에서 사용 중)
- [x] 미사용 컴포넌트 제거 (Chatbot.tsx 삭제)
- [x] 서비스/유틸은 유지 확인 (ChatbotService, questionValidator 유지)
- [x] index.ts 업데이트 (Chatbot export 제거)

### Subtask 7.2.4: LoadingScreen/LoadingState 통합 검토
- [ ] LoadingScreen 사용처 확인
- [ ] LoadingState 사용처 확인
- [ ] Spinner 사용처 확인
- [ ] 역할 구분 명확화 또는 통합 결정
- [ ] 결정에 따른 작업 수행

---

## Task 7.3: 컬러 시스템 정리

### Subtask 7.3.1: 하드코딩 컬러 제거 (우선순위 중간)
- [x] TechStackBadge.tsx 열기
- [x] `hover:border-[#7FAF8A]` 찾기
- [x] Tailwind 설정 확인 (primary 색상 정의 여부)
- [x] CSS 변수 또는 Tailwind 클래스로 교체
- [x] 동작 테스트 (기본 동작 확인 완료)

### Subtask 7.3.2: 스토리북 하드코딩 컬러 정리 (선택)
- [ ] Tokens.stories.tsx 하드코딩 컬러 정리
- [ ] SocialIcon.stories.tsx 하드코딩 컬러 정리
- [ ] ProjectIcon.stories.tsx 하드코딩 컬러 정리
- [ ] Card.stories.tsx 하드코딩 컬러 정리
- [ ] Button.stories.tsx 하드코딩 컬러 정리
- [ ] Badge.stories.tsx 하드코딩 컬러 정리

### Subtask 7.3.3: globals.css 정리
- [ ] 미사용 CSS 변수 식별
- [ ] 중복 정의 정리
- [ ] 다크 모드 변수 일관성 확인
- [ ] 정리된 내용 문서화

---

## Task 7.4: 스토리북 정리

### Subtask 7.4.1: 누락된 스토리 작성 (선택)
- [ ] Input.stories.tsx 작성
- [ ] Modal.stories.tsx 작성
- [ ] Text.stories.tsx 작성
- [ ] Spinner.stories.tsx 작성

### Subtask 7.4.2: 스토리북 정리
- [ ] 미사용/레거시 스토리 확인
- [ ] 스토리 카테고리 정리
- [ ] 스토리북 설정 파일 정리
- [ ] 스토리북 빌드 테스트

---

## Task 7.5: 폴더 구조 통합 (3-Folder Architecture) ⭐ 최우선

### Subtask 7.5.1: pages/ 폴더 통합
- [x] `src/main/pages/` 현재 내용 확인
- [x] `src/pages/ChatPage/` → `src/main/pages/ChatPage/` 이동 (이미 완료)
- [x] `src/pages/HomePage/` → `src/main/pages/HomePage/` 이동 (이미 완료)
- [x] `src/pages/ProfilePage/` → `src/main/pages/ProfilePage/` 이동 (이미 완료)
- [x] `src/pages/ProjectDetailPage/` → `src/main/pages/ProjectDetailPage/` 이동 (이미 완료)
- [x] `src/pages/ProjectsListPage/` → `src/main/pages/ProjectsListPage/` 이동 (중복 파일 삭제 완료)
- [x] 모든 import 경로 업데이트 (이미 완료)
- [x] `src/pages/` 폴더 삭제 (이미 완료)

### Subtask 7.5.2: widgets/ 폴더 통합 ✅ 완료
- [x] `src/main/layout/` 현재 내용 확인
- [x] `src/main/layout/` → `src/main/widgets/` 이동 (FSD 구조 적용)
  - [x] Header → `main/widgets/header/ui/`
  - [x] Footer → `main/widgets/footer/ui/`
  - [x] HomePageLayout → `main/widgets/home-page-layout/ui/`
  - [x] PageLayout → `main/widgets/page-layout/ui/`
- [x] HomePage 섹션들도 `main/widgets/`로 이동
  - [x] HeroSection → `main/widgets/hero-section/ui/`
  - [x] AboutSection1, AboutSection2 → `main/widgets/about-section/ui/`
  - [x] FeaturedProjectsSection → `main/widgets/featured-projects-section/ui/`
  - [x] CTASection → `main/widgets/cta-section/ui/`
- [x] 모든 import 경로 업데이트 (`@/main/widgets/*`)
- [x] `src/main/layout/` 디렉토리 제거
- [x] `src/widgets/` 디렉토리 제거 (이미 `main/widgets/`로 이동 완료)

### Subtask 7.5.3: shared/ 폴더 통합
- [x] `src/main/shared/` 현재 내용 확인
- [x] 중복 파일 식별
- [x] `src/main/shared/` → `src/shared/` 이동 (admin과 main이 공통 사용)
- [x] 모든 import 경로 업데이트 (`@/shared` 또는 `../../shared`)
- [x] `main.tsx`, `MainApp.tsx`, `ChatPage.tsx` 등 주요 파일 수정
- [x] `admin/` 폴더의 import 경로 수정
- [ ] 빌드 테스트 및 오류 수정

### Subtask 7.5.4: features/ 폴더 통합
- [x] `src/main/features/` 현재 내용 확인
- [x] `src/features/chatbot/` → `src/main/features/chatbot/` 통합 (이미 완료)
- [x] `src/features/easter-eggs/` → `src/main/features/easter-eggs/` 통합 (이미 완료)
- [x] `src/features/introduction/` 사용 여부 확인 후 결정 (HeroSection에서 사용 중, 유지)
- [x] `src/features/project-gallery/` 사용 여부 확인 후 결정 (여러 곳에서 사용 중, 유지)
- [x] 모든 import 경로 업데이트 (이미 완료)
- [x] `src/features/` 폴더 삭제 (이미 완료)

### Subtask 7.5.5: entities/, hooks/, app/ 폴더 통합
- [x] `src/entities/` → `src/main/entities/` 통합 (이미 완료)
- [x] `src/hooks/` → `src/main/hooks/` 통합 (이미 완료)
- [x] `src/app/` → `src/main/app/` 통합 (빈 폴더 삭제 완료)
- [x] 모든 import 경로 업데이트 (이미 완료)
- [x] 삭제 완료

### Subtask 7.5.6: 미사용 폴더/파일 제거
- [x] stories/assets/ 사용 여부 확인 (미사용, Storybook 기본 예제용으로 유지)
- [x] 빈 폴더 제거 (widgets/, app/ 폴더 삭제 완료)
- [x] features/introduction/ 사용 여부 확인 (HeroSection에서 사용 중, 유지)
- [x] features/project-gallery/ 사용 여부 확인 (여러 곳에서 사용 중, 유지)
- [x] 미사용 파일/폴더 제거 (Chatbot.tsx 삭제 완료)

### Subtask 7.5.7: index.ts 및 경로 별칭 정리
- [ ] design-system/index.ts 정리
- [ ] design-system/components/index.ts 정리
- [ ] main/shared/index.ts 정리
- [ ] main/features/index.ts 정리
- [ ] 순환 참조 확인
- [ ] tsconfig.json 경로 별칭 업데이트 (필요 시)
- [ ] vite.config.ts 경로 별칭 업데이트 (필요 시)

---

## Task 7.6: 최종 검증

### Subtask 7.6.1: 빌드 및 린트 검증
- [ ] `npm run build` 성공
- [ ] `npm run lint` 에러 없음
- [ ] `npm run type-check` 에러 없음 (있는 경우)

### Subtask 7.6.2: 스토리북 빌드 검증
- [ ] `npm run storybook:build` 성공

### Subtask 7.6.3: 기능 테스트
- [ ] 홈페이지 정상 렌더링
- [ ] 프로필 페이지 정상 렌더링
- [ ] 프로젝트 목록 정상 렌더링
- [ ] 프로젝트 상세 정상 렌더링
- [ ] 챗 페이지 정상 렌더링
- [ ] Admin 로그인 정상 동작
- [ ] 다크 모드 전환 정상 동작
- [ ] 반응형 레이아웃 정상 동작

---

## 완료 조건

- [x] **frontend/src가 admin, design-system, main 3개 폴더로 정리됨** (완료)
- [x] **모든 import 경로가 새 구조에 맞게 업데이트됨** (완료)
- [x] Phase 6 남은 작업 모두 완료 (완료)
- [x] 중복 컴포넌트가 제거되고 design-system으로 통합됨 (완료)
- [x] 하드코딩된 컬러가 디자인 시스템 토큰으로 교체됨 (TechStackBadge 완료)
- [x] 미사용 파일/폴더가 제거됨 (Chatbot.tsx, 빈 폴더들 제거 완료)
- [ ] 빌드 및 린트 에러 없음 (최종 검증 필요)
- [ ] 모든 페이지 정상 동작 확인 (최종 검증 필요)
- [ ] 스토리북 빌드 성공 (최종 검증 필요)

---

## 진행 기록

| 날짜 | 작업 내용 | 상태 |
|------|-----------|------|
| 2026-01-09 | Phase 7 설계 문서 작성 | ✅ 완료 |
| 2026-01-09 | Phase 7 설계 문서 작성 | ✅ 완료 |
| 2026-01-09 | Task 7.1.1: HomePage Chatbot 패널 제거 | ✅ 완료 |
| 2026-01-09 | Task 7.1.2: AppProvider 상태 정리 (isChatbotOpen 제거) | ✅ 완료 |
| 2026-01-09 | Task 7.1.3: Footer 네비게이션 추가 | ✅ 완료 |
| 2026-01-09 | Task 7.2.1: shared/ui/tooltip 제거 | ✅ 완료 |
| 2026-01-09 | Task 7.3.1: TechStackBadge 하드코딩 컬러 제거 | ✅ 완료 |
| 2026-01-09 | Task 7.5.1, 7.5.2: 중복 파일 삭제 (pages/, widgets/) | ✅ 완료 |
| 2026-01-09 | Tooltip border 스타일 수정 (배경색과 동일한 border 추가) | ✅ 완료 |
| 2026-01-09 | Task 7.2.1: shared/ui/skeleton 정리 (SkeletonSection 유지) | ✅ 완료 |
| 2026-01-09 | Task 7.2.2: features/project-gallery 컴포넌트 확인 (모두 사용 중) | ✅ 완료 |
| 2026-01-09 | Task 7.2.3: features/chatbot 정리 (Chatbot.tsx 제거) | ✅ 완료 |
| 2026-01-09 | Task 7.5.6: 빈 폴더 정리 (widgets/ 폴더 삭제) | ✅ 완료 |
| 2026-01-09 | 이스터에그 관련 파일 정리 (INTEGRATION.md 업데이트) | ✅ 완료 |
| 2026-01-09 | 이스터에그를 ChatPage로만 제한 (MainApp, HomePage 등에서 제거) | ✅ 완료 |
| 2026-01-09 | 이스터에그 UI 요소 제거 (AudioIndicator, EasterEggListPanel export 제거) | ✅ 완료 |
| 2026-01-09 | src/app 빈 폴더 삭제 | ✅ 완료 |
| 2026-01-09 | 프로필 페이지 API 수정 (certification, experience API 경로 수정) | ✅ 완료 |
| 2026-01-09 | 푸터 네비게이션 메뉴 제거 (원래 상태로 복원) | ✅ 완료 |
| 2026-01-09 | FSD 리팩토링: shared 레이어 통합 (Phase 1) | ✅ 완료 |
| 2026-01-09 | FSD 리팩토링: widgets 레이어 생성 및 이동 (Phase 2.1, 2.2) | ✅ 완료 |
| 2026-01-09 | FSD 리팩토링: entities/techstack 제거 (Phase 4) | ✅ 완료 |
| 2026-01-09 | widgets를 src/main/widgets로 이동 (일관성 유지) | ✅ 완료 |
| | | |

---

## 참고 문서

- [Phase 7 설계 문서](./phase-7-design.md)
- [Phase 6 완료 보고서](./phase-6-completion.md)
- [Phase 3 디자인 시스템](./phase-3-design.md)
