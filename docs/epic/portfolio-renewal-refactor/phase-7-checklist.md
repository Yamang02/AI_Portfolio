# Phase 7 — Cleanup & System Consolidation 체크리스트

**작성일**: 2026-01-09  
**참고 문서**: [phase-7-design.md](./phase-7-design.md)  
**상태**: 🔲 시작 전

---

## Task 7.1: Phase 6 남은 작업 완료

### Subtask 7.1.1: HomePage Chatbot 패널 제거
- [ ] HomePage.tsx에서 Chatbot 컴포넌트 import 제거
- [ ] HomePage.tsx에서 Chatbot 컴포넌트 사용 제거
- [ ] isChatbotOpen 관련 상태 및 로직 제거
- [ ] ChatInputBar 클릭 시 `/chat` 페이지로 이동하도록 변경
- [ ] 동작 테스트

### Subtask 7.1.2: AppProvider 상태 정리
- [ ] isChatbotOpen 상태 정의 위치 확인
- [ ] isChatbotOpen 상태 제거
- [ ] setChatbotOpen 함수 제거
- [ ] 관련 Context 정리
- [ ] MainApp.tsx에서 관련 로직 제거

### Subtask 7.1.3: Footer 네비게이션 추가
- [ ] Footer 컴포넌트에 네비게이션 섹션 추가
- [ ] Home (/) 링크 추가
- [ ] Profile (/profile) 링크 추가
- [ ] Projects (/projects) 링크 추가
- [ ] Chat (/chat) 링크 추가
- [ ] TextLink 컴포넌트 사용
- [ ] 스타일 적용 (Footer.module.css)
- [ ] 반응형 레이아웃 확인

---

## Task 7.2: 중복 컴포넌트 통합 및 제거

### Subtask 7.2.1: shared/ui 중복 컴포넌트 제거
- [ ] `shared/ui/skeleton/SkeletonCard.tsx` 사용처 확인
- [ ] 사용처에서 design-system/components/Skeleton으로 import 변경
- [ ] `shared/ui/skeleton/` 폴더 제거
- [ ] `shared/ui/tooltip/Tooltip.tsx` 사용처 확인
- [ ] 사용처에서 design-system/components/Tooltip으로 import 변경
- [ ] `shared/ui/tooltip/` 폴더 제거
- [ ] `shared/ui/index.ts` 업데이트

### Subtask 7.2.2: features/project-gallery 레거시 컴포넌트 정리
- [ ] ProjectCard.tsx 사용 여부 확인 (grep 검색)
- [ ] ExperienceCard.tsx 사용 여부 확인
- [ ] EducationCard.tsx 사용 여부 확인
- [ ] CertificationCard.tsx 사용 여부 확인
- [ ] ProjectFilter.tsx 사용 여부 확인
- [ ] HistoryPanel.tsx 사용 여부 확인
- [ ] PanelToggle.tsx 사용 여부 확인
- [ ] PortfolioSection.tsx 사용 여부 확인
- [ ] 미사용 컴포넌트 제거
- [ ] index.ts 업데이트

### Subtask 7.2.3: features/chatbot 정리
- [ ] Chatbot.tsx 사용 여부 확인
- [ ] ChatMessage.tsx 사용 여부 확인
- [ ] 미사용 컴포넌트 제거
- [ ] 서비스/유틸은 유지 확인
- [ ] index.ts 업데이트

### Subtask 7.2.4: LoadingScreen/LoadingState 통합 검토
- [ ] LoadingScreen 사용처 확인
- [ ] LoadingState 사용처 확인
- [ ] Spinner 사용처 확인
- [ ] 역할 구분 명확화 또는 통합 결정
- [ ] 결정에 따른 작업 수행

---

## Task 7.3: 컬러 시스템 정리

### Subtask 7.3.1: 하드코딩 컬러 제거 (우선순위 중간)
- [ ] TechStackBadge.tsx 열기
- [ ] `hover:border-[#7FAF8A]` 찾기
- [ ] Tailwind 설정 확인 (primary 색상 정의 여부)
- [ ] CSS 변수 또는 Tailwind 클래스로 교체
- [ ] 동작 테스트

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
- [ ] `src/main/pages/` 현재 내용 확인
- [ ] `src/pages/ChatPage/` → `src/main/pages/ChatPage/` 이동
- [ ] `src/pages/HomePage/` → `src/main/pages/HomePage/` 이동
- [ ] `src/pages/ProfilePage/` → `src/main/pages/ProfilePage/` 이동
- [ ] `src/pages/ProjectDetailPage/` → `src/main/pages/ProjectDetailPage/` 이동
- [ ] `src/pages/ProjectsListPage/` → `src/main/pages/ProjectsListPage/` 이동
- [ ] 모든 import 경로 업데이트
- [ ] `src/pages/` 폴더 삭제

