# Phase 5 — UI Implementation Checklist

## 📋 Task 5.0: 디자인 시스템 확장

### Subtask 5.0.1: Badge 컴포넌트 확장

#### TeamBadge 컴포넌트
- [x] `design-system/components/Badge/TeamBadge.tsx` 파일 생성
- [x] `TeamBadgeProps` 인터페이스 정의 (isTeam, size)
- [x] 팀 배지 SVG 아이콘 구현
- [x] 개인 배지 SVG 아이콘 구현
- [x] 아이콘 + 텍스트 레이아웃 구현 (항상 표시, 애니메이션 없음)
- [x] 디자인 토큰 적용 (색상, 간격)
  - [x] 팀: primary 색상 토큰 사용
  - [x] 개인: success 색상 토큰 사용
- [x] size props 구현 (sm, md, lg)
- [x] 다크모드 지원 확인

#### ProjectTypeBadge 컴포넌트
- [x] `design-system/components/Badge/ProjectTypeBadge.tsx` 파일 생성
- [x] `ProjectTypeBadgeProps` 인터페이스 정의 (type, size)
- [x] ProjectType 타입 정의 ('BUILD' | 'LAB' | 'MAINTENANCE')
- [x] BUILD 배지 아이콘 + 스타일 구현 (error 색상 토큰)
- [x] LAB 배지 아이콘 + 스타일 구현 (warning 색상 토큰)
- [x] MAINTENANCE 배지 아이콘 + 스타일 구현 (success 색상 토큰)
- [x] 아이콘 + 텍스트 레이아웃 구현 (항상 표시, 애니메이션 없음)
- [x] 디자인 토큰 적용 (타입별 색상, 간격)
- [x] size props 구현 (sm, md, lg)
- [x] 다크모드 지원 확인

#### Badge 컴포넌트 Export
- [x] `design-system/components/Badge/index.ts` 업데이트
  - [x] TeamBadge export 추가
  - [x] ProjectTypeBadge export 추가

#### 검증
- [x] TeamBadge가 팀/개인을 아이콘+텍스트로 표시
- [x] ProjectTypeBadge가 타입을 아이콘+텍스트로 표시
- [x] 애니메이션 없이 항상 전체 내용 표시
- [x] 디자인 토큰만 사용 (하드코딩된 색상 없음)
- [ ] Storybook 스토리 작성 (선택)

---

### Subtask 5.0.2: Icon 컴포넌트 추가

#### SocialIcon 컴포넌트
- [x] `design-system/components/Icon/` 디렉토리 생성
- [x] `design-system/components/Icon/SocialIcon.tsx` 파일 생성
- [x] `SocialIconProps` 인터페이스 정의 (type, size)
- [x] SocialType 타입 정의 ('github' | 'external-link' | 'linkedin' | 'email')
- [x] GitHub 아이콘 SVG 구현
- [x] ExternalLink 아이콘 SVG 구현
- [x] LinkedIn 아이콘 SVG 구현 (미래 대비)
- [x] Email 아이콘 SVG 구현 (미래 대비)
- [x] size props 구현 (sm, md, lg)
- [x] 디자인 토큰으로 크기 조절

#### ProjectIcon 컴포넌트
- [x] `design-system/components/Icon/ProjectIcon.tsx` 파일 생성
- [x] `ProjectIconProps` 인터페이스 정의 (type, size)
- [x] ProjectIconType 타입 정의 ('web' | 'backend' | 'mobile' | 'desktop' | 'database' | 'cloud' | 'ai' | 'default')
- [x] Web 아이콘 SVG 구현
- [x] Backend/Code 아이콘 SVG 구현
- [x] Mobile 아이콘 SVG 구현
- [x] Desktop 아이콘 SVG 구현
- [x] Database 아이콘 SVG 구현
- [x] Cloud 아이콘 SVG 구현
- [x] AI 아이콘 SVG 구현
- [x] Default 아이콘 SVG 구현
- [x] size props 구현 (sm, md, lg)
- [x] 디자인 토큰으로 크기 조절

#### Icon 컴포넌트 Export
- [x] `design-system/components/Icon/index.ts` 생성
  - [x] SocialIcon export
  - [x] ProjectIcon export

#### 검증
- [x] SocialIcon이 GitHub, ExternalLink 등을 올바르게 표시
- [x] ProjectIcon이 프로젝트 타입별 fallback 아이콘 올바르게 표시
- [x] 디자인 토큰으로 크기 조절 가능
- [ ] Storybook 스토리 작성 (선택)

---

### Subtask 5.0.3: Card 컴포넌트 추가

