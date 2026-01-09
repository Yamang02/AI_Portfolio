# 프론트엔드 아키텍처 문서

## 개요

이 프로젝트는 **Feature-Sliced Design (FSD)** 아키텍처를 따릅니다. FSD는 확장 가능하고 유지보수하기 쉬운 프론트엔드 애플리케이션을 구축하기 위한 방법론입니다.

## 폴더 구조

```
frontend/src/
├── app/              # 애플리케이션 진입점 (라우터, 프로바이더)
│   ├── public/      # Public 앱 (메인 포트폴리오)
│   └── admin/       # Admin 앱 (관리자 대시보드)
├── processes/       # 교차 기능 플로우 (인증 부트스트랩, 캐시 관리 등)
├── pages/           # 페이지 컴포넌트 (라우트와 직접 연결)
│   ├── public/      # Public 페이지
│   └── admin/       # Admin 페이지
├── widgets/         # 복합 UI 블록 (여러 features/entities 조합)
├── features/        # 비즈니스 기능 (chatbot, project-gallery 등)
├── entities/        # 비즈니스 엔티티 (project, tech-stack 등)
│   └── project/
│       ├── model/   # 타입 정의
│       ├── api/     # API 클라이언트 및 React Query 훅
│       └── ui/       # 엔티티 관련 UI 컴포넌트
└── shared/          # 공유 리소스
    ├── ui/          # 재사용 가능한 UI 컴포넌트
    ├── lib/         # 유틸리티 라이브러리
    ├── config/      # 설정 파일 (테마, 앱 설정 등)
    └── api/         # 공통 API 클라이언트
```

## 레이어 설명

### app/
애플리케이션의 진입점으로, 라우터와 전역 프로바이더를 포함합니다.
- `app/public/`: Public 앱의 라우터 및 프로바이더
- `app/admin/`: Admin 앱의 라우터 및 프로바이더

### processes/
교차 기능 플로우를 처리합니다. 예를 들어:
- 인증 부트스트랩
- 캐시 관리
- 프로젝트 발행 프로세스

### pages/
페이지 컴포넌트로, 라우트와 직접 연결됩니다. 비즈니스 로직은 포함하지 않고 widgets와 features를 조합합니다.

### widgets/
복합 UI 블록으로, 여러 features와 entities를 조합하여 구성됩니다.
- `widgets/project-showcase`: 프로젝트 쇼케이스 위젯 (Public)
- `widgets/admin-dashboard`: 관리자 대시보드 위젯

### features/
비즈니스 기능을 구현합니다. 각 feature는 독립적인 기능 단위입니다.
- `features/chatbot/`: 챗봇 기능
- `features/project-gallery/`: 프로젝트 갤러리 기능
- `features/project-editor/`: 프로젝트 편집 기능 (Admin)

### entities/
비즈니스 엔티티를 정의합니다. 각 엔티티는 다음과 같은 구조를 가집니다:
```
entities/project/
├── model/           # 타입 정의 (project.types.ts)
├── api/             # API 클라이언트 및 React Query 훅
│   ├── projectApi.ts
│   └── useProjectQuery.ts
├── ui/              # 엔티티 관련 UI 컴포넌트 (선택사항)
└── index.ts         # Barrel export
```

### shared/
공유 리소스를 포함합니다:
- `shared/ui/`: 재사용 가능한 UI 컴포넌트 (버튼, 입력 필드 등)
- `shared/lib/`: 유틸리티 함수 (날짜, 문자열 처리 등)
- `shared/config/`: 설정 파일 (테마, 앱 설정 등)
- `shared/api/`: 공통 API 클라이언트

## 디자인 시스템

프로젝트는 **디자인 시스템**을 도입하여 일관된 UI/UX를 제공합니다. 모든 컴포넌트 개발 시 디자인 시스템을 우선적으로 활용해야 합니다.

### 디자인 시스템 구조

```
frontend/src/design-system/
├── tokens/          # 디자인 토큰 (컬러, 타이포그래피, 스페이싱 등)
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── borderRadius.ts
│   ├── shadow.ts
│   └── breakpoints.ts
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── Button/
│   ├── Badge/
│   ├── Card/
│   ├── SectionTitle/
│   ├── TextLink/
│   └── ...
├── styles/          # 전역 스타일
│   ├── globals.css  # CSS 변수 정의 (단일 소스)
│   └── reset.css
└── providers/       # 테마 프로바이더
```