### Subtask 7.5.2: widgets/ 폴더 통합
- [ ] `src/main/layout/` 현재 내용 확인
- [ ] `src/widgets/layout/Header/` → `src/main/layout/Header/` 이동
- [ ] `src/widgets/layout/Footer/` → `src/main/layout/Footer/` 이동
- [ ] `src/widgets/layout/HomePageLayout/` → `src/main/layout/HomePageLayout/` 이동
- [ ] `src/widgets/layout/PageLayout/` → `src/main/layout/PageLayout/` 이동
- [ ] 모든 import 경로 업데이트
- [ ] `src/widgets/` 폴더 삭제

### Subtask 7.5.3: shared/ 폴더 통합
- [ ] `src/main/shared/` 현재 내용 확인
- [ ] 중복 파일 식별
- [ ] `src/shared/api/` → `src/main/shared/api/` 통합
- [ ] `src/shared/config/` → `src/main/shared/config/` 통합
- [ ] `src/shared/hooks/` → `src/main/shared/hooks/` 통합
- [ ] `src/shared/lib/` → `src/main/shared/lib/` 통합
- [ ] `src/shared/providers/` → `src/main/shared/providers/` 통합
- [ ] `src/shared/services/` → `src/main/shared/services/` 통합
- [ ] `src/shared/types/` → `src/main/shared/types/` 통합
- [ ] `src/shared/ui/` → `src/main/shared/ui/` 통합
- [ ] `src/shared/utils/` → `src/main/shared/utils/` 통합
- [ ] 모든 import 경로 업데이트
- [ ] `src/shared/` 폴더 삭제

### Subtask 7.5.4: features/ 폴더 통합
- [ ] `src/main/features/` 현재 내용 확인
- [ ] `src/features/chatbot/` → `src/main/features/chatbot/` 통합
- [ ] `src/features/easter-eggs/` → `src/main/features/easter-eggs/` 통합
- [ ] `src/features/introduction/` 사용 여부 확인 후 결정
- [ ] `src/features/project-gallery/` 사용 여부 확인 후 결정
- [ ] 모든 import 경로 업데이트
- [ ] `src/features/` 폴더 삭제

### Subtask 7.5.5: entities/, hooks/, app/ 폴더 통합
- [ ] `src/entities/` → `src/main/entities/` 통합 (중복 확인)
- [ ] `src/hooks/` → `src/main/hooks/` 통합 (중복 확인)
- [ ] `src/app/` → `src/main/app/` 통합 (중복 확인)
- [ ] 모든 import 경로 업데이트
- [ ] 삭제 완료

### Subtask 7.5.6: 미사용 폴더/파일 제거
- [ ] stories/assets/ 사용 여부 확인
- [ ] 빈 폴더 제거
- [ ] features/introduction/ 사용 여부 확인
- [ ] 미사용 파일/폴더 제거

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
- [ ] Footer 네비게이션 정상 동작

---

## 완료 조건

- [ ] **frontend/src가 admin, design-system, main 3개 폴더로 정리됨**
- [ ] **모든 import 경로가 새 구조에 맞게 업데이트됨**
- [ ] Phase 6 남은 작업 모두 완료
- [ ] 중복 컴포넌트가 제거되고 design-system으로 통합됨
- [ ] 하드코딩된 컬러가 디자인 시스템 토큰으로 교체됨
- [ ] 미사용 파일/폴더가 제거됨
- [ ] 빌드 및 린트 에러 없음
- [ ] 모든 페이지 정상 동작 확인
- [ ] 스토리북 빌드 성공

---

## 진행 기록

| 날짜 | 작업 내용 | 상태 |
|------|-----------|------|
| 2026-01-09 | Phase 7 설계 문서 작성 | ✅ 완료 |
| | | |

---

## 참고 문서

- [Phase 7 설계 문서](./phase-7-design.md)
- [Phase 6 완료 보고서](./phase-6-completion.md)
- [Phase 3 디자인 시스템](./phase-3-design.md)