#### Card 기본 컴포넌트
- [x] `design-system/components/Card/` 디렉토리 생성
- [x] `design-system/components/Card/Card.tsx` 파일 생성
- [x] `CardProps` 인터페이스 정의 (variant, padding, children, onClick, className)
- [x] variant 구현 ('default' | 'elevated' | 'outlined')
- [x] padding 구현 ('none' | 'sm' | 'md' | 'lg')
- [x] 디자인 토큰 적용 (배경, 보더, 간격)
- [x] onClick 핸들러 구현 (선택)
- [x] 다크모드 지원 확인

#### ProjectCard 컴포넌트
- [x] `design-system/components/Card/ProjectCard.tsx` 파일 생성
- [x] `ProjectCardProps` 인터페이스 정의
  - [x] project 객체 타입 정의 (id, title, description, imageUrl, isTeam, type, technologies, startDate, endDate, githubUrl, liveUrl)
  - [x] onClick props 정의
- [x] 기존 `features/project-gallery/components/ProjectCard.tsx`에서 로직 이동
  - [x] 카드 기본 구조 (Card 컴포넌트 사용)
  - [x] 썸네일 영역 구현 (이미지/fallback)
  - [x] 배지 영역 구현 (TeamBadge, ProjectTypeBadge 사용)
  - [x] 제목 영역 구현 (formatTitle 로직)
  - [x] 설명 영역 구현
  - [x] 기술 스택 영역 구현 (TechStackList 컴포넌트 사용)
  - [x] 하단 메타 정보 구현 (날짜, SocialIcon)
- [x] 애니메이션 제거
  - [x] 배지 hover 확장 애니메이션 제거
  - [x] 배지 항상 전체 표시 (아이콘 + 텍스트)
- [x] 기타 hover 효과 유지
  - [x] 카드 hover scale 효과 유지
  - [x] 카드 hover shadow 효과 유지
- [x] 디자인 토큰 적용
  - [x] 하드코딩된 색상 제거
  - [x] 하드코딩된 간격 제거
  - [x] 타이포그래피 토큰 적용
- [x] 이미지 로드 실패 처리 (ProjectIcon fallback)
- [x] formatTitle 함수 구현 (괄호 처리)
- [x] formatDateRange 유틸 함수 사용
- [x] 다크모드 지원 확인

#### Card 컴포넌트 Export
- [x] `design-system/components/Card/index.ts` 생성
  - [x] Card export
  - [x] ProjectCard export
- [x] `design-system/components/index.ts` 업데이트
  - [x] Card 컴포넌트 export 추가
  - [x] ProjectCard 컴포넌트 export 추가

#### 검증
- [x] ProjectCard가 기존 카드와 동일한 레이아웃 구조
- [x] 썸네일, 배지, 제목, 설명, 기술 스택, 메타 정보 모두 표시
- [x] TeamBadge, ProjectTypeBadge가 올바르게 렌더링
- [x] SocialIcon(GitHub, ExternalLink)이 올바르게 렌더링
- [x] 이미지 없을 시 ProjectIcon fallback 표시
- [x] 디자인 시스템 컴포넌트만 사용
- [x] 배지 hover 애니메이션 없음 (항상 전체 표시)
- [x] 카드 hover 효과 정상 동작 (scale, shadow)
- [ ] Storybook 스토리 작성 (선택)

---

## 📋 Task 5.1: Featured Projects 설정 파일 생성

- [x] `frontend/src/pages/HomePage/config/` 디렉토리 생성
- [x] `featuredProjects.config.ts` 파일 생성
- [x] `FeaturedProject` 인터페이스 정의
  - [x] id: string
  - [x] title: string
  - [x] subtitle: string (랜딩 전용 소개문구)
  - [x] imageUrl: string
  - [x] tags: string[]
  - [x] link: string
- [x] `FEATURED_PROJECTS` 배열 생성
  - [x] 주요 프로젝트 3개 데이터 추가
- [x] `FEATURED_CONFIG` 객체 생성
  - [x] maxDisplay: number
- [x] `FeaturedProjectsSection.tsx`에서 설정 파일 import
- [x] 기존 하드코딩된 데이터 제거

### 검증
- [x] 설정 파일에서 데이터를 import하여 렌더링 성공
- [x] 기존 하드코딩된 데이터 제거 완료
- [x] 설정 파일 수정 시 UI 즉시 반영

---

## 📋 Task 5.2: Archive Page UI 구현

### 페이지 구조
- [x] `frontend/src/pages/ProjectsListPage/ProjectsListPage.tsx` 수정
- [x] 페이지 제목: SectionTitle 컴포넌트 사용
- [x] 프로젝트 그리드 레이아웃 구현
- [x] Featured Projects 섹션 상단에 추가 (설정 파일에서 데이터 가져오기)
- [x] 프로젝트 타입별 섹션 구성 (BUILD, LAB, MAINTENANCE)
- [x] 히스토리 패널, 챗봇 패널, 하단 채팅 UI 제거 (프로젝트 카드와 배지만 존재)