### 디자인 토큰

디자인 토큰은 `frontend/src/design-system/tokens/`에서 관리됩니다. 모든 토큰은 TypeScript로 타입 안전하게 정의되어 있으며, CSS 변수(`--color-*`, `--spacing-*` 등)와 동기화됩니다.

#### 컬러 토큰

**⚠️ 중요**: 컬러는 반드시 CSS 변수를 사용해야 합니다. 하드코딩된 컬러 값 사용은 금지됩니다.

```typescript
// ✅ 올바른 방법: CSS 변수 사용
style={{ 
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-bg-primary)',
  borderColor: 'var(--color-border-default)',
}}

// ❌ 잘못된 방법: 하드코딩된 컬러 값 사용 금지
style={{ color: '#111827' }}
```

**컬러 시스템 구조**:
- **Primitive Tokens**: 기본 컬러 팔레트 (gray, brand scales)
- **Semantic Tokens**: 의미 기반 컬러 (background, text, border, status 등)
- **CSS 변수**: `globals.css`의 `--color-*` 변수가 단일 소스

자세한 내용: `docs/technical/design-system/color-palette.md`

#### 기타 토큰

```typescript
// 디자인 토큰 import
import { 
  spacing, 
  borderRadius, 
  shadow, 
  fontSize,
  fontWeight 
} from '@/design-system/tokens';

// 사용 예시
const style = {
  padding: spacing[4],           // '1rem'
  borderRadius: borderRadius.lg, // '0.5rem'
  boxShadow: shadow.md,           // '0 4px 6px -1px rgba(0, 0, 0, 0.1)...'
  fontSize: fontSize.base,        // '1rem'
  fontWeight: fontWeight.semibold, // 600
};

// 또는 CSS 변수로 직접 사용
const style = {
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: 'var(--shadow-md)',
};
```

### 디자인 시스템 컴포넌트

**⚠️ 중요**: 새 컴포넌트를 생성할 때는 반드시 디자인 시스템을 확인하고 활용해야 합니다.

#### 1. 기존 컴포넌트 활용

디자인 시스템에 이미 존재하는 컴포넌트는 재사용합니다:

```typescript
// ✅ 올바른 방법: 디자인 시스템 컴포넌트 import
import { Button, Badge, Card, SectionTitle, TextLink } from '@/design-system';

// 사용 예시
<Button variant="primary" size="md">클릭</Button>
<Badge variant="default" size="sm">태그</Badge>
<Card>내용</Card>
<SectionTitle level="h2">제목</SectionTitle>
<TextLink href="/path">링크</TextLink>
```

**주요 디자인 시스템 컴포넌트**:
- `Button`: 버튼 (primary, secondary, icon, brand variants)
- `Badge`: 배지/태그 (default, primary, accent, success, outline variants)
- `Card`: 카드 컨테이너
- `SectionTitle`: 섹션 제목 (h1, h2, h3, h4)
- `TextLink`: 텍스트 링크
- `Divider`: 구분선
- `Tooltip`: 툴팁
- `Skeleton`, `SkeletonCard`: 로딩 스켈레톤
- `Input`: 입력 필드
- `Modal`: 모달
- `Spinner`: 로딩 스피너

자세한 목록: `frontend/src/design-system/components/` 또는 Storybook 참조

#### 2. 새 컴포넌트 등록

디자인 시스템에 없는 재사용 가능한 컴포넌트는 디자인 시스템에 등록합니다:

```typescript
// frontend/src/design-system/components/NewComponent/NewComponent.tsx
import React from 'react';
import styles from './NewComponent.module.css';

export interface NewComponentProps {
  // props 정의
}

export const NewComponent: React.FC<NewComponentProps> = ({ ... }) => {
  // CSS 변수 사용 (컬러, 스페이싱 등)
  return (
    <div 
      style={{
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--border-radius-lg)',
      }}
    >
      {/* 컴포넌트 내용 */}
    </div>
  );
};
```

