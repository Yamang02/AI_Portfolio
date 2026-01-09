# Admin Antd 테마 설정

이 디렉토리는 Admin 영역의 Ant Design 테마 설정을 관리합니다.

## 개요

Admin은 **Ant Design 컴포넌트**를 사용하지만, **디자인시스템의 CSS 변수**를 참조하여 Main 영역과 색상 체계를 통일합니다.

```
┌─────────────────────────────────────────┐
│  Design System (CSS Variables)         │
│  - 색상, 간격, 폰트, Border Radius 등   │
│  - 단일 진실 소스 (Single Source)      │
└─────────────────────────────────────────┘
           ↓ 참조 (Reference)
┌─────────────────────────────────────────┐
│  Admin Antd Theme (antdTheme.ts)        │
│  - CSS 변수를 Antd 토큰에 매핑          │
│  - Antd 컴포넌트 스타일 커스터마이징    │
└─────────────────────────────────────────┘
```

## 디자인 원칙

### 1. **색상 체계 통일**
- **Main**: 디자인시스템 컴포넌트 (`@/design-system`)
- **Admin**: Antd 컴포넌트 (Table, Form, Modal 등)
- **공통**: CSS 변수 (`--color-*`) 공유

### 2. **UI 라이브러리 분리**
- **Main**: 커스텀 디자인시스템 (브랜딩 중심)
- **Admin**: Ant Design (관리 도구 생산성 중심)
- **이유**: 각 영역의 특성에 맞는 최적화

### 3. **유지보수성**
- 색상 변경 시 **CSS 변수만 수정**하면 Admin/Main 모두 반영
- Antd 테마는 CSS 변수를 참조만 함

## 파일 구조

```
frontend/src/
├── design-system/              # Main 영역용
│   ├── components/
│   │   ├── Card/
│   │   ├── Button/
│   │   └── ...
│   └── styles/
│       └── globals.css         ← CSS 변수 정의 (단일 진실 소스)
│
└── admin/
    ├── shared/
    │   ├── theme/
    │   │   ├── antdTheme.ts    ← Antd 테마 (CSS 변수 참조)
    │   │   └── README.md       ← 이 파일
    │   └── ui/                 # Admin 공통 컴포넌트 (Antd 기반)
    │       ├── TableTemplate/
    │       ├── FormModal/
    │       └── ...
    └── app/
        └── AdminApp.tsx        ← Antd ConfigProvider 적용
```

## 사용 방법

### 1. 테마 적용 (이미 적용됨)

[AdminApp.tsx](../../../app/AdminApp.tsx):
```typescript
import { ConfigProvider } from 'antd';
import { adminTheme } from '../shared/theme/antdTheme';

export const AdminApp: React.FC = () => {
  return (
    <ConfigProvider theme={adminTheme}>
      {/* Admin 라우트 */}
    </ConfigProvider>
  );
};
```

### 2. 색상 변경 방법

**❌ 잘못된 방법 (Antd 테마 직접 수정):**
```typescript
// admin/shared/theme/antdTheme.ts
export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: '#3b82f6', // ← 직접 하드코딩 (X)
  },
};
```

**✅ 올바른 방법 (CSS 변수 수정):**
```css
/* design-system/styles/globals.css */
:root {
  --color-primary: #5F9070; /* ← 여기만 수정 (O) */
}
```

### 3. 새로운 색상 추가

1. **CSS 변수 정의** (`design-system/styles/globals.css`):
```css
:root {
  --color-accent: #10b981; /* 새 액센트 색상 */
}
```

2. **Antd 테마에 매핑** (`admin/shared/theme/antdTheme.ts`):
```typescript
export const adminTheme: ThemeConfig = {
  token: {
    colorInfo: '#10b981', // CSS 변수 값 복사
  },
};
```

**참고**: 현재 Antd `ThemeConfig`는 CSS 변수 문자열(`'var(--color-*)'`)을 직접 지원하지 않아, 값을 복사해야 합니다.

## 테마 토큰 매핑표

| 디자인시스템 변수 | Antd 토큰 | 설명 |
|------------------|-----------|------|
| `--color-primary` | `colorPrimary` | 브랜드 메인 색상 |
| `--color-status-success` | `colorSuccess` | 성공 상태 |
| `--color-status-warning` | `colorWarning` | 경고 상태 |
| `--color-status-error` | `colorError` | 에러 상태 |
| `--color-status-info` | `colorInfo` | 정보 상태 |
| `--border-radius-lg` | `borderRadius` | 기본 Border Radius |
| `--font-size-base` | `fontSize` | 기본 폰트 크기 |
| `--spacing-*` | 컴포넌트별 `padding` | 간격 |

전체 매핑은 [antdTheme.ts](./antdTheme.ts) 참조.

## 컴포넌트별 커스터마이징

### Table
```typescript
components: {
  Table: {
    headerBg: '#f9fafb',     // 헤더 배경
    rowHoverBg: '#f3f4f6',   // 행 hover 배경
    borderColor: '#e5e7eb',  // border 색상
  },
}
```

### Button
```typescript
components: {
  Button: {
    controlHeight: 36,       // 버튼 높이
    borderRadius: 6,         // Border radius
    fontWeight: 500,         // 폰트 굵기
  },
}
```

### Modal
```typescript
components: {
  Modal: {
    borderRadiusLG: 12,      // Border radius
    paddingContentHorizontalLG: 24,
  },
}
```

전체 설정은 [antdTheme.ts](./antdTheme.ts) 참조.

## 다크모드 지원 (향후 확장)

현재는 라이트 모드만 지원하지만, 향후 다크모드 추가 시:

1. **CSS 변수 다크모드 정의** (`design-system/styles/globals.css`에 이미 정의됨):
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #7FB089; /* 다크모드용 밝은 그린 */
  }
}
```

2. **Antd 다크모드 테마 활용** (`antdTheme.ts`에 `adminDarkTheme` 이미 정의됨):
```typescript
import { adminTheme, adminDarkTheme } from '../shared/theme/antdTheme';

const theme = isDarkMode ? adminDarkTheme : adminTheme;

<ConfigProvider theme={theme}>
  {/* ... */}
</ConfigProvider>
```

## 참고 자료

- [Ant Design 테마 커스터마이징 공식 문서](https://ant.design/docs/react/customize-theme)
- [Ant Design 디자인 토큰](https://ant.design/docs/react/customize-theme#seedtoken)
- [디자인시스템 CSS 변수](../../design-system/styles/globals.css)

## 문제 해결

### 색상이 적용되지 않을 때
1. `AdminApp.tsx`에 `ConfigProvider`가 적용되어 있는지 확인
2. CSS 변수가 올바르게 정의되어 있는지 확인 (`globals.css`)
3. 브라우저 개발자 도구에서 Computed Style 확인

### 특정 컴포넌트만 색상 변경하고 싶을 때
[antdTheme.ts](./antdTheme.ts)의 `components` 섹션에서 해당 컴포넌트 설정 추가.

---

**작성일**: 2025-01-09
**작성자**: AI Agent (Claude)
**버전**: 1.0
