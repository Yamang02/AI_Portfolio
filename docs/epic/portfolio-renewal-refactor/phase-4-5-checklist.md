# Phase 4.5 구현 체크리스트

**작성일**: 2025-01-XX  
**참고 문서**: [phase-4-5-enhancement-design.md](./phase-4-5-enhancement-design.md)  
**상태**: 진행 중

---

## 📋 진행 상황 요약

- **전체 진행률**: 0% (시작 전)
- **시작일**: 
- **목표 완료일**: 

---

## Task 4.5.1: 브랜드 컬러 시스템 업데이트

### 상태: ✅ 완료

브랜드 컬러 시스템 개선은 이미 완료되었습니다:
- Primary 컬러 업데이트 완료
- CSS 변수 업데이트 완료
- 다크 모드 컬러 업데이트 완료

**참고**: [Revised Color Palette](../../technical/design-system/color-palette-revised.md)

---

## Task 4.5.2: Scroll Animation Hooks 구현

### Hook 파일 생성

- [ ] `frontend/src/hooks/useScrollAnimation.ts` 생성
  - [ ] Intersection Observer 구현
  - [ ] `isVisible` 상태 관리
  - [ ] 옵션 커스터마이징 지원
  - [ ] cleanup 함수 구현

- [ ] `frontend/src/hooks/useScrollProgress.ts` 생성
  - [ ] 스크롤 진행도 계산 (0 ~ 1)
  - [ ] `passive: true` 옵션으로 성능 최적화
  - [ ] cleanup 함수 구현

### 검증

- [ ] `useScrollAnimation` Hook 정상 작동 확인
- [ ] `useScrollProgress` Hook 정상 작동 확인
- [ ] 여러 섹션에서 동시 사용 가능 확인
- [ ] 메모리 누수 없음 확인 (cleanup)

**파일**: 
- `frontend/src/hooks/useScrollAnimation.ts`
- `frontend/src/hooks/useScrollProgress.ts`

---

## Task 4.5.3: Hero Section 이미지 배치 적용

### 이미지 준비

- [ ] 이미지 파일 준비
  - [ ] `/public/images/hero-image.jpg` (또는 적절한 경로)
  - [ ] 이미지 최적화 (WebP 변환 고려)
  - [ ] 반응형 이미지 준비 (선택적)

### 컴포넌트 수정

- [ ] `frontend/src/pages/HomePage/HeroSection.tsx` 수정
  - [ ] 2-column 레이아웃 구조 추가 (왼쪽: 텍스트, 오른쪽: 이미지)
  - [ ] 이미지 요소 추가 (`<img>` 태그)
  - [ ] 텍스트 콘텐츠 영역 분리

### CSS 애니메이션 추가

- [ ] `frontend/src/pages/HomePage/HeroSection.module.css` 수정
  - [ ] Grid 레이아웃 (2-column) 스타일 추가
  - [ ] 이미지 슬라이드 인 애니메이션 (오른쪽에서)
  - [ ] 텍스트 페이드인 + 스케일 애니메이션
  - [ ] `@keyframes heroFadeIn`, `heroImageSlideIn` 정의
  - [ ] 반응형 레이아웃 (모바일: 세로 배치)
  - [ ] `prefers-reduced-motion` 지원 추가

### 검증

- [ ] 초기 로드 시 이미지 슬라이드 인 확인
- [ ] 텍스트 페이드인 확인
- [ ] 부드러운 전환 확인 (60fps)
- [ ] 반응형 레이아웃 확인 (모바일/데스크톱)
- [ ] 접근성 모드에서 애니메이션 비활성화 확인
- [ ] 이미지 로딩 실패 시 대체 처리 확인

**파일**: 
- `frontend/src/pages/HomePage/HeroSection.tsx`
- `frontend/src/pages/HomePage/HeroSection.module.css`
- `frontend/public/images/hero-image.jpg` (또는 적절한 경로)

---

## Task 4.5.4: About Section #1, #2 이미지 배치 적용

### 로고/이미지 준비

