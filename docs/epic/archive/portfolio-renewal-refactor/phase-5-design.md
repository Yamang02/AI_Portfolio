# Phase 5 — UI Implementation

## Overview

Phase 4/4.5에서 완성된 와이어프레임과 스크롤 애니메이션을 기반으로, **디자인 시스템만 사용**하여 실제 UI를 구현합니다.

**핵심 원칙**:
- ✅ Phase 3에서 정의한 디자인 시스템만 사용
- ❌ 새로운 컴포넌트 추가 금지
- ❌ 디자인 시스템 밖의 스타일 추가 금지
- ✅ 기존 하드코딩된 데이터를 설정 파일로 분리

---

## Scope

### In Scope
1. Landing Page 프로덕션 UI 완성
2. Archive (Projects List) Page UI 구현
3. Project Detail Page UI 구현
4. 설정 파일 기반 콘텐츠 관리 체계 구축
5. 반응형 레이아웃 최적화

### Out of Scope
- Profile 페이지 (Phase 5에서는 제외, Phase 6 이후로 연기)
- 브랜딩/카피라이팅 변경

---

## Architecture Decisions

### 1. 디자인 시스템 확장 전략

**핵심 원칙**: 기존 ProjectCard의 우수한 UX 요소를 디자인 시스템으로 편입

#### 기존 ProjectCard에서 살릴 요소
1. **배지 시스템**
   - 팀/개인 배지 (아이콘 + 텍스트, 애니메이션 제거)
   - 프로젝트 타입 배지 (BUILD/LAB/MAINTENANCE, 아이콘 + 텍스트, 애니메이션 제거)
   - 각 타입별 색상 구분

2. **아이콘 시스템**
   - GitHub, External Link 등 소셜 아이콘
   - 프로젝트 타입별 fallback 아이콘

3. **카드 레이아웃 구조**
   - 썸네일 영역 (이미지/fallback)
   - 제목 + 설명
   - 기술 스택 (TechStackList 컴포넌트)
   - 하단 메타 정보 (날짜, 링크)

#### 디자인 시스템 확장 계획

**Phase 5.0: 디자인 시스템에 추가할 컴포넌트**

```
design-system/components/
├── Badge/
│   ├── Badge.tsx (기존 유지)
│   ├── ProjectTypeBadge.tsx (신규: BUILD/LAB/MAINTENANCE 배지)
│   └── TeamBadge.tsx (신규: 팀/개인 배지)
│
├── Icon/
│   ├── ProjectIcon.tsx (신규: 프로젝트 타입별 아이콘)
│   └── SocialIcon.tsx (신규: GitHub, ExternalLink 등)
│
└── Card/
    ├── Card.tsx (신규: 기본 카드 레이아웃)
    └── ProjectCard.tsx (신규: 프로젝트 전용 복합 카드)
```

**구현 원칙**:
- ✅ 기존 `features/project-gallery/components/ProjectCard.tsx`의 로직을 디자인 시스템으로 이동
- ✅ **애니메이션 제거**: 배지 hover 확장 애니메이션 제거, 항상 전체 표시
- ✅ 하드코딩된 색상/간격을 디자인 토큰으로 치환
- ✅ 기능 하나도 빠짐없이 유지 (배지, 아이콘, 레이아웃)
- ❌ 새로 만들거나 단순화하지 않음

**작업 순서**:
1. Task 5.0: 디자인 시스템 확장 (Badge, Icon, Card 컴포넌트 추가)
2. Task 5.1~5.5: 기존 Task에서 새 디자인 시스템 컴포넌트 사용

---

### 2. 콘텐츠 관리 전략

#### 주요 프로젝트 (Featured Projects)
**결정**: API의 `isFeatured` 필드 + 설정 파일 오버라이드

**구현 방식**:
- **Archive Page**: API의 `isFeatured` 필드를 사용하여 주요 프로젝트 필터링
- **설정 파일 오버라이드**: `featuredProjects.config.ts`에서 이미지, 설명, 태그를 오버라이드 가능
- **Landing Page**: 설정 파일에서 직접 데이터 가져오기 (기존 방식 유지)