**등록 절차**:
1. `frontend/src/design-system/components/NewComponent/` 폴더 생성
2. 컴포넌트 파일 작성 (CSS 변수 사용 필수)
3. `frontend/src/design-system/components/index.ts`에 export 추가
4. Storybook 스토리 작성 (선택사항)

#### 3. 로컬 컴포넌트 생성

도메인 특화 컴포넌트는 해당 레이어에 생성하되, 디자인 시스템을 활용합니다:

```typescript
// entities/project/ui/ProjectCard.tsx
import { Card, Badge, Button } from '@/design-system';

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card>
      {/* 디자인 시스템 컴포넌트 활용 */}
      <SectionTitle level="h3">{project.title}</SectionTitle>
      <div>
        {project.tags.map(tag => (
          <Badge key={tag} variant="default" size="sm">{tag}</Badge>
        ))}
      </div>
      <Button variant="primary" href={project.url}>
        View Project
      </Button>
    </Card>
  );
};
```

### 컴포넌트 생성 체크리스트

새 컴포넌트를 생성할 때 다음을 확인하세요:

1. **디자인 시스템 확인**: 필요한 컴포넌트가 이미 존재하는지 확인
2. **컬러 사용**: CSS 변수(`--color-*`) 사용, 하드코딩 금지
3. **디자인 토큰 사용**: spacing, borderRadius, shadow 등 토큰 활용
4. **재사용성 검토**: 재사용 가능하면 디자인 시스템에 등록
5. **Storybook 문서화**: 디자인 시스템 컴포넌트는 Storybook 스토리 작성

### 관련 문서

- **컬러 시스템**: `docs/technical/design-system/color-palette.md`
- **Phase 3 구현 가이드**: `docs/technical/design-system/phase-3-implementation-guide.md`
- **Phase 3 사용 예시**: `docs/technical/design-system/phase-3-usage-examples.md`
- **Storybook**: `npm run storybook` 실행 후 디자인 시스템 컴포넌트 확인

## Import 규칙

### Path Alias 사용
TypeScript path alias를 사용하여 깔끔한 import를 유지합니다:

```typescript
// ✅ 좋은 예시
import { Project } from '@entities/project';
import { ChatInputBar } from '@shared/ui/chat';
import { cn } from '@shared/lib/utils/cn';

// ❌ 나쁜 예시
import { Project } from '../../../entities/project';
```

### 레이어 간 Import 규칙
FSD 아키텍처에서는 상위 레이어에서만 하위 레이어를 import할 수 있습니다:

- `app` → 모든 레이어 import 가능
- `pages` → `widgets`, `features`, `entities`, `shared` import 가능
- `widgets` → `features`, `entities`, `shared` import 가능
- `features` → `entities`, `shared` import 가능
- `entities` → `shared` import 가능
- `shared` → 다른 레이어 import 불가

## 마이그레이션 가이드

### 기존 코드에서 새 구조로 마이그레이션

1. **엔티티 마이그레이션**
   - `main/entities/*` 또는 `admin/entities/*` → `entities/*`
   - 타입, API, React Query 훅을 통합

2. **UI 컴포넌트 마이그레이션**
   - `main/components/common/*` → `shared/ui/*`
   - 컴포넌트별로 폴더 구조화 (예: `shared/ui/chat/ChatInputBar.tsx`)

3. **기능 마이그레이션**
   - `main/features/*` → `features/*`
   - Admin 전용 기능은 `features/*/admin`으로 분리

4. **페이지 마이그레이션**
   - `main/pages/*` → `pages/public/*`
   - `admin/pages/*` → `pages/admin/*`

## 코드 스타일 가이드

### 컴포넌트 구조
```typescript
// 1. Imports
import React from 'react';
import { Project } from '@entities/project';
import { cn } from '@shared/lib/utils/cn';

// 2. Types
interface ComponentProps {
  // ...
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ ... }) => {
  // ...
};

// 4. Export
export { Component };
```

### 파일 명명 규칙
- 컴포넌트: PascalCase (예: `ChatInputBar.tsx`)
- 유틸리티: camelCase (예: `dateUtils.ts`)
- 타입: camelCase with `.types.ts` suffix (예: `project.types.ts`)
- 상수: UPPER_SNAKE_CASE (예: `QUERY_KEYS.ts`)

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD Best Practices](https://feature-sliced.design/docs/get-started/overview)

