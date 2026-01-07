# 하드코딩된 컬러 사용 위치 리포트

이 문서는 디자인시스템에 등록되지 않은 하드코딩된 컬러 값이 사용되는 위치를 정리한 리포트입니다.

## 📋 개요

프로젝트 전체에서 하드코딩된 컬러 값(`#hex`, `rgb()`, `rgba()` 등)을 검색한 결과, 다음과 같은 위치에서 디자인시스템을 사용하지 않고 직접 컬러 값을 사용하고 있습니다.

## 🔍 발견된 하드코딩 컬러 사용 위치

### 1. **스토리북 파일들** (UI 표시용 - 우선순위 낮음)

스토리북 스토리 파일들에서 UI 표시를 위해 하드코딩된 컬러를 사용하고 있습니다. 이는 스토리북 내부에서만 사용되므로 우선순위가 낮지만, 일관성을 위해 디자인시스템 컬러를 사용하는 것을 권장합니다.

#### `frontend/src/design-system/tokens/Tokens.stories.tsx`
- `#e5e7eb` - 테두리 색상 (grayScale[200] 사용 권장)
- `#6b7280` - 텍스트 색상 (grayScale[500] 사용 권장)
- `#f9fafb` - 배경 색상 (grayScale[50] 사용 권장)
- `#ffffff` - 흰색 (utilitySemantic.white 사용 권장)
- `#0F1A14`, `#E6F1EA`, `#9FB4A8`, `#2E4A3B` - 다크모드 UI 색상
- `#7FAF8A` - 브랜드 그린 (brandScale[400] 또는 brandSemantic.primary 사용 권장)

#### `frontend/src/design-system/components/Icon/SocialIcon.stories.tsx`
- `#666` - 텍스트 색상 (grayScale[600] 사용 권장)

#### `frontend/src/design-system/components/Icon/ProjectIcon.stories.tsx`
- `#666` - 텍스트 색상 (grayScale[600] 사용 권장)

#### `frontend/src/design-system/components/Card/Card.stories.tsx`
- `#666` - 텍스트 색상 (grayScale[600] 사용 권장)
- `#7FAF8A` - 브랜드 그린 (brandScale[400] 사용 권장)

#### `frontend/src/design-system/components/Button/Button.stories.tsx`
- `#666` - 텍스트 색상 (grayScale[600] 사용 권장)
- `#f5f5f5` - 배경 색상 (grayScale[100] 사용 권장)

#### `frontend/src/design-system/components/Badge/Badge.stories.tsx`
- `#666` - 텍스트 색상 (grayScale[600] 사용 권장)

### 2. **Admin 페이지들** (논외)

**참고:** 관리자 페이지는 Ant Design 디자인시스템을 사용하므로, 이 프로젝트의 디자인시스템과는 별개로 관리됩니다. 하드코딩된 컬러가 있어도 Ant Design의 테마 시스템을 통해 관리되므로 수정 대상이 아닙니다.

관리자 페이지 관련 파일:
- `frontend/src/admin/app/AdminApp.tsx`
- `frontend/src/admin/pages/Dashboard.tsx`
- `frontend/src/admin/features/cloud-usage-monitoring/ui/CloudUsageSection.tsx`
- `frontend/src/admin/features/cloud-usage-monitoring/ui/CloudUsageCard.tsx`

### 3. **공유 컴포넌트** (우선순위 중간)

#### `frontend/src/shared/ui/tech-stack/TechStackBadge.tsx`
```typescript
// Line 71: hover 테두리 색상
hover:border-[#7FAF8A]
```

**권장 수정:**
- `#7FAF8A`: `brandScale[400]` 또는 `brandSemantic.primary` 사용
- Tailwind 클래스: `hover:border-primary` 사용 권장

### 4. **테마 설정 파일** (우선순위 낮음)

#### `frontend/src/shared/config/theme.ts`
```typescript
// Line 31-32: 기본 컬러
white: '#ffffff',
black: '#051A0E',  /* brandScale 1000 - #000000 대체 */

// Line 62-64: 그림자 (rgba 사용)
sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

// Line 109-117: Demon Slayer 테마 (특수 테마)
background: '#0f172a',
backgroundSecondary: '#1a0f0f',
// ... 등등
```

**권장 수정:**
- `white`, `black`: `utilitySemantic.white`, `utilitySemantic.black` 사용
- 그림자: `shadow` 토큰 사용 (이미 `frontend/src/design-system/tokens/shadow.ts`에 정의됨)
- Demon Slayer 테마: 특수 테마이므로 유지 가능하지만, 주석으로 명확히 표시 권장

#### `frontend/src/design-system/tokens/shadow.ts`
```typescript
// Line 10-12: 그림자 (rgba 사용)
sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
```

**참고:** 그림자는 투명도가 필요한 경우이므로 하드코딩이 어느 정도 필요할 수 있습니다. 하지만 CSS 변수로 관리하는 것을 권장합니다.

## 📊 통계

- **총 발견된 하드코딩 컬러 사용 위치**: 약 40+ 곳
- **우선순위 높음**: 없음 (Admin 페이지는 논외)
- **우선순위 중간**: 공유 컴포넌트 (약 5곳)
- **우선순위 낮음**: 스토리북 파일들, 테마 설정 (약 35곳)

## ✅ 권장 사항

1. **즉시 수정 권장 (우선순위 중간)**
   - `TechStackBadge` 컴포넌트의 하드코딩된 브랜드 컬러 교체

2. **점진적 개선 (우선순위 낮음)**
   - 스토리북 파일들의 하드코딩된 컬러를 디자인시스템 토큰으로 교체
   - 테마 설정 파일의 중복 정의 제거

3. **유지 가능 (우선순위 낮음)**
   - 그림자 값 (투명도가 필요한 경우)
   - 특수 테마 (Demon Slayer 등)
   - 외부 서비스 브랜드 컬러 (AWS, GCP 등)
   - **Admin 페이지 (Ant Design 사용, 논외)**

## 🔗 관련 파일

- 디자인시스템 컬러 토큰: `frontend/src/design-system/tokens/colors.ts`
- CSS 변수 정의: `frontend/src/design-system/styles/globals.css`
- 스토리북 컬러 스토리: `frontend/src/design-system/tokens/AllColors.stories.tsx` (새로 생성됨)