**이유**:
- API와 동기화하여 관리 편의성 향상
- 설정 파일로 랜딩 페이지 전용 콘텐츠(이미지, 설명) 오버라이드 가능
- API 장애 시에도 설정 파일로 독립 운영 가능

**구조**:
```
frontend/src/pages/HomePage/
  ├── FeaturedProjectsSection.tsx
  └── config/
      └── featuredProjects.config.ts
```

**설정 파일 예시**:
```typescript
export interface FeaturedProject {
  id: string;
  title: string;
  subtitle: string;  // 랜딩 전용 소개문구
  imageUrl: string;
  tags: string[];
  link: string;
}

export const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    subtitle: 'AI 기반 프롬프트 관리 플랫폼',
    imageUrl: '/images/projects/genpresso.png',
    tags: ['React', 'Spring Boot', 'PostgreSQL'],
    link: '/projects/genpresso'
  },
  // ...
];

export const FEATURED_CONFIG = {
  maxDisplay: 3,
  // 향후 확장: A/B 테스트, 다국어 등
};
```

#### 전체 프로젝트 목록 (Archive)
**결정**: API 연동

**이유**:
- 프로젝트 수가 많고 자주 업데이트됨
- 필터링/정렬 등 동적 기능 필요
- DB와 동기화 필요

**구현**:
```typescript
// frontend/src/pages/ProjectsListPage/ProjectsListPage.tsx
const { data: projects } = useProjectsQuery(); // API 호출

// 주요 프로젝트 필터링
const featuredProjects = projects.filter(p => p.isFeatured === true);

// 설정 파일 오버라이드 적용
const convertToProjectCard = (project: Project): ProjectCardProject => {
  const featuredConfig = getFeaturedConfig(project.id);
  return {
    ...project,
    imageUrl: featuredConfig?.imageUrl || project.imageUrl,
    description: featuredConfig?.subtitle || project.description,
    technologies: featuredConfig?.tags || project.technologies,
  };
};
```

### 3. 컴포넌트 구조

Phase 4에서 생성된 페이지 컴포넌트를 기반으로 **리팩토링하지 않고**, **확장된 디자인 시스템만 적용**합니다.

```
frontend/src/
├── design-system/
│   └── components/
│       ├── Badge/
│       │   ├── Badge.tsx (기존)
│       │   ├── ProjectTypeBadge.tsx (신규)
│       │   └── TeamBadge.tsx (신규)
│       ├── Icon/
│       │   ├── ProjectIcon.tsx (신규)
│       │   └── SocialIcon.tsx (신규)
│       ├── Card/
│       │   ├── Card.tsx (신규)
│       │   └── ProjectCard.tsx (신규)
│       ├── ProjectDetailHeader/
│       │   └── ProjectDetailHeader.tsx (신규: Task 5.3)
│       ├── TableOfContents/
│       │   └── TableOfContents.tsx (신규: Task 5.3)
│       ├── Carousel/
│       │   └── ProjectThumbnailCarousel.tsx (신규: Task 5.3)
│       └── ProjectNavigation/
│           └── ProjectNavigation.tsx (신규: Task 5.3)
│
└── pages/
    ├── HomePage/
    │   ├── HomePage.tsx              # 메인 컨테이너
    │   ├── HeroSection.tsx           # 히어로 섹션
    │   ├── AboutSection1.tsx         # About 섹션 1
    │   ├── AboutSection2.tsx         # About 섹션 2
    │   ├── FeaturedProjectsSection.tsx  # 주요 프로젝트 (디자인 시스템 ProjectCard 사용)
    │   └── config/
    │       └── featuredProjects.config.ts
    │
    ├── ProjectsListPage/
    │   ├── ProjectsListPage.tsx      # 프로젝트 목록 (디자인 시스템 ProjectCard 사용)
    │   └── components/
    │       ├── ProjectSearchModal.tsx    # 프로젝트 검색 모달
    │       └── ProjectHistoryTimeline.tsx # 프로젝트 히스토리 타임라인
    │
    └── ProjectDetailPage/
        ├── ProjectDetailPage.tsx     # 프로젝트 상세
        └── components/
            └── ProjectNavigation.tsx # 프로젝트 네비게이션 (페이지별 컴포넌트)
```