#### About Section #1 (로고)
- [ ] 로고 파일 확인
  - [ ] `/public/landing/cursor_logo.png`
  - [ ] `/public/landing/claude_code_logo.png`
  - [ ] `/public/landing/codex_logo.png`
  - [ ] 로고 최적화 (필요 시)

#### About Section #2 (이미지)
- [ ] 이미지 파일 확인
  - [ ] `/public/landing/cursor_usage.jpg`
  - [ ] 이미지 최적화 (필요 시)

### 컴포넌트 수정

#### About Section #1 (로고 모임 애니메이션)
- [ ] `frontend/src/pages/HomePage/AboutSection1.tsx` 생성
  - [ ] `useScrollAnimation` 훅 import 및 사용
  - [ ] 2-column 레이아웃 구조 (왼쪽: 텍스트, 오른쪽: 로고 컨테이너)
  - [ ] 3개 로고 요소 추가 (`<img>` 태그)
  - [ ] 각 로고에 `data-logo` 속성 추가 (cursor, claude, codex)
  - [ ] `ref` 및 `isVisible` 상태 적용
  - [ ] `visible` 클래스 조건부 적용

#### About Section #2
- [ ] `frontend/src/pages/HomePage/AboutSection2.tsx` 생성
  - [ ] `useScrollAnimation` 훅 import 및 사용
  - [ ] 2-column 레이아웃 구조 (왼쪽: 이미지, 오른쪽: 텍스트)
  - [ ] Cursor 사용 통계 이미지 요소 추가 (`/landing/cursor_usage.jpg`)
  - [ ] `ref` 및 `isVisible` 상태 적용
  - [ ] `visible` 클래스 조건부 적용

### CSS 애니메이션 추가

- [ ] `frontend/src/pages/HomePage/AboutSection.module.css` 수정
  - [ ] Grid 레이아웃 (2-column) 스타일 추가
  - [ ] **About Section #1 로고 모임 애니메이션**
    - [ ] 로고 컨테이너 스타일 (position: relative, 높이 설정)
    - [ ] 각 로고 초기 위치 설정 (transform: translate)
      - [ ] Cursor: `translate(-150px, -100px) scale(0.5)`
      - [ ] Claude: `translate(150px, -100px) scale(0.5)`
      - [ ] Codex: `translate(0, 150px) scale(0.5)`
    - [ ] visible 상태에서 중앙으로 모임 (삼각형 형태)
      - [ ] Cursor: `translate(-80px, -40px) scale(1)`
      - [ ] Claude: `translate(80px, -40px) scale(1)`
      - [ ] Codex: `translate(0, 60px) scale(1)`
    - [ ] 각 로고 transition-delay 설정 (0.1s, 0.3s, 0.5s)
    - [ ] 로고 호버 효과 (scale(1.1))
  - [ ] **About Section #2 이미지 아래에서 fade-in 애니메이션**
    - [ ] 이미지 초기 상태: `opacity: 0, translateY(60px)`
    - [ ] visible 상태: `opacity: 1, translateY(0)`
    - [ ] 텍스트 페이드인 애니메이션 (delay: 0.3s)
  - [ ] 초기 상태 (opacity: 0, transform)
  - [ ] visible 상태 전환 애니메이션
  - [ ] 반응형 레이아웃 (모바일: 세로 배치, 로고도 세로 배치)
  - [ ] `prefers-reduced-motion` 지원

### 검증

#### About Section #1
- [ ] 왼쪽에 텍스트, 오른쪽에 로고 컨테이너 배치 확인
- [ ] 3개 로고 초기 위치 확인 (각각 다른 위치)
- [ ] 스크롤 시 섹션 진입 시 로고 모임 애니메이션 트리거 확인
- [ ] 로고들이 중앙으로 삼각형 형태로 모이는지 확인
- [ ] 각 로고의 등장 순서 확인 (delay 적용)
- [ ] 로고 호버 효과 확인
- [ ] 텍스트 페이드인 확인
- [ ] Intersection Observer 정확도 확인
- [ ] 반응형 레이아웃 확인 (모바일: 로고 세로 배치)