### 프로젝트 카드
- [x] 디자인 시스템 ProjectCard 컴포넌트 import
- [x] API에서 받은 프로젝트 데이터를 ProjectCard로 렌더링
- [x] 카드 클릭 시 상세 페이지 이동 구현

### API 연동
- [x] `useProjectsQuery()` 훅 사용
- [x] 로딩 상태 UI 구현 (SkeletonCard 사용)
- [x] 에러 상태 UI 구현 (에러 메시지 표시)

### 검증
- [x] API에서 프로젝트 목록 정상 로드
- [x] 디자인 시스템 ProjectCard로 프로젝트 그리드 렌더링
- [x] TeamBadge, ProjectTypeBadge가 올바르게 표시
- [x] 디자인 시스템 컴포넌트만 사용
- [x] 반응형 레이아웃 정상 동작
  - [x] 모바일: 1단 레이아웃
  - [x] 태블릿: 2단 레이아웃
  - [x] 데스크톱: 3단 레이아웃
- [x] 로딩/에러 상태 UI 정상 표시

---

## 📋 Task 5.3: Project Detail Page UI 구현

### 페이지 구조
- [ ] `frontend/src/pages/ProjectDetailPage/ProjectDetailPage.tsx` 수정
- [ ] 프로젝트 제목: SectionTitle 컴포넌트 사용
- [ ] 뒤로 가기: TextLink 컴포넌트 사용
- [ ] 메타 정보 영역 구현
  - [ ] 기간 (formatDateRange 사용)
  - [ ] 역할
  - [ ] 기술 스택 (TechStackList 사용)
  - [ ] TeamBadge, ProjectTypeBadge 표시
- [ ] 프로젝트 이미지/스크린샷 영역 구현
- [ ] GitHub, Live URL 링크 (SocialIcon 사용)

### 섹션 구성
- [ ] Overview 섹션 구현
- [ ] Key Features 섹션 구현
- [ ] Tech Stack 섹션 구현
- [ ] My Role 섹션 구현
- [ ] Results 섹션 구현
- [ ] 마크다운 렌더링 지원 (MarkdownRenderer 사용)

### API 연동
- [ ] `useProject(id)` 훅 사용
- [ ] 로딩 상태 UI 구현
- [ ] 에러 상태 UI 구현 (404 등)

### 검증
- [ ] API에서 프로젝트 상세 정보 정상 로드
- [ ] 모든 섹션 정상 표시
- [ ] 디자인 시스템 컴포넌트만 사용
- [ ] 마크다운 렌더링 정상 동작
- [ ] 반응형 레이아웃 정상 동작
- [ ] 로딩/에러 상태 UI 정상 표시

---

## 📋 Task 5.4: 반응형 레이아웃 최적화

### 브레이크포인트 정의
- [ ] CSS 변수 또는 Tailwind config에 브레이크포인트 정의
  - [ ] --breakpoint-mobile: 768px
  - [ ] --breakpoint-tablet: 1024px
  - [ ] --breakpoint-desktop: 1280px

### 레이아웃 조정
- [ ] 모바일 (< 768px)
  - [ ] Landing Page 1단 레이아웃
  - [ ] Archive Page 1단 그리드
  - [ ] Detail Page 1단 레이아웃
- [ ] 태블릿 (768px - 1024px)
  - [ ] Landing Page 조정
  - [ ] Archive Page 2단 그리드
  - [ ] Detail Page 조정
- [ ] 데스크톱 (> 1024px)
  - [ ] Landing Page 최적화
  - [ ] Archive Page 3단 그리드
  - [ ] Detail Page 최적화

### 터치 최적화
- [ ] 버튼/링크 터치 영역 확보 (최소 44x44px)
- [ ] 스크롤 애니메이션 모바일 최적화
- [ ] `prefers-reduced-motion` 지원 확인

### 검증
- [ ] 모바일 (< 768px) 레이아웃 정상 동작
- [ ] 태블릿 (768px - 1024px) 레이아웃 정상 동작
- [ ] 데스크톱 (> 1024px) 레이아웃 정상 동작
- [ ] 터치 인터랙션 정상 동작
- [ ] 스크롤 애니메이션 모든 디바이스에서 정상 동작

---

## 🎨 Design System Compliance Checklist

### Typography
- [ ] 모든 제목에 디자인 시스템 타이포그래피 토큰 사용
- [ ] 모든 본문 텍스트에 디자인 시스템 타이포그래피 토큰 사용
- [ ] 커스텀 폰트 크기/두께 사용 금지