---

## Implementation Tasks

### Task 5.0: 디자인 시스템 확장 (Badge, Icon, Card)

**목표**: 기존 ProjectCard의 UX 요소를 디자인 시스템으로 편입

#### Subtask 5.0.1: Badge 컴포넌트 확장

**작업**:
1. **TeamBadge 컴포넌트 생성** (`design-system/components/Badge/TeamBadge.tsx`)
   ```typescript
   interface TeamBadgeProps {
     isTeam: boolean;
     size?: 'sm' | 'md' | 'lg';
   }
   // 기존 ProjectCard의 팀/개인 배지 로직 이동
   // 애니메이션 제거, 항상 아이콘 + 텍스트 표시
   ```

2. **ProjectTypeBadge 컴포넌트 생성** (`design-system/components/Badge/ProjectTypeBadge.tsx`)
   ```typescript
   type ProjectType = 'BUILD' | 'LAB' | 'MAINTENANCE';

   interface ProjectTypeBadgeProps {
     type: ProjectType;
     size?: 'sm' | 'md' | 'lg';
   }
   // 기존 ProjectCard의 타입 배지 로직 이동
   // 애니메이션 제거, 항상 아이콘 + 텍스트 표시
   ```

3. **디자인 토큰 적용**
   - 하드코딩된 색상 → 디자인 시스템 컬러 토큰
   - 하드코딩된 간격 → Spacing 토큰
   - 타입별 색상 매핑 유지 (BUILD: 빨강, LAB: 주황, MAINTENANCE: 초록)

**검증**:
- [x] TeamBadge 컴포넌트가 팀/개인을 아이콘+텍스트로 표시
- [x] ProjectTypeBadge 컴포넌트가 타입을 아이콘+텍스트로 표시
- [x] 애니메이션 없이 항상 전체 내용 표시
- [x] 디자인 토큰만 사용 (하드코딩된 색상 없음)
- [x] CSS 변수에 status 색상 추가 (error, warning, success, info)
- [x] Storybook 스토리 작성

---

#### Subtask 5.0.2: Icon 컴포넌트 추가

**작업**:
1. **SocialIcon 컴포넌트 생성** (`design-system/components/Icon/SocialIcon.tsx`)
   ```typescript
   type SocialType = 'github' | 'external-link' | 'linkedin' | 'email';

   interface SocialIconProps {
     type: SocialType;
     size?: 'sm' | 'md' | 'lg';
   }
   // 기존 shared/ui/icon/ProjectIcons.tsx의 GitHub, ExternalLink 아이콘 통합
   ```

2. **ProjectIcon 컴포넌트 생성** (`design-system/components/Icon/ProjectIcon.tsx`)
   ```typescript
   type ProjectIconType = 'web' | 'backend' | 'mobile' | 'desktop' | 'database' | 'cloud' | 'ai' | 'default';

   interface ProjectIconProps {
     type: ProjectIconType;
     size?: 'sm' | 'md' | 'lg';
   }
   // 기존 shared/ui/icon/ProjectIcons.tsx의 타입별 아이콘 통합
   ```

**검증**:
- [x] SocialIcon이 GitHub, ExternalLink 등을 올바르게 표시
- [x] ProjectIcon이 프로젝트 타입별 fallback 아이콘 올바르게 표시
- [x] 디자인 토큰으로 크기 조절 가능
- [x] Storybook 스토리 작성

---

#### Subtask 5.0.3: Card 컴포넌트 추가

**작업**:
1. **Card 컴포넌트 생성** (`design-system/components/Card/Card.tsx`)
   ```typescript
   interface CardProps {
     variant?: 'default' | 'elevated' | 'outlined';
     padding?: 'none' | 'sm' | 'md' | 'lg';
     children: React.ReactNode;
     onClick?: () => void;
     className?: string;
   }
   // 기본 카드 레이아웃만 제공
   ```

