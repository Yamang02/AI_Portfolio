# FSD 아키텍처 리팩토링

> Feature-Sliced Design 아키텍처로의 전환 및 정리 작업

## 현재 상태

### ✅ 완료된 작업

#### Phase 1: shared 레이어 통합 ✅
- ✅ `main/components/common/` → `shared/ui/` 통합 완료
- ✅ `main/hooks/` → `shared/hooks/` 통합 완료
- ✅ `main/shared/ui/` 제거 완료

#### Phase 2: widgets 레이어 생성 ✅
- ✅ `main/layout/` → `main/widgets/` 이동 완료
- ✅ pages 내부 섹션 → widgets 이동 완료
  - HeroSection, AboutSection, FeaturedProjectsSection, CTASection

#### Phase 3: features 통합 ✅
- ✅ `features/projects` 디렉토리 제거 완료
- ✅ `features/project-gallery`만 유지 (ProjectDetailPage에서 사용 중)
- ✅ 중복 컴포넌트 및 utils 제거 완료

#### Phase 4: entities 정리 ✅
- ✅ `entities/techstack` 빈 디렉토리 제거 완료
- ✅ `TechStackStatistics` 타입 이동 완료
- ✅ export 정리 완료

## 최종 FSD 구조

```
src/
├── main/
│   ├── app/              # 애플리케이션 초기화, 라우팅, 프로바이더
│   ├── pages/            # 페이지 컴포넌트
│   ├── widgets/          # 복합 UI 블록 (레이아웃, 섹션)
│   ├── features/         # 사용자 기능
│   └── entities/         # 비즈니스 엔티티
│
├── admin/
│   ├── app/
│   ├── pages/
│   ├── features/
│   └── entities/
│
├── design-system/        # 디자인 시스템 컴포넌트
└── shared/              # 재사용 가능한 코드
    ├── ui/
    ├── hooks/
    ├── lib/
    ├── services/
    └── types/
```

## FSD 원칙

### 레이어 의존성 규칙
- ✅ `app` → 모든 레이어 사용 가능
- ✅ `pages` → `widgets`, `features`, `entities`, `shared` 사용
- ✅ `widgets` → `features`, `entities`, `shared` 사용
- ✅ `features` → `entities`, `shared` 사용
- ✅ `entities` → `shared` 사용
- ✅ `shared` → 의존성 없음

### 세그먼트 구조
각 슬라이스는 다음 세그먼트를 가질 수 있음:
- `ui/` - UI 컴포넌트
- `model/` - 타입, 인터페이스, 상태
- `api/` - API 호출 (entities, features만)
- `lib/` - 유틸리티 함수
- `config/` - 설정 파일

### Public API
각 슬라이스는 `index.ts`를 통해 Public API만 export:
```typescript
// ✅ Good
export { Component } from './ui/Component';
export type { ComponentProps } from './model/types';

// ❌ Bad
export * from './ui/Component';
export * from './lib/utils';  // 내부 구현 노출
```

## 참고 자료

- [FSD 공식 문서](https://feature-sliced.design/)
- [FSD Best Practices](https://feature-sliced.design/docs/guides/best-practices)
- [FSD 레이어 규칙](https://feature-sliced.design/docs/get-started/architecture)
