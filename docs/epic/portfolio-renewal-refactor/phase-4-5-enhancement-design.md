# Phase 4.5 설계 문서: Landing Page Enhancement (Scroll-Driven Animations)

**작성일**: 2025-01-XX  
**작성자**: AI Agent (Claude)  
**상태**: 초안  
**목적**: Phase 4 완료 후 랜딩 페이지 임팩트 강화를 위한 개선

---

## 📋 목차

1. [개요](#개요)
2. [목표](#목표)
3. [작업 범위](#작업-범위)
4. [브랜드 컬러 시스템 개선](#브랜드-컬러-시스템-개선)
5. [Scroll-Driven Animations 설계](#scroll-driven-animations-설계)
6. [구현 가이드](#구현-가이드)
7. [검증 체크리스트](#검증-체크리스트)

---

## 개요

### Phase 4.5의 목적

Phase 4에서 구현한 랜딩 페이지의 **임팩트 부족 문제**를 해결하기 위해:
1. **브랜드 컬러 시스템 개선**: 더 강렬하고 일관된 브랜드 컬러 적용
2. **Scroll-Driven Animations 도입**: 스크롤 기반 애니메이션으로 시각적 임팩트 강화

### Global Constraints 준수

```text
✅ 디자인은 최소화한다 (애니메이션은 기능적 목적만)
✅ 새로운 기능을 만들지 않는다 (기존 콘텐츠에 애니메이션만 추가)
✅ 기존 기능은 필요 시 제거한다
✅ 디자인 시스템을 벗어난 UI 추가 금지 (컬러는 디자인 시스템 내에서만 확장)
```

### Phase 4와의 관계

- **Phase 4**: Wireframe (Low Fidelity) - 구조와 레이아웃 정의
- **Phase 4.5**: Enhancement - 시각적 임팩트 강화 (애니메이션, 컬러)
- **Phase 5**: UI Implementation - 전체 UI 구현 (Phase 4.5 변경사항 반영)

---

## 목표

### 핵심 목표

1. **브랜드 컬러 시스템 강화**
   - 더 강렬한 브랜드 컬러 팔레트 정의
   - 그라데이션 및 컬러 전환 효과 추가
   - 다크 모드 대응 개선

2. **Scroll-Driven Animations 구현**
   - 스크롤 진행도에 따른 요소 등장 애니메이션
   - 섹션별 시각적 계층 강화
   - 부드러운 전환 효과

3. **임팩트 강화**
   - 첫 화면(Hero Section)의 시각적 임팩트 증가
   - 스크롤 시 자연스러운 정보 전달
   - 사용자 참여도 향상

### DoD (Definition of Done)

```text
✅ 브랜드 컬러 시스템 개선 완료 (토큰 업데이트, CSS 변수 반영)
✅ Scroll-driven animations 구현 완료 (Hero, About, Featured Projects)
✅ 성능 최적화 (60fps 유지, GPU 가속 활용)
✅ 접근성 유지 (prefers-reduced-motion 지원)
✅ 반응형 대응 (모바일에서도 부드러운 애니메이션)
```

---

## 작업 범위

### 포함 사항

- [x] 브랜드 컬러 시스템 개선
  - 컬러 팔레트 확장 (그라데이션, 강조 컬러)
  - CSS 변수 업데이트
  - 다크 모드 컬러 조정
- [x] Scroll-driven animations 구현
  - Hero Section: 페이드인 + 스케일 애니메이션
  - About Section: 스크롤 기반 텍스트 등장
  - Featured Projects: 카드 순차 등장 애니메이션
- [x] 성능 최적화
  - CSS `transform`, `opacity` 활용 (GPU 가속)
  - `will-change` 속성 최적화
  - `prefers-reduced-motion` 지원

### 제외 사항

- [ ] 새로운 페이지 추가
- [ ] 새로운 컴포넌트 추가 (기존 디자인 시스템 컴포넌트만 사용)
- [ ] 복잡한 인터랙션 (호버, 클릭 애니메이션은 기존 유지)

---

## 브랜드 컬러 시스템 개선

### 현재 컬러 시스템 (Phase 3 → Phase 4.5 개선)

**Light Mode (Revised):**
- Primary: `#7FA874` (Fresh Olive Green) ✅ **NEW - 더 생기있고 밝음**
- Accent: `#9EBF96` (Muted Olive)
- Success: `#A8D08D` (Light Sage)
- Highlight: `#EEF5E8` (Soft Green)

**Dark Mode (Revised):**
- Primary: `#4E7F63` (Vital Deep Green) ✅ **NEW - 더 그린 중심, 생명력 있음**
- Accent: `#7FB89A`
- Success: `#9FD6B2`

**개선 방향**: 톤은 유지하되, Primary Green만 명도·채도를 한 단계 올림
- 라이트 모드: 노란기 ↑ (생동감), 회기 ↓ (탁함 제거)
- 다크 모드: 청록 ↓, 초록 ↑, 회색기 제거

**상세**: [Revised Color Palette](../../technical/design-system/color-palette-revised.md) 참조

### 개선 방향

1. **섹션별 이미지 배치**
   - 각 섹션에 왼쪽 또는 오른쪽에 이미지 파일 배치
   - 2-column 레이아웃 (이미지 + 텍스트 콘텐츠)
   - 스크롤 시 이미지 등장 애니메이션

2. **섹션 구조**
   - Hero Section: 오른쪽에 이미지, 왼쪽에 텍스트
   - About Section: 왼쪽에 이미지, 오른쪽에 텍스트
   - Featured Projects Section: 오른쪽에 이미지, 왼쪽에 프로젝트 카드

3. **반응형 대응**
   - 모바일에서는 이미지와 텍스트를 세로로 배치
   - 데스크톱에서는 가로로 배치

---

## Scroll-Driven Animations 설계

### 기술 스택

- **CSS Scroll-driven Animations API** (최신 브라우저)
- **Intersection Observer API** (폴백)
- **`transform: scale()` 및 `transform: translateY()`** (GPU 가속)

### 애니메이션 전략

1. **성능 우선**
   - `transform`만 사용 (GPU 가속)
   - `will-change: transform` 최적화
   - `requestAnimationFrame` 활용

2. **접근성 고려**
   - `prefers-reduced-motion` 지원
   - 애니메이션 비활성화 옵션 제공

3. **점진적 향상**
   - 기본 레이아웃은 애니메이션 없이도 동작
   - 이미지가 없어도 콘텐츠는 정상 표시

### 섹션별 이미지 배치 구조

랜딩 페이지를 **5개 섹션**으로 구성하고, 각 섹션에 이미지 또는 콘텐츠를 배치하며, 스크롤 시 다양한 애니메이션을 적용합니다:

1. **Hero Section**: 왼쪽에 텍스트 콘텐츠, 오른쪽에 이미지
2. **About Section #1**: 왼쪽에 텍스트 콘텐츠, 오른쪽에 3개 AI 도구 로고 모임 애니메이션 (Cursor, Claude, Codex)
3. **About Section #2**: 왼쪽에 Cursor 사용 통계 이미지 (아래에서 fade-in), 오른쪽에 텍스트 콘텐츠
4. **Featured Projects 캐러셀**: 스크롤 진행도에 따라 3개 프로젝트 카드가 캐러셀 형식으로 이동, 각 카드가 중앙에 위치할 때 아래에 소개문구 표시
5. **CTA Section**: 최하단 섹션, 프로필/프로젝트 페이지로 이동하는 버튼 2개, 헤더와 푸터가 자연스럽게 등장

### Hero Section 이미지 배치

#### 목표
- 왼쪽에 텍스트 콘텐츠, 오른쪽에 이미지 배치
- 첫 화면 진입 시 이미지가 오른쪽에서 슬라이드 인
- 텍스트는 페이드인 + 스케일 효과

#### 구조

```tsx
<section className={styles.hero}>
  <div className={styles.container}>
    {/* 왼쪽: 텍스트 콘텐츠 */}
    <div className={styles.content}>
      <SectionTitle level="h1">이준경</SectionTitle>
      <SectionTitle level="h2">AI 적극 활용 개발자</SectionTitle>
      <p className={styles.intro}>
        AI 도구를 적극 활용하여 개발 효율성과 사용자 경험을 개선하는 개발자입니다.
      </p>
      <div className={styles.cta}>
        {/* 버튼들 */}
      </div>
    </div>
    
    {/* 오른쪽: 이미지 */}
    <div className={styles.imageWrapper}>
      <img 
        src="/images/hero-image.jpg" 
        alt="Hero" 
        className={styles.image}
      />
    </div>
  </div>
</section>
```

#### 구현

```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 64px 32px;
}

.hero .container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero .content {
  /* 텍스트 콘텐츠 스타일 */
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  animation: heroFadeIn 1s ease-out forwards;
}

.hero .imageWrapper {
  position: relative;
  opacity: 0;
  transform: translateX(40px);
  animation: heroImageSlideIn 1s ease-out 0.3s forwards;
}

.hero .image {
  width: 100%;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

@keyframes heroFadeIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes heroImageSlideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 반응형: 모바일에서는 세로 배치 */
@media (max-width: 768px) {
  .hero .container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .hero .imageWrapper {
    order: -1; /* 모바일에서 이미지를 위로 */
  }
}

/* 접근성: 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .hero .content,
  .hero .imageWrapper {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

#### 스크롤 감지 Hook

```typescript
// hooks/useScrollProgress.ts
import { useEffect, useState } from 'react';

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(scrollTop / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
};
```

### About Section #1 로고 모임 애니메이션

#### 목표
- 왼쪽에 텍스트 콘텐츠, 오른쪽에 3개의 AI 도구 로고 배치
- 스크롤 시 섹션 진입 시 로고들이 각각 다른 위치에서 중앙으로 모여옴
- 텍스트는 페이드인 효과

#### 구조

```tsx
<section id="about-1" className={styles.aboutSection}>
  <div className={styles.container}>
    {/* 왼쪽: 텍스트 콘텐츠 */}
    <div className={styles.content}>
      <SectionTitle level="h2">AI 활용 개발</SectionTitle>
      <p className={styles.summary}>
        Cursor, Claude, ChatGPT 등을 프로젝트 설계부터 디버깅까지 전 과정에 적극 활용합니다.
      </p>
    </div>
    
    {/* 오른쪽: 로고 모임 애니메이션 */}
    <div className={styles.logoContainer}>
      <div className={styles.logoWrapper}>
        <img 
          src="/landing/cursor_logo.png" 
          alt="Cursor" 
          className={styles.logo}
          data-logo="cursor"
        />
      </div>
      <div className={styles.logoWrapper}>
        <img 
          src="/landing/claude_code_logo.png" 
          alt="Claude" 
          className={styles.logo}
          data-logo="claude"
        />
      </div>
      <div className={styles.logoWrapper}>
        <img 
          src="/landing/codex_logo.png" 
          alt="Codex" 
          className={styles.logo}
          data-logo="codex"
        />
      </div>
    </div>
  </div>
</section>
```

#### 구현

```css
.aboutSection {
  min-height: 80vh;
  display: flex;
  align-items: center;
  padding: 64px 32px;
}

.aboutSection .container {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.aboutSection .content {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s;
}

.aboutSection.visible .content {
  opacity: 1;
  transform: translateY(0);
}

/* 로고 컨테이너 */
.aboutSection .logoContainer {
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aboutSection .logoWrapper {
  position: absolute;
  width: 120px;
  height: 120px;
  opacity: 0;
  transition: opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.aboutSection .logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* 초기 위치: 각 로고가 다른 위치에서 시작 */
.aboutSection .logoWrapper[data-logo="cursor"] {
  transform: translate(-150px, -100px) scale(0.5);
  transition-delay: 0.1s;
}

.aboutSection .logoWrapper[data-logo="claude"] {
  transform: translate(150px, -100px) scale(0.5);
  transition-delay: 0.3s;
}

.aboutSection .logoWrapper[data-logo="codex"] {
  transform: translate(0, 150px) scale(0.5);
  transition-delay: 0.5s;
}

/* 섹션 진입 시: 중앙으로 모임 */
.aboutSection.visible .logoWrapper {
  opacity: 1;
  transform: translate(0, 0) scale(1);
}

/* 로고 배치: 삼각형 형태로 배치 */
.aboutSection.visible .logoWrapper[data-logo="cursor"] {
  transform: translate(-80px, -40px) scale(1);
}

.aboutSection.visible .logoWrapper[data-logo="claude"] {
  transform: translate(80px, -40px) scale(1);
}

.aboutSection.visible .logoWrapper[data-logo="codex"] {
  transform: translate(0, 60px) scale(1);
}

/* 호버 효과 */
.aboutSection .logoWrapper:hover {
  transform: translate(0, 0) scale(1.1) !important;
  transition: transform 0.3s ease-out;
}

/* 반응형 */
@media (max-width: 768px) {
  .aboutSection .container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .aboutSection .logoContainer {
    height: 300px;
  }
  
  .aboutSection .logoWrapper {
    width: 80px;
    height: 80px;
  }
  
  /* 모바일에서는 세로로 배치 */
  .aboutSection.visible .logoWrapper[data-logo="cursor"] {
    transform: translate(0, -60px) scale(1);
  }
  
  .aboutSection.visible .logoWrapper[data-logo="claude"] {
    transform: translate(0, 0) scale(1);
  }
  
  .aboutSection.visible .logoWrapper[data-logo="codex"] {
    transform: translate(0, 60px) scale(1);
  }
}

/* 접근성: 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .aboutSection .logoWrapper {
    transition: none;
    opacity: 1;
    transform: translate(0, 0) scale(1) !important;
  }
}
```

### About Section #2 이미지 배치

#### 목표
- 왼쪽에 Cursor 사용 통계 이미지, 오른쪽에 텍스트 콘텐츠 배치
- 스크롤 시 섹션 진입 시 이미지가 아래에서 fade-in하며 등장
- 텍스트는 페이드인 효과

#### 구조

```tsx
<section id="about-2" className={styles.aboutSection}>
  <div className={styles.container}>
    {/* 왼쪽: Cursor 사용 통계 이미지 */}
    <div className={styles.imageWrapper}>
      <img 
        src="/landing/cursor_usage.jpg" 
        alt="Cursor Usage Statistics" 
        className={styles.image}
      />
    </div>
    
    {/* 오른쪽: 텍스트 콘텐츠 */}
    <div className={styles.content}>
      <SectionTitle level="h2">개발 효율성 향상</SectionTitle>
      <p className={styles.summary}>
        AI의 도움으로 빠르게 프로토타입을 만들고 반복 개선하여 개발 속도를 높입니다.
      </p>
    </div>
  </div>
</section>
```

#### 구현

```css
/* About Section #2는 이미지가 왼쪽에 배치 */
.aboutSection:nth-of-type(2) .container {
  grid-template-columns: 1fr 1fr;
}

.aboutSection:nth-of-type(2) .imageWrapper {
  opacity: 0;
  transform: translateY(60px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.aboutSection:nth-of-type(2).visible .imageWrapper {
  opacity: 1;
  transform: translateY(0);
}

.aboutSection:nth-of-type(2) .image {
  width: 100%;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.aboutSection:nth-of-type(2) .content {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s;
}

.aboutSection:nth-of-type(2).visible .content {
  opacity: 1;
  transform: translateY(0);
}

/* 반응형 */
@media (max-width: 768px) {
  .aboutSection:nth-of-type(2) .container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .aboutSection:nth-of-type(2) .imageWrapper {
    order: -1; /* 모바일에서 이미지를 위로 */
  }
}

/* 접근성: 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .aboutSection:nth-of-type(2) .imageWrapper,
  .aboutSection:nth-of-type(2) .content {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
```

### Featured Projects 캐러셀 섹션

#### 목표
- 스크롤 진행도에 따라 3개의 프로젝트 카드가 캐러셀 형식으로 가로 이동
- 각 카드가 중앙에 위치했을 때, 그 아래쪽 영역에 해당 프로젝트 소개문구 표시
- 스크롤 기반 인터랙션으로 자연스러운 전환

#### 구조

```tsx
<section id="featured-projects" className={styles.featuredProjects}>
  <div className={styles.carouselContainer}>
    <div 
      className={styles.carouselTrack}
      style={{ transform: `translateX(${carouselOffset}px)` }}
    >
      {/* 프로젝트 카드 1 */}
      <div className={`${styles.projectCard} ${activeCardIndex === 0 ? styles.active : ''}`}>
        {/* 이미지 영역 */}
        <div className={styles.imageArea}>
          {project.imageUrl ? (
            <img src={project.imageUrl} alt={project.title} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>📁</span>
            </div>
          )}
        </div>
        
        {/* 카드 본문 */}
        <div className={styles.cardContent}>
          <h3 className={styles.projectTitle}>{project.title}</h3>
          <TechStackList
            technologies={project.technologies}
            maxVisible={3}
            variant="default"
            size="sm"
            className={styles.techStack}
          />
        </div>
      </div>
      
      {/* 프로젝트 카드 2, 3도 동일한 구조 */}
    </div>
  </div>
  
  {/* 소개문구 영역 */}
  <div className={styles.descriptionArea}>
    {activeCardIndex === 0 && (
      <div className={styles.description}>
        <p>Genpresso 프로젝트에 대한 소개문구...</p>
      </div>
    )}
    {activeCardIndex === 1 && (
      <div className={styles.description}>
        <p>AI Chatbot 프로젝트에 대한 소개문구...</p>
      </div>
    )}
    {activeCardIndex === 2 && (
      <div className={styles.description}>
        <p>노루 ERP 프로젝트에 대한 소개문구...</p>
      </div>
    )}
  </div>
</section>
```

#### 스크롤 진행도 Hook

```typescript
// hooks/useCarouselScroll.ts
import { useEffect, useState, useRef } from 'react';

export const useCarouselScroll = (cardCount: number = 3) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 섹션이 뷰포트에 들어왔는지 확인
      if (rect.top < windowHeight && rect.bottom > 0) {
        // 섹션 내 스크롤 진행도 계산 (0 ~ 1)
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const scrollableHeight = sectionHeight - windowHeight;
        
        let progress = 0;
        if (sectionTop < 0) {
          // 섹션이 뷰포트 위로 올라갔을 때
          progress = Math.min(Math.abs(sectionTop) / scrollableHeight, 1);
        }
        
        setScrollProgress(progress);
        
        // 활성 카드 인덱스 계산 (0, 1, 2)
        const cardIndex = Math.floor(progress * (cardCount - 1));
        setActiveCardIndex(Math.min(cardIndex, cardCount - 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기값 설정
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cardCount]);

  return { scrollProgress, activeCardIndex, sectionRef };
};
```

#### 구현

```css
.featuredProjects {
  position: relative;
  min-height: 200vh; /* 스크롤 공간 확보 */
  padding: 64px 32px;
  overflow: hidden;
}

.featuredProjects .carouselContainer {
  position: sticky;
  top: 50%;
  transform: translateY(-50%);
  height: 60vh;
  overflow: hidden;
  margin-bottom: 40vh; /* 소개문구 영역 공간 */
}

.featuredProjects .carouselTrack {
  display: flex;
  gap: 64px;
  will-change: transform;
  transition: transform 0.1s ease-out;
}

.featuredProjects .projectCard {
  flex: 0 0 400px;
  height: auto;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: scale(0.9);
  opacity: 0.7;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.featuredProjects .projectCard.active {
  transform: scale(1);
  opacity: 1;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
}

.featuredProjects .projectCard .imageArea {
  width: 100%;
  height: 192px; /* h-48, 기존 메인페이지 카드와 동일 */
  background: linear-gradient(to-br, var(--surface-elevated), var(--background));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.featuredProjects .projectCard .imageArea img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featuredProjects .projectCard .imagePlaceholder {
  font-size: 4rem;
  color: var(--text-muted);
}

.featuredProjects .projectCard .cardContent {
  padding: 24px; /* p-6, 기존 메인페이지 카드와 동일 */
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.featuredProjects .projectCard .projectTitle {
  font-size: 1.5rem; /* text-2xl */
  font-weight: 800; /* font-extrabold */
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0;
}

.featuredProjects .projectCard .techStack {
  margin: 0;
}

.featuredProjects .descriptionArea {
  position: relative;
  min-height: 30vh;
  padding: 64px 32px;
  text-align: center;
}

.featuredProjects .description {
  max-width: 800px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.featuredProjects .descriptionArea .description:first-child {
  opacity: 1;
  transform: translateY(0);
}

/* 반응형 */
@media (max-width: 768px) {
  .featuredProjects .projectCard {
    flex: 0 0 300px;
    height: 400px;
  }
  
  .featuredProjects .carouselContainer {
    height: 50vh;
  }
}

/* 접근성: 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .featuredProjects .carouselTrack {
    transition: none;
  }
  
  .featuredProjects .projectCard {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Intersection Observer 구현

```typescript
// hooks/useScrollAnimation.ts
import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
        ...options,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible] as const;
};
```

### CTA Section (최하단 섹션)

#### 목표
- 최하단에 프로필 페이지와 프로젝트 페이지로 이동하는 버튼 2개 배치
- 섹션 진입 시 헤더가 위에서, 푸터가 아래에서 자연스럽게 등장
- 버튼은 페이드인 + 스케일 효과

#### 구조

```tsx
<section id="cta" className={styles.ctaSection}>
  <div className={styles.container}>
    <div className={styles.content}>
      <SectionTitle level="h2">더 알아보기</SectionTitle>
      <p className={styles.description}>
        프로필과 프로젝트를 자세히 살펴보세요.
      </p>
      <div className={styles.buttonGroup}>
        <Button 
          variant="primary" 
          size="lg"
          href="/profile"
          className={styles.ctaButton}
        >
          프로필 보기
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          href="/projects"
          className={styles.ctaButton}
        >
          프로젝트 보기
        </Button>
      </div>
    </div>
  </div>
</section>
```

#### 헤더/푸터 등장 애니메이션

```tsx
// Layout 컴포넌트에서 사용
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Layout: React.FC = ({ children }) => {
  const [ctaRef, isCtaVisible] = useScrollAnimation({
    threshold: 0.3,
  });
  
  return (
    <>
      <header 
        className={`${styles.header} ${isCtaVisible ? styles.visible : ''}`}
      >
        {/* 헤더 내용 */}
      </header>
      
      <main>
        {children}
        <CTASection ref={ctaRef} />
      </main>
      
      <footer 
        className={`${styles.footer} ${isCtaVisible ? styles.visible : ''}`}
      >
        {/* 푸터 내용 */}
      </footer>
    </>
  );
};
```

#### 구현

```css
.ctaSection {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  background: var(--background);
}

.ctaSection .container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
}

.ctaSection .content {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.ctaSection.visible .content {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.ctaSection .description {
  margin: 24px 0 48px;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.ctaSection .buttonGroup {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.ctaSection .ctaButton {
  min-width: 200px;
  padding: 16px 32px;
  font-size: 1.125rem;
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.ctaSection.visible .ctaButton:nth-child(1) {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition-delay: 0.2s;
}

.ctaSection.visible .ctaButton:nth-child(2) {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition-delay: 0.4s;
}

/* 헤더 등장 애니메이션 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.header.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 푸터 등장 애니메이션 */
.footer {
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.footer.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 반응형 */
@media (max-width: 768px) {
  .ctaSection .buttonGroup {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ctaSection .ctaButton {
    width: 100%;
  }
}

/* 접근성: 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .ctaSection .content,
  .ctaSection .ctaButton,
  .header,
  .footer {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
```

### 스크롤 진행도 Hook (Hero Section용)

```typescript
// hooks/useScrollProgress.ts
import { useEffect, useState } from 'react';

export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      // Hero Section 높이 내에서의 진행도 (0 ~ 1)
      const progress = Math.min(scrollTop / windowHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기값 설정
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollProgress;
};
```

---

## 구현 가이드

### Task 4.5.1: 브랜드 컬러 시스템 업데이트

#### 완료 ✅

브랜드 컬러 시스템 개선은 이미 완료되었습니다:
- Primary 컬러: `#7FA874` (Fresh Olive Green) - 라이트 모드
- Primary 컬러: `#4E7F63` (Vital Deep Green) - 다크 모드
- 관련 컬러 토큰 및 CSS 변수 업데이트 완료

**참고**: [Revised Color Palette](../../technical/design-system/color-palette-revised.md)

### Task 4.5.2: Scroll Animation Hooks 구현

#### 파일 생성: `frontend/src/hooks/useScrollAnimation.ts`

```typescript
// 위의 useScrollAnimation 구현 (Intersection Observer 기반)
```

#### 파일 생성: `frontend/src/hooks/useScrollProgress.ts`

```typescript
// 위의 useScrollProgress 구현 (Hero Section 이미지 슬라이드용, 선택적)
```

### Task 4.5.3: Hero Section 이미지 배치 적용

#### 파일 수정: `frontend/src/pages/HomePage/HeroSection.tsx`

```tsx
import styles from './HeroSection.module.css';

export const HeroSection: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h1">이준경</SectionTitle>
          <SectionTitle level="h2">AI 적극 활용 개발자</SectionTitle>
          <p className={styles.intro}>
            AI 도구를 적극 활용하여 개발 효율성과 사용자 경험을 개선하는 개발자입니다.
          </p>
          <div className={styles.cta}>
            {/* 버튼들 */}
          </div>
        </div>
        
        {/* 오른쪽: 이미지 */}
        <div className={styles.imageWrapper}>
          <img 
            src="/images/hero-image.jpg" 
            alt="Hero" 
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
};
```

#### 파일 수정: `frontend/src/pages/HomePage/HeroSection.module.css`

```css
/* 위의 Hero Section 이미지 배치 CSS 추가 */
/* 이미지 경로: /images/hero-image.jpg */
```

### Task 4.5.4: About Section #1, #2 이미지 배치 적용

#### 파일 수정: `frontend/src/pages/HomePage/AboutSection1.tsx`

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from './AboutSection.module.css';

export const AboutSection1: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation();
  
  return (
    <section 
      id="about-1" 
      ref={ref}
      className={`${styles.aboutSection} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.container}>
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h2">AI 활용 개발</SectionTitle>
          <p className={styles.summary}>
            Cursor, Claude, ChatGPT 등을 프로젝트 설계부터 디버깅까지 전 과정에 적극 활용합니다.
          </p>
        </div>
        
        {/* 오른쪽: 로고 모임 애니메이션 */}
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <img 
              src="/landing/cursor_logo.png" 
              alt="Cursor" 
              className={styles.logo}
              data-logo="cursor"
            />
          </div>
          <div className={styles.logoWrapper}>
            <img 
              src="/landing/claude_code_logo.png" 
              alt="Claude" 
              className={styles.logo}
              data-logo="claude"
            />
          </div>
          <div className={styles.logoWrapper}>
            <img 
              src="/landing/codex_logo.png" 
              alt="Codex" 
              className={styles.logo}
              data-logo="codex"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
```

#### 파일 수정: `frontend/src/pages/HomePage/AboutSection2.tsx`

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import styles from './AboutSection.module.css';

export const AboutSection2: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation();
  
  return (
    <section 
      id="about-2" 
      ref={ref}
      className={`${styles.aboutSection} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.container}>
        {/* 왼쪽: Cursor 사용 통계 이미지 */}
        <div className={styles.imageWrapper}>
          <img 
            src="/landing/cursor_usage.jpg" 
            alt="Cursor Usage Statistics" 
            className={styles.image}
          />
        </div>
        
        {/* 오른쪽: 텍스트 콘텐츠 */}
        <div className={styles.content}>
          <SectionTitle level="h2">개발 효율성 향상</SectionTitle>
          <p className={styles.summary}>
            AI의 도움으로 빠르게 프로토타입을 만들고 반복 개선하여 개발 속도를 높입니다.
          </p>
        </div>
      </div>
    </section>
  );
};
```

#### 파일 수정: `frontend/src/pages/HomePage/AboutSection.module.css`

```css
/* 위의 About Section #1 로고 모임 애니메이션 CSS 추가 */
/* 로고 경로: /landing/cursor_logo.png, /landing/claude_code_logo.png, /landing/codex_logo.png */
/* About Section #2는 이미지 아래에서 fade-in 애니메이션 CSS 추가 */
/* 이미지 경로: /landing/cursor_usage.jpg */
```

### Task 4.5.5: Featured Projects 캐러셀 섹션 적용

#### 파일 생성: `frontend/src/hooks/useCarouselScroll.ts`

```typescript
// 위의 useCarouselScroll Hook 구현
```

#### 파일 수정: `frontend/src/pages/HomePage/FeaturedProjectsSection.tsx`

```tsx
import { useCarouselScroll } from '@/hooks/useCarouselScroll';
import { TechStackList } from '@/components/common/TechStack'; // 또는 해당 경로
import styles from './FeaturedProjectsSection.module.css';

// Phase 4: 하드코딩된 예시 데이터
// Phase 5에서 API 연동으로 교체 예정
const PROJECTS = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    imageUrl: '/images/project-1.jpg',
    technologies: ['TypeScript', 'React', 'Node.js'], // 기술스택 배열
    description: 'Genpresso 프로젝트에 대한 소개문구...',
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    imageUrl: '/images/project-2.jpg',
    technologies: ['Python', 'FastAPI', 'OpenAI'],
    description: 'AI Chatbot 프로젝트에 대한 소개문구...',
  },
  {
    id: 'noru-erp',
    title: '노루 ERP',
    imageUrl: '/images/project-3.jpg',
    technologies: ['Java', 'Spring', 'PostgreSQL'],
    description: '노루 ERP 프로젝트에 대한 소개문구...',
  },
];

export const FeaturedProjectsSection: React.FC = () => {
  const { scrollProgress, activeCardIndex, sectionRef } = useCarouselScroll(3);
  
  // 캐러셀 오프셋 계산
  const cardWidth = 400; // 카드 너비 + gap
  const carouselOffset = -scrollProgress * (cardWidth * 2); // 3개 카드 중 마지막까지 이동
  
  return (
    <section 
      id="featured-projects" 
      ref={sectionRef}
      className={styles.featuredProjects}
    >
      <div className={styles.carouselContainer}>
        <div 
          className={styles.carouselTrack}
          style={{ transform: `translateX(${carouselOffset}px)` }}
        >
          {PROJECTS.map((project, index) => (
            <div 
              key={project.id}
              className={`${styles.projectCard} ${activeCardIndex === index ? styles.active : ''}`}
            >
              {/* 이미지 영역 */}
              <div className={styles.imageArea}>
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt={project.title} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>📁</span>
                  </div>
                )}
              </div>
              
              {/* 카드 본문 */}
              <div className={styles.cardContent}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <TechStackList
                  technologies={project.technologies}
                  maxVisible={3}
                  variant="default"
                  size="sm"
                  className={styles.techStack}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 소개문구 영역 */}
      <div className={styles.descriptionArea}>
        {PROJECTS.map((project, index) => (
          <div 
            key={project.id}
            className={styles.description}
            style={{
              opacity: activeCardIndex === index ? 1 : 0,
              transform: activeCardIndex === index ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
```

#### 파일 수정: `frontend/src/pages/HomePage/FeaturedProjectsSection.module.css`

```css
/* 위의 Featured Projects 캐러셀 CSS 추가 */
/* 카드 구조: 이미지 영역 (h-48) + 본문 (프로젝트명 + TechStackList) */
/* 기존 메인페이지 ProjectCard 구조 참고 */
/* 이미지 경로: /images/project-1.jpg, /images/project-2.jpg, /images/project-3.jpg */
```

### Task 4.5.6: CTA Section 및 헤더/푸터 애니메이션 적용

#### 파일 수정: `frontend/src/pages/HomePage/CTASection.tsx`

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/design-system';
import styles from './CTASection.module.css';

export const CTASection: React.FC = () => {
  const [ref, isVisible] = useScrollAnimation({
    threshold: 0.3,
  });
  
  return (
    <section 
      id="cta" 
      ref={ref}
      className={`${styles.ctaSection} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <SectionTitle level="h2">더 알아보기</SectionTitle>
          <p className={styles.description}>
            프로필과 프로젝트를 자세히 살펴보세요.
          </p>
          <div className={styles.buttonGroup}>
            <Button 
              variant="primary" 
              size="lg"
              href="/profile"
              className={styles.ctaButton}
            >
              프로필 보기
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              href="/projects"
              className={styles.ctaButton}
            >
              프로젝트 보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
```

#### 파일 수정: `frontend/src/pages/HomePage/CTASection.module.css`

```css
/* 위의 CTA Section CSS 추가 */
```

#### 파일 수정: `frontend/src/components/Layout/Layout.tsx` (또는 해당 레이아웃 컴포넌트)

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { CTASection } from '@/pages/HomePage/CTASection';
import styles from './Layout.module.css';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ctaRef, isCtaVisible] = useScrollAnimation({
    threshold: 0.3,
  });
  
  return (
    <>
      <header 
        className={`${styles.header} ${isCtaVisible ? styles.visible : ''}`}
      >
        {/* 헤더 내용 */}
      </header>
      
      <main>
        {children}
        <CTASection ref={ctaRef} />
      </main>
      
      <footer 
        className={`${styles.footer} ${isCtaVisible ? styles.visible : ''}`}
      >
        {/* 푸터 내용 */}
      </footer>
    </>
  );
};
```

#### 파일 수정: `frontend/src/components/Layout/Layout.module.css`

```css
/* 헤더 등장 애니메이션 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.header.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 푸터 등장 애니메이션 */
.footer {
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.footer.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 접근성: 애니메이션 비활성화 */
@media (prefers-reduced-motion: reduce) {
  .header,
  .footer {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
```

### Task 4.5.7: 접근성 지원

#### 파일 생성: `frontend/src/utils/accessibility.ts`

```typescript
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
```

#### CSS에 접근성 규칙 추가

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 검증 체크리스트

### Task 4.5.1: 브랜드 컬러 시스템 업데이트

- [x] 컬러 토큰 파일 업데이트 완료
- [x] CSS 변수 업데이트 완료
- [x] 다크 모드 컬러 변수 추가 완료
- [x] 브라우저에서 컬러 변수 정상 작동 확인 완료

**상태**: ✅ 완료

### Task 4.5.2: Scroll Animation Hooks 구현

- [ ] `useScrollAnimation` 훅 구현 (Intersection Observer)
- [ ] Intersection Observer 정상 작동 확인
- [ ] 옵션 커스터마이징 가능 확인

### Task 4.5.3: Hero Section 이미지 배치

- [ ] 2-column 레이아웃 구현 (왼쪽: 텍스트, 오른쪽: 이미지)
- [ ] 이미지 슬라이드 인 애니메이션 (오른쪽에서)
- [ ] 텍스트 페이드인 + 스케일 애니메이션
- [ ] 이미지 파일 준비 (`/images/hero-image.jpg`)
- [ ] 반응형 레이아웃 (모바일: 세로 배치)
- [ ] 초기 로드 시 자동 실행 확인
- [ ] 성능 확인 (60fps 유지)

### Task 4.5.4: About Section #1, #2 이미지 배치

#### About Section #1 (로고 모임 애니메이션)
- [ ] 2-column 레이아웃 구현 (왼쪽: 텍스트, 오른쪽: 로고 컨테이너)
- [ ] 3개 로고 초기 위치 설정 (각각 다른 위치에서 시작)
  - [ ] Cursor 로고: 왼쪽 위에서 시작
  - [ ] Claude 로고: 오른쪽 위에서 시작
  - [ ] Codex 로고: 아래에서 시작
- [ ] 로고 모임 애니메이션 구현 (중앙으로 삼각형 형태로 모임)
- [ ] 텍스트 페이드인 애니메이션
- [ ] 로고 파일 준비 (`/landing/cursor_logo.png`, `/landing/claude_code_logo.png`, `/landing/codex_logo.png`)
- [ ] Intersection Observer 트리거 확인
- [ ] 로고 호버 효과 확인
- [ ] 반응형 레이아웃 확인 (모바일: 세로 배치)

#### About Section #2
- [ ] 2-column 레이아웃 구현 (왼쪽: 이미지, 오른쪽: 텍스트)
- [ ] 이미지 아래에서 fade-in 애니메이션 구현 (`translateY(60px)` → `translateY(0)`)
- [ ] 이미지 opacity 애니메이션 (0 → 1)
- [ ] 텍스트 페이드인 애니메이션 (delay: 0.3s)
- [ ] 이미지 파일 준비 (`/landing/cursor_usage.jpg`)
- [ ] Intersection Observer 트리거 확인
- [ ] 반응형 레이아웃 확인 (모바일: 이미지 위로)

### Task 4.5.5: Featured Projects 캐러셀 섹션

- [ ] `useCarouselScroll` Hook 구현
  - [ ] 스크롤 진행도 계산 (0 ~ 1)
  - [ ] 활성 카드 인덱스 계산 (0, 1, 2)
  - [ ] 섹션 뷰포트 진입 감지
- [ ] 캐러셀 컨테이너 구조 구현
  - [ ] sticky 포지셔닝 (중앙 고정)
  - [ ] 캐러셀 트랙 (가로 스크롤)
  - [ ] 3개 프로젝트 카드 배치
- [ ] 스크롤 기반 캐러셀 이동 구현
  - [ ] 스크롤 진행도에 따른 `translateX` 계산
  - [ ] 부드러운 전환 (transition)
- [ ] 프로젝트 카드 구조 구현 (기존 메인페이지 ProjectCard 참고)
  - [ ] 이미지 영역 (height: 192px, h-48)
    - [ ] 이미지가 있으면 표시
    - [ ] 이미지가 없으면 placeholder (📁 아이콘)
  - [ ] 카드 본문 (padding: 24px, p-6)
    - [ ] 프로젝트명 (h3, text-2xl, font-extrabold)
    - [ ] TechStackList 컴포넌트 사용 (maxVisible: 3, size: sm)
- [ ] 활성 카드 스타일링
  - [ ] 중앙 카드: `scale(1)`, `opacity(1)`
  - [ ] 비활성 카드: `scale(0.9)`, `opacity(0.7)`
- [ ] 소개문구 영역 구현
  - [ ] 활성 카드에 따른 소개문구 표시/숨김
  - [ ] fade-in 애니메이션 (opacity, translateY)
- [ ] 이미지 파일 준비
  - [ ] `/images/project-1.jpg` (Genpresso)
  - [ ] `/images/project-2.jpg` (AI Chatbot)
  - [ ] `/images/project-3.jpg` (노루 ERP)
- [ ] 성능 최적화
  - [ ] `will-change: transform` 적용
  - [ ] `passive: true` 스크롤 리스너
  - [ ] 60fps 유지 확인

### Task 4.5.6: CTA Section 및 헤더/푸터 애니메이션

- [ ] CTA Section 컴포넌트 구현
  - [ ] 섹션 구조 (제목, 설명, 버튼 2개)
  - [ ] 프로필 페이지 버튼 (`/profile`)
  - [ ] 프로젝트 페이지 버튼 (`/projects`)
  - [ ] Intersection Observer 적용
- [ ] CTA Section 애니메이션
  - [ ] 콘텐츠 페이드인 + 스케일 애니메이션
  - [ ] 버튼 순차 등장 (delay: 0.2s, 0.4s)
- [ ] 헤더 등장 애니메이션
  - [ ] CTA Section 진입 시 헤더가 위에서 등장
  - [ ] `translateY(-100%)` → `translateY(0)`
  - [ ] opacity: 0 → 1
- [ ] 푸터 등장 애니메이션
  - [ ] CTA Section 진입 시 푸터가 아래에서 등장
  - [ ] `translateY(100%)` → `translateY(0)`
  - [ ] opacity: 0 → 1
- [ ] Layout 컴포넌트 수정
  - [ ] CTA Section ref 전달
  - [ ] 헤더/푸터에 visible 클래스 조건부 적용
- [ ] 반응형 레이아웃 확인
- [ ] 접근성 확인 (`prefers-reduced-motion`)

### Task 4.5.7: 접근성 및 성능

- [ ] `prefers-reduced-motion` 지원 확인
- [ ] 애니메이션 비활성화 시 레이아웃 정상 확인
- [ ] 성능 프로파일링 (60fps 유지)
- [ ] GPU 가속 확인 (Chrome DevTools)

### 반응형 검증

- [ ] Desktop에서 애니메이션 정상 작동
- [ ] Tablet에서 애니메이션 정상 작동
- [ ] Mobile에서 애니메이션 정상 작동 (성능 확인)

---

## 다음 단계

### Phase 5: UI Implementation

Phase 4.5 완료 후, Phase 5에서 전체 UI 구현 시 이 변경사항을 반영합니다.

**Phase 5 작업 시 고려사항:**
- Phase 4.5의 애니메이션 패턴을 다른 페이지에도 적용 가능한지 검토
- 성능 최적화 지속 모니터링
- 사용자 피드백 수집 및 개선

---

## 참고 문서

### Epic 문서
- [Epic README](./README.md)
- [Phase 4 설계 문서](./phase-4-design.md)
- [Phase 3 설계 문서](./phase-3-design.md)

### 기술 문서
- [CSS Scroll-driven Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---

**검토자**: 사용자 확인 필요  
**최종 승인**: 대기 중