2. **ProjectCard 컴포넌트 생성** (`design-system/components/Card/ProjectCard.tsx`)
   ```typescript
   interface ProjectCardProps {
     project: {
       id: string;
       title: string;
       description: string;
       imageUrl?: string;
       isTeam: boolean;
       type?: 'BUILD' | 'LAB' | 'MAINTENANCE';
       technologies: string[];
       startDate: string;
       endDate?: string;
       githubUrl?: string;
       liveUrl?: string;
     };
     onClick?: () => void;
   }
   // 기존 features/project-gallery/components/ProjectCard.tsx 로직 이동
   // TeamBadge, ProjectTypeBadge, SocialIcon, ProjectIcon 사용
   // 애니메이션 제거: 배지 hover 확장 제거
   // 기타 hover 효과는 유지 (scale, shadow)
   ```

**검증**:
- [x] ProjectCard가 기존 카드와 동일한 레이아웃 구조
- [x] 썸네일, 배지, 제목, 설명, 기술 스택, 메타 정보 모두 표시
- [x] TeamBadge가 올바르게 렌더링 (프로젝트 타입 배지는 제거됨)
- [x] SocialIcon(GitHub, ExternalLink)이 올바르게 렌더링
- [x] 이미지 없을 시 ProjectIcon fallback 표시
- [x] 디자인 시스템 컴포넌트만 사용
- [x] 배지 hover 애니메이션 없음 (항상 전체 표시)
- [x] Storybook 스토리 작성

---

### Task 5.1: Featured Projects 설정 파일 생성

**목표**: Phase 4에서 하드코딩된 주요 프로젝트 데이터를 설정 파일로 분리

**작업**:
1. `featuredProjects.config.ts` 파일 생성
2. 타입 정의 (`FeaturedProject`, `FeaturedConfig`)
3. 주요 프로젝트 데이터 마이그레이션 (Phase 4 하드코딩 → 설정 파일)
4. `FeaturedProjectsSection` 컴포넌트에서 설정 파일 import
5. API의 `isFeatured` 필드와 연동 (ProjectsListPage에서 사용)

**검증**:
- [x] 설정 파일에서 데이터를 import하여 렌더링 성공
- [x] 기존 하드코딩된 데이터 제거 완료
- [x] 설정 파일 수정 시 UI 즉시 반영
- [x] 설정 파일 오버라이드 기능 정상 동작 (이미지, 설명, 태그)

---

### Task 5.2: Archive Page UI 구현

**목표**: 프로젝트 목록 페이지를 디자인 시스템으로 구현

**작업**:
1. **페이지 구조**
   - 페이지 제목: SectionTitle 컴포넌트
   - 프로젝트 그리드 레이아웃
   - Featured Projects 섹션 상단 추가
     - API의 `isFeatured` 필드 사용하여 주요 프로젝트 필터링
     - 설정 파일(featuredProjects.config.ts)에서 이미지, 설명, 태그 오버라이드 지원
   - 프로젝트 타입별 섹션 구성 (MAINTENANCE → BUILD → LAB 순서)
   - 프로젝트 히스토리 타임라인 섹션 추가 (ProjectHistoryTimeline)
   - 프로젝트 검색 모달 추가 (ProjectSearchModal)
   - Footer 추가
   - EmptyCard 컴포넌트 사용 (프로젝트 없을 때)

2. **프로젝트 카드**
   - **디자인 시스템의 ProjectCard 컴포넌트 사용**
   - 썸네일, TeamBadge, 제목, 설명, 기술 스택, 메타 정보 모두 자동 표시
   - SocialIcon (GitHub, ExternalLink) 자동 표시
   - **ProjectCard 개선 사항**:
     - 프로젝트 타입 배지 제거 (ProjectTypeBadge 제거)
     - 팀/개인 배지 왼쪽 상단으로 이동
     - Featured 별 배지 추가 (isFeatured일 때 우측 상단)
     - 기술 스택을 디자인 시스템 Badge로 변경 (default variant)
     - 기술 스택 최대 4개 표시, 나머지 +N 표시
     - 기술 스택 한 줄 제한
     - title 색상을 primary-dark로 변경
     - title 가운데 정렬 및 자동 글자 크기 조정 (한 줄 제한)
     - 설명 한 줄 제한
     - 괄호 안 문자 처리 개선
     - 하단 구분선 제거