### Colors
- [ ] 모든 색상에 디자인 시스템 컬러 토큰 사용
- [ ] 하드코딩된 색상 값 사용 금지 (예: `#000000`)
- [ ] Phase 4.5 그라데이션은 예외 허용

### Spacing
- [ ] 모든 여백/간격에 Spacing 토큰 사용
- [ ] 임의의 px 값 사용 금지

### Components
- [ ] 버튼은 `Button` 컴포넌트만 사용
- [ ] 링크는 `TextLink` 컴포넌트만 사용
- [ ] 섹션 제목은 `SectionTitle` 컴포넌트만 사용
- [ ] 구분선은 `Divider` 컴포넌트만 사용
- [ ] 배지는 `Badge`, `TeamBadge`, `ProjectTypeBadge` 컴포넌트만 사용
- [ ] 아이콘은 `SocialIcon`, `ProjectIcon` 컴포넌트만 사용
- [ ] 프로젝트 카드는 디자인 시스템 `ProjectCard` 컴포넌트만 사용
- [ ] Task 5.0에서 추가된 컴포넌트 외 새로운 컴포넌트 생성 금지

---

## 🧪 Testing Plan

### Manual Testing

#### Landing Page
- [ ] Hero Section 애니메이션 정상 동작
- [ ] About Section 스크롤 애니메이션 정상 동작
- [ ] Featured Projects 카드 정상 표시
- [ ] Featured Projects 카드 hover 효과 정상 동작
- [ ] CTA 버튼 클릭 시 정상 이동

#### Archive Page
- [ ] 프로젝트 목록 정상 로드
- [ ] 프로젝트 카드 그리드 정상 표시
- [ ] TeamBadge, ProjectTypeBadge 정상 표시 (항상 전체 표시)
- [ ] 프로젝트 카드 클릭 시 상세 페이지 이동
- [ ] 필터/정렬 정상 동작 (구현한 경우)

#### Project Detail Page
- [ ] 프로젝트 정보 정상 로드
- [ ] 뒤로 가기 링크 정상 동작
- [ ] 마크다운 렌더링 정상 동작
- [ ] 모든 섹션 정상 표시
- [ ] GitHub, Live URL 링크 정상 동작

#### Responsive
- [ ] 모바일 (iPhone SE, iPhone 12 Pro)
  - [ ] Landing Page
  - [ ] Archive Page
  - [ ] Project Detail Page
- [ ] 태블릿 (iPad, iPad Pro)
  - [ ] Landing Page
  - [ ] Archive Page
  - [ ] Project Detail Page
- [ ] 데스크톱 (1280px, 1920px)
  - [ ] Landing Page
  - [ ] Archive Page
  - [ ] Project Detail Page

#### Accessibility
- [ ] `prefers-reduced-motion` 정상 동작
- [ ] 키보드 네비게이션 정상 동작
- [ ] 스크린 리더 호환성 확인

### Browser Testing
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)

---

## ⚡ Performance Checklist

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5초
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### Page Load
- [ ] Landing Page: < 3초 (3G 기준)
- [ ] Archive Page: < 4초 (API 로드 포함)
- [ ] Project Detail: < 4초 (API 로드 포함)

### Optimization
- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] CSS 번들 최소화
- [ ] JavaScript 번들 최소화
- [ ] GPU 가속 활용 (스크롤 애니메이션)

---

## ✅ Definition of Done

- [ ] **Task 5.0 완료**: TeamBadge, ProjectTypeBadge, SocialIcon, ProjectIcon, Card, ProjectCard 컴포넌트가 디자인 시스템에 추가됨
- [ ] **기존 UX 보존**: 기존 ProjectCard의 배지, 아이콘, 레이아웃이 디자인 시스템 ProjectCard에 완전히 통합됨
- [ ] **애니메이션 제거**: 배지 hover 확장 애니메이션이 제거되고 항상 전체 내용 표시됨
- [ ] Landing Page가 디자인 시스템으로 완성됨
- [ ] Archive Page가 디자인 시스템 ProjectCard로 완성됨
- [ ] Project Detail Page가 디자인 시스템으로 완성됨
- [ ] Featured Projects 설정 파일로 관리됨
- [ ] 모든 페이지가 반응형으로 동작
- [ ] 모든 페이지가 Performance Targets 충족
- [ ] 디자인 시스템 외 스타일 사용 없음
- [ ] Task 5.0 외 새로운 컴포넌트 추가 없음
- [ ] Design System Compliance Checklist 100% 완료
- [ ] Manual Testing 체크리스트 100% 완료
- [ ] Browser Testing 체크리스트 100% 완료
- [ ] Performance Checklist 100% 완료

---

**작성일**: 2026-01-05
**상태**: 구현 대기