#### About Section #2
- [ ] 왼쪽에 이미지, 오른쪽에 텍스트 배치 확인
- [ ] 스크롤 시 섹션 진입 시 애니메이션 트리거 확인
- [ ] 이미지 아래에서 fade-in 확인 (`translateY(60px)` → `translateY(0)`)
- [ ] 이미지 opacity 애니메이션 확인 (0 → 1)
- [ ] 텍스트 페이드인 확인 (delay: 0.3s)
- [ ] Intersection Observer 정확도 확인
- [ ] 반응형 레이아웃 확인 (모바일: 이미지 위로)

**파일**: 
- `frontend/src/pages/HomePage/AboutSection1.tsx`
- `frontend/src/pages/HomePage/AboutSection2.tsx`
- `frontend/src/pages/HomePage/AboutSection.module.css`
- `frontend/public/landing/cursor_logo.png`
- `frontend/public/landing/claude_code_logo.png`
- `frontend/public/landing/codex_logo.png`
- `frontend/public/landing/cursor_usage.jpg`

---

## Task 4.5.5: Featured Projects 캐러셀 섹션 적용

### Hook 구현

- [ ] `frontend/src/hooks/useCarouselScroll.ts` 생성
  - [ ] 스크롤 진행도 계산 (0 ~ 1)
  - [ ] 활성 카드 인덱스 계산 (0, 1, 2)
  - [ ] 섹션 뷰포트 진입 감지
  - [ ] `passive: true` 옵션으로 성능 최적화
  - [ ] cleanup 함수 구현

### 이미지 준비

- [ ] 이미지 파일 준비
  - [ ] `/public/images/project-1.jpg` (Genpresso)
  - [ ] `/public/images/project-2.jpg` (AI Chatbot)
  - [ ] `/public/images/project-3.jpg` (노루 ERP)
  - [ ] 이미지 최적화 (WebP 변환 고려)
  - [ ] 반응형 이미지 준비 (선택적)

### 컴포넌트 수정

- [ ] `frontend/src/pages/HomePage/FeaturedProjectsSection.tsx` 생성
  - [ ] `useCarouselScroll` 훅 import 및 사용
  - [ ] `TechStackList` 컴포넌트 import (기존 메인페이지와 동일)
  - [ ] 프로젝트 데이터 배열 정의 (3개 프로젝트)
    - [ ] `id`, `title`, `imageUrl`, `technologies` (배열), `description`
  - [ ] 캐러셀 컨테이너 구조
  - [ ] 캐러셀 트랙 (가로 스크롤)
  - [ ] 3개 프로젝트 카드 렌더링
    - [ ] 이미지 영역 (imageUrl 있으면 이미지, 없으면 placeholder)
    - [ ] 프로젝트명 (h3)
    - [ ] TechStackList 컴포넌트 (maxVisible: 3, size: sm)
  - [ ] 스크롤 진행도에 따른 `translateX` 계산
  - [ ] 활성 카드 인덱스에 따른 스타일 적용
  - [ ] 소개문구 영역 구현
  - [ ] 활성 카드에 따른 소개문구 표시/숨김

### CSS 애니메이션 추가

- [ ] `frontend/src/pages/HomePage/FeaturedProjectsSection.module.css` 수정
  - [ ] 섹션 높이 설정 (`min-height: 200vh`)
  - [ ] 캐러셀 컨테이너 sticky 포지셔닝
  - [ ] 캐러셀 트랙 스타일 (flex, gap)
  - [ ] 프로젝트 카드 스타일 (기존 메인페이지 ProjectCard 참고)
    - [ ] 기본 상태: `scale(0.9)`, `opacity(0.7)`
    - [ ] 활성 상태: `scale(1)`, `opacity(1)`
    - [ ] flex-direction: column
    - [ ] border, border-radius, box-shadow
  - [ ] 카드 이미지 영역 스타일
    - [ ] height: 192px (h-48, 기존 메인페이지와 동일)
    - [ ] 이미지: object-fit: cover
    - [ ] placeholder 스타일 (📁 아이콘)
  - [ ] 카드 본문 스타일
    - [ ] padding: 24px (p-6, 기존 메인페이지와 동일)
    - [ ] 프로젝트명: text-2xl, font-extrabold
    - [ ] TechStackList 영역
  - [ ] 소개문구 영역 스타일
  - [ ] 소개문구 fade-in 애니메이션
  - [ ] `will-change: transform` 최적화
  - [ ] 반응형 레이아웃 (모바일: 카드 크기 조정)
  - [ ] `prefers-reduced-motion` 지원