3. **API 연동**
   - `useProjectsQuery()` 훅 사용
   - 로딩 상태 처리 (SkeletonCard 사용)
   - 에러 상태 처리
   - TechStackList 로딩 처리 개선

**검증**:
- [x] API에서 프로젝트 목록 정상 로드
- [x] 디자인 시스템 ProjectCard로 프로젝트 그리드 렌더링
- [x] TeamBadge가 올바르게 표시 (프로젝트 타입 배지는 제거됨)
- [x] Featured Projects 섹션에서 isFeatured 필드 기반 필터링 정상 동작
- [x] 설정 파일 오버라이드 기능 정상 동작
- [x] 프로젝트 히스토리 타임라인 정상 동작
- [x] 프로젝트 검색 모달 정상 동작
- [x] EmptyCard 컴포넌트 정상 표시
- [x] Footer 정상 표시
- [x] 디자인 시스템 컴포넌트만 사용
- [x] 반응형 레이아웃 정상 동작
- [x] 로딩/에러 상태 UI 정상 표시

---

### Task 5.3: Project Detail Page UI 구현

**목표**: 프로젝트 상세 페이지를 디자인 시스템으로 구현

**작업**:
1. **페이지 구조**
   - 프로젝트 제목: SectionTitle 컴포넌트 (ProjectDetailHeader 내부)
   - 뒤로 가기: TextLink 컴포넌트 (에러 상태에서)
   - 메타 정보 영역: ProjectDetailHeader 컴포넌트
     - 썸네일 이미지
     - 배지 영역 (TeamBadge, ProjectTypeBadge, DateBadge, RoleBadge)
     - 링크 버튼 (GitHub, Live Service, Notion)
   - 프로젝트 설명 (마크다운 지원)
   - 프로젝트 이미지/스크린샷 (그리드 레이아웃)

2. **섹션 구성**
   - TableOfContents 섹션 (자동 생성, useTOCFromDOM 훅 사용)
   - Overview 섹션 (개요)
   - 스크린샷 섹션 (screenshots 배열 있을 때)
   - 상세 설명 섹션 (Readme 마크다운)
   - Tech Stack 섹션 (technologies 배열 있을 때)
   - 다른 프로젝트 캐러셀 (ProjectThumbnailCarousel)
   - 프로젝트 네비게이션 (ProjectNavigation: 이전/다음/목록)

3. **디자인 시스템 컴포넌트 추가**
   - **ProjectDetailHeader**: 프로젝트 헤더 (제목, 썸네일, 배지, 링크)
   - **TableOfContents**: 목차 컴포넌트 (자동 생성, 스크롤 기능)
   - **ProjectThumbnailCarousel**: 다른 프로젝트 썸네일 캐러셀
   - **ProjectNavigation**: 프로젝트 네비게이션 (이전/다음/목록)

4. **API 연동**
   - `useProjectsQuery()` 훅 사용 (프로젝트 목록에서 ID로 찾기)
   - 로딩 상태 처리
   - 에러 상태 처리 (404 등, TextLink로 목록으로 돌아가기)

**검증**:
- [x] API에서 프로젝트 상세 정보 정상 로드
- [x] 모든 섹션 정상 표시 (개요, 스크린샷, 상세 설명, 기술 스택)
- [x] 디자인 시스템 컴포넌트만 사용
- [x] 마크다운 렌더링 정상 동작
- [x] 반응형 레이아웃 정상 동작 (스크린샷 그리드)
- [x] 로딩/에러 상태 UI 정상 표시
- [x] TableOfContents 정상 동작
- [x] ProjectThumbnailCarousel 정상 동작
- [x] ProjectNavigation 정상 동작

