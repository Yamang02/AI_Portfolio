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

### 디자인 토큰
디자인 토큰은 `shared/config/theme.ts`에서 관리됩니다. Tailwind 설정과 동기화되어 있으며, TypeScript에서 직접 사용할 수 있습니다.

```typescript
import { colors, spacing, transitions } from '@shared/config/theme';

// 사용 예시
const buttonStyle = {
  backgroundColor: colors.primary[600],
  padding: spacing.md,
  transitionDuration: transitions.normal,
};
```

### className 유틸리티
`shared/lib/utils/cn.ts`에서 제공하는 `cn()` 함수를 사용하여 조건부 클래스를 병합합니다.

```typescript
import { cn } from '@shared/lib/utils/cn';

const className = cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
);
```

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