### 검증

- [ ] 스크롤 시 캐러셀 이동 확인
- [ ] 각 카드가 중앙에 올 때 활성화 확인
- [ ] 활성 카드 스타일 확인 (scale, opacity)
- [ ] 카드 이미지 영역 표시 확인
- [ ] 프로젝트명 표시 확인
- [ ] TechStackList 배지 표시 확인 (maxVisible: 3)
- [ ] 이미지 없을 때 placeholder 표시 확인
- [ ] 소개문구 표시/숨김 확인
- [ ] 소개문구 fade-in 애니메이션 확인
- [ ] 스크롤 진행도 계산 정확도 확인
- [ ] 성능 확인 (60fps 유지)
- [ ] 반응형 레이아웃 확인

**파일**: 
- `frontend/src/hooks/useCarouselScroll.ts`
- `frontend/src/pages/HomePage/FeaturedProjectsSection.tsx`
- `frontend/src/pages/HomePage/FeaturedProjectsSection.module.css`
- `frontend/public/images/project-1.jpg`
- `frontend/public/images/project-2.jpg`
- `frontend/public/images/project-3.jpg`

---

## Task 4.5.6: CTA Section 및 헤더/푸터 애니메이션 적용

### 컴포넌트 생성

- [ ] `frontend/src/pages/HomePage/CTASection.tsx` 생성
  - [ ] `useScrollAnimation` 훅 import 및 사용
  - [ ] 섹션 구조 (제목, 설명, 버튼 그룹)
  - [ ] 프로필 페이지 버튼 (`/profile`)
  - [ ] 프로젝트 페이지 버튼 (`/projects`)
  - [ ] `ref` 및 `isVisible` 상태 적용
  - [ ] `visible` 클래스 조건부 적용

### CSS 애니메이션 추가

- [ ] `frontend/src/pages/HomePage/CTASection.module.css` 생성
  - [ ] 섹션 스타일 (min-height: 100vh, 중앙 정렬)
  - [ ] 콘텐츠 페이드인 + 스케일 애니메이션
  - [ ] 버튼 그룹 스타일
  - [ ] 버튼 순차 등장 애니메이션 (delay: 0.2s, 0.4s)
  - [ ] 반응형 레이아웃 (모바일: 세로 배치)
  - [ ] `prefers-reduced-motion` 지원

### 헤더/푸터 애니메이션

- [ ] Layout 컴포넌트 수정
  - [ ] CTA Section ref 전달을 위한 구조 변경
  - [ ] `useScrollAnimation` 훅으로 CTA Section 감지
  - [ ] 헤더에 `visible` 클래스 조건부 적용
  - [ ] 푸터에 `visible` 클래스 조건부 적용

- [ ] Layout CSS 수정
  - [ ] 헤더 초기 상태: `opacity: 0, translateY(-100%)`
  - [ ] 헤더 visible 상태: `opacity: 1, translateY(0)`
  - [ ] 푸터 초기 상태: `opacity: 0, translateY(100%)`
  - [ ] 푸터 visible 상태: `opacity: 1, translateY(0)`
  - [ ] transition 설정 (0.6s ease-out)
  - [ ] `prefers-reduced-motion` 지원

### 검증

- [ ] CTA Section 진입 시 콘텐츠 페이드인 확인
- [ ] 버튼 순차 등장 확인 (delay 적용)
- [ ] 헤더 위에서 등장 확인
- [ ] 푸터 아래에서 등장 확인
- [ ] Intersection Observer 정확도 확인
- [ ] 반응형 레이아웃 확인
- [ ] 접근성 모드에서 애니메이션 비활성화 확인