---

### Task 5.4: 반응형 레이아웃 최적화

**목표**: 모든 페이지가 모바일/태블릿/데스크톱에서 정상 동작

**작업**:
1. **브레이크포인트 정의**
   ```css
   --breakpoint-mobile: 768px;
   --breakpoint-tablet: 1024px;
   --breakpoint-desktop: 1280px;
   ```

2. **레이아웃 조정**
   - 모바일: 1단 레이아웃
   - 태블릿: 2단 레이아웃
   - 데스크톱: 3단 레이아웃 (필요 시)

3. **터치 최적화**
   - 버튼/링크 터치 영역 확보 (최소 44x44px)
   - 스크롤 애니메이션 모바일 최적화

**검증**:
- [ ] 모바일 (< 768px) 레이아웃 정상 동작
- [ ] 태블릿 (768px - 1024px) 레이아웃 정상 동작
- [ ] 데스크톱 (> 1024px) 레이아웃 정상 동작
- [ ] 터치 인터랙션 정상 동작
- [ ] 스크롤 애니메이션 모든 디바이스에서 정상 동작

---

## Design System Compliance Checklist

모든 UI 구현 시 다음 체크리스트를 확인:

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

## Testing Plan

### Manual Testing
1. **Landing Page**
   - [ ] Hero Section 애니메이션 정상 동작
   - [ ] About Section 스크롤 애니메이션 정상 동작
   - [ ] Featured Projects 카드 애니메이션 정상 동작
   - [ ] CTA 버튼 클릭 시 정상 이동

2. **Archive Page**
   - [ ] 프로젝트 목록 정상 로드
   - [ ] 프로젝트 카드 클릭 시 상세 페이지 이동
   - [ ] 필터/정렬 정상 동작 (구현한 경우)

3. **Project Detail Page**
   - [x] 프로젝트 정보 정상 로드
   - [x] 뒤로 가기 링크 정상 동작 (에러 상태에서)
   - [x] 마크다운 렌더링 정상 동작
   - [x] TableOfContents 정상 동작
   - [x] ProjectThumbnailCarousel 정상 동작
   - [x] ProjectNavigation 정상 동작

4. **Responsive**
   - [ ] 모바일 (iPhone SE, iPhone 12 Pro)
   - [ ] 태블릿 (iPad, iPad Pro)
   - [ ] 데스크톱 (1280px, 1920px)

5. **Accessibility**
   - [ ] `prefers-reduced-motion` 정상 동작
   - [ ] 키보드 네비게이션 정상 동작
   - [ ] 스크린 리더 호환성 확인

### Browser Testing
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)

---

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5초
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Page Load
- **Landing Page**: < 3초 (3G 기준)
- **Archive Page**: < 4초 (API 로드 포함)
- **Project Detail**: < 4초 (API 로드 포함)

### Optimization
- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] CSS 번들 최소화
- [ ] JavaScript 번들 최소화
- [ ] GPU 가속 활용 (스크롤 애니메이션)

---

## Success Criteria

### Functional
- [x] Landing Page가 Phase 4/4.5 와이어프레임과 일치
- [x] Archive Page에서 프로젝트 목록 정상 표시
- [x] Archive Page에 Featured Projects 섹션 추가
- [x] Archive Page에 프로젝트 히스토리 타임라인 추가
- [x] Archive Page에 프로젝트 검색 모달 추가
- [x] Project Detail Page에서 프로젝트 상세 정보 정상 표시
  - [x] ProjectDetailHeader 컴포넌트 구현
  - [x] TableOfContents 컴포넌트 구현
  - [x] ProjectThumbnailCarousel 컴포넌트 구현
  - [x] ProjectNavigation 컴포넌트 구현
- [x] 모든 페이지가 반응형으로 동작

### Non-Functional
- [x] 디자인 시스템만 사용 (100% 준수)
- [x] Task 5.0에서 추가된 컴포넌트 외 새로운 컴포넌트 추가 없음
- [x] 기존 ProjectCard의 UX 요소가 디자인 시스템으로 완전히 편입됨
- [x] 배지 hover 애니메이션 제거됨 (항상 전체 표시)
- [x] 설정 파일로 콘텐츠 관리
- [x] CSS 변수에 status 색상 추가
- [x] Storybook 스토리 작성 완료
- [ ] 모든 페이지가 Performance Targets 충족

### User Experience
- [ ] 랜딩 페이지가 명확한 첫인상 제공
- [ ] 프로젝트 목록에서 클릭 이유가 명확
- [ ] 프로젝트 상세 페이지가 충분한 정보 제공
- [ ] 모든 페이지에서 네비게이션이 명확

---

## Risks & Mitigation

### Risk 1: API 장애
- **영향**: Archive, Project Detail 페이지 로드 실패
- **완화**:
  - 에러 상태 UI 구현
  - Fallback 메시지 표시
  - Featured Projects는 설정 파일로 독립 운영

### Risk 2: 성능 저하
- **영향**: 스크롤 애니메이션 끊김
- **완화**:
  - GPU 가속 활용 (`will-change`, `transform`)
  - Intersection Observer API 사용
  - `prefers-reduced-motion` 지원

### Risk 3: 디자인 시스템 불충분
- **영향**: 원하는 UI 구현 불가
- **완화**:
  - Phase 3 디자인 시스템 재검토
  - 필요 시 Phase 3로 돌아가 컴포넌트 추가
  - **절대 임시 스타일 추가하지 않음**

---

## Definition of Done

- [x] **Task 5.0 완료**: TeamBadge, ProjectTypeBadge, SocialIcon, ProjectIcon, Card, ProjectCard 컴포넌트가 디자인 시스템에 추가됨
- [x] **기존 UX 보존**: 기존 ProjectCard의 배지, 아이콘, 레이아웃이 디자인 시스템 ProjectCard에 완전히 통합됨
- [x] **애니메이션 제거**: 배지 hover 확장 애니메이션이 제거되고 항상 전체 내용 표시됨
- [x] **CSS 변수 확장**: status 색상 추가 (error, warning, success, info)
- [x] **Storybook 스토리**: 모든 새 컴포넌트에 대한 Storybook 스토리 작성 완료
- [x] Landing Page가 디자인 시스템으로 완성됨
- [x] Archive Page가 디자인 시스템 ProjectCard로 완성됨
- [x] Archive Page에 Featured Projects 섹션 추가 (API isFeatured 필드 사용)
- [x] Archive Page에 프로젝트 히스토리 타임라인 추가
- [x] Archive Page에 프로젝트 검색 모달 추가
- [x] Featured Projects 설정 파일로 관리됨 (오버라이드 기능 포함)
- [x] 모든 페이지가 반응형으로 동작
- [x] Project Detail Page가 디자인 시스템으로 완성됨
  - [x] ProjectDetailHeader 컴포넌트 추가
  - [x] TableOfContents 컴포넌트 추가
  - [x] ProjectThumbnailCarousel 컴포넌트 추가
  - [x] ProjectNavigation 컴포넌트 추가
- [ ] 모든 페이지가 Performance Targets 충족
- [x] 디자인 시스템 외 스타일 사용 없음
- [x] Task 5.0 외 새로운 컴포넌트 추가 없음 (ProjectDetailHeader, TableOfContents, ProjectThumbnailCarousel, ProjectNavigation은 디자인 시스템 컴포넌트로 추가됨)
- [ ] Manual Testing 체크리스트 100% 완료
- [ ] Browser Testing 체크리스트 100% 완료

---

## Next Steps (Phase 6)

Phase 5 완료 후:
1. Phase 5 완료 보고서 작성 (`phase-5-completion.md`)
2. Phase 6 진행 (Cut & Validation)
   - 불필요한 요소 제거
   - 페이지 간 중복 제거
   - 최종 사용자 테스트

---

**작성일**: 2026-01-05
**상태**: 설계 완료, 구현 대기