**파일**: 
- `frontend/src/pages/HomePage/CTASection.tsx`
- `frontend/src/pages/HomePage/CTASection.module.css`
- `frontend/src/components/Layout/Layout.tsx` (또는 해당 레이아웃 컴포넌트)
- `frontend/src/components/Layout/Layout.module.css`

---

## Task 4.5.7: 접근성 및 성능 최적화

### 접근성 지원

- [ ] `frontend/src/utils/accessibility.ts` 생성
  - [ ] `prefersReducedMotion` 함수 구현

- [ ] CSS에 접근성 규칙 추가
  - [ ] `@media (prefers-reduced-motion: reduce)` 규칙
  - [ ] 모든 애니메이션 비활성화 확인

### 성능 최적화

- [ ] GPU 가속 확인
  - [ ] `transform`, `opacity`만 사용 확인
  - [ ] `will-change` 속성 최적화
  - [ ] Chrome DevTools Performance 프로파일링

- [ ] 성능 검증
  - [ ] 60fps 유지 확인
  - [ ] 메모리 사용량 확인
  - [ ] CPU 사용량 확인

**파일**: 
- `frontend/src/utils/accessibility.ts`
- 각 섹션 CSS 파일

---

## 반응형 검증

### Desktop (1024px+)

- [ ] Hero Section 애니메이션 정상 작동
- [ ] About Section 애니메이션 정상 작동
- [ ] Featured Projects Section 애니메이션 정상 작동
- [ ] CTA Section 애니메이션 정상 작동
- [ ] 헤더/푸터 등장 애니메이션 정상 작동
- [ ] 성능 확인 (60fps)

### Tablet (768px-1023px)

- [ ] 모든 섹션 애니메이션 정상 작동
- [ ] 성능 확인 (60fps)

### Mobile (< 768px)

- [ ] 모든 섹션 애니메이션 정상 작동
- [ ] 성능 확인 (60fps, 배터리 고려)
- [ ] 터치 스크롤 시 부드러움 확인

---

## 품질 검증

### Global Constraints 준수

- [ ] 디자인 최소화 (애니메이션은 기능적 목적만)
- [ ] 새로운 기능 추가 없음 (기존 콘텐츠에 애니메이션만)
- [ ] 디자인 시스템 준수 (컬러는 시스템 내에서만 확장)

### 접근성 검증

- [ ] `prefers-reduced-motion` 지원 확인
- [ ] 키보드 네비게이션 영향 없음 확인
- [ ] 스크린 리더 영향 없음 확인

### 성능 검증

- [ ] 60fps 유지 확인
- [ ] GPU 가속 활용 확인
- [ ] 메모리 누수 없음 확인

---

## 📝 메모

### 구현 중 발견된 이슈

- (구현 시 추가)

### 해결 방법

- (구현 시 추가)

### 추가 참고사항

- (구현 시 추가)

---

## ✅ 완료 체크

모든 체크리스트 항목을 완료했는지 최종 확인:

- [ ] Task 4.5.1: 브랜드 컬러 시스템 업데이트 완료
- [ ] Task 4.5.2: Scroll Animation Hook 구현 완료
- [ ] Task 4.5.3: Hero Section 이미지 배치 적용 완료
- [ ] Task 4.5.4: About Section #1, #2 이미지 배치 적용 완료
- [ ] Task 4.5.5: Featured Projects 캐러셀 섹션 적용 완료
- [ ] Task 4.5.6: CTA Section 및 헤더/푸터 애니메이션 적용 완료
- [ ] Task 4.5.7: 접근성 및 성능 최적화 완료
- [ ] 반응형 검증 완료
- [ ] 품질 검증 완료

**Phase 4.5 완료일**: 

---

## 다음 단계

Phase 4.5 완료 후, [phase-5-design.md](./phase-5-design.md)로 이동하여 전체 UI 구현을 시작합니다.

**Phase 5 작업 시 고려사항:**
- Phase 4.5의 애니메이션 패턴을 다른 페이지에도 적용 가능한지 검토
- 성능 최적화 지속 모니터링
- 사용자 피드백 수집 및 개선
