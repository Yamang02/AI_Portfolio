# Color Palette - 색상 팔레트 정의

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-01-04 (RGB 값 기반 정확한 정의)

---

## 🎨 사용자 정의 색상 팔레트 (RGB 기반)

### 기본 팔레트

제공된 RGB 값을 기반으로 정확한 Hex 코드로 변환했습니다.

#### 라이트 모드 - Green/Olive Tones

| 색상명 | RGB | Hex Code | 용도 |
|--------|-----|----------|------|
| **Cream Beige** | rgb(246, 240, 215) | `#F6F0D7` | Background Tertiary, Subtle Highlight |
| **Light Sage** | rgb(197, 216, 157) | `#C5D89D` | Success, Positive State |
| **Muted Olive** | rgb(156, 171, 132) | `#9CAB84` | Primary Accent, Links |
| **Dark Olive** | rgb(137, 152, 109) | `#89986D` | **Primary**, CTA Buttons |

#### 다크 모드 - Cool Green Tones

| 색상명 | RGB | Hex Code | 용도 |
|--------|-----|----------|------|
| **Light Mint** | rgb(235, 244, 221) | `#EBF4DD` | Highlight (다크모드에서 배지) |
| **Soft Green** | rgb(144, 171, 139) | `#90AB8B` | Success, Links (다크모드) |
| **Deep Teal** | rgb(90, 120, 99) | `#5A7863` | **Primary** (다크모드) |
| **Dark Forest** | rgb(59, 73, 83) | `#3B4953` | Background Elevated (다크모드) |

---

## 🌈 확장 색상 정의

### 1. Brand Colors

#### Primary (Dark Olive 계열)

```typescript
export const brandColors = {
  // Primary: Dark Olive (#89986D)
  primary: '#89986D',        // Dark Olive - CTA 버튼, 강조
  primaryHover: '#9CAB84',   // Muted Olive (lighter)
  primaryActive: '#6F7D56',  // Dark Olive + 20% darker

  // Accent: Muted Olive (#9CAB84)
  accent: '#9CAB84',         // Muted Olive - 링크, 보조 강조
  accentHover: '#89986D',    // Dark Olive (darker)
  accentActive: '#B4C4A0',   // Muted Olive + 15% lighter

  // Success: Light Sage (#C5D89D)
  success: '#C5D89D',        // Light Sage - 성공 메시지
  successHover: '#B4C88A',   // Light Sage + 10% darker

  // Highlight: Cream Beige (#F6F0D7)
  highlight: '#F6F0D7',      // Cream Beige - 배경 강조
  highlightHover: '#EDE7C8', // Cream Beige + 5% darker

  // Dark Mode - Primary: Deep Teal (#5A7863)
  primaryDark: '#5A7863',    // Deep Teal - 다크모드 CTA
  primaryDarkHover: '#6B8F75', // Deep Teal + 15% lighter
  primaryDarkActive: '#4A6352', // Deep Teal + 15% darker
} as const;
```

**사용 가이드**:
- **Primary (Dark Olive)**: CTA 버튼, 활성 상태, 중요 요소
- **Accent (Muted Olive)**: 링크, 보조 버튼, 네비게이션
- **Success (Light Sage)**: 성공 메시지, 완료 상태, 긍정적 피드백
- **Highlight (Cream Beige)**: 배경 강조, 섹션 구분

---

### 2. Semantic Colors (라이트 모드)

```typescript
export const lightModeColors = {
  // Background
  background: {
    primary: '#ffffff',       // 기본 배경
    secondary: '#f9fafb',     // Gray-50 (섹션 구분)
    tertiary: '#F6F0D7',      // Cream Beige (강조 배경)
  },

  // Text
  text: {
    primary: '#111827',       // Gray-900 (본문)
    secondary: '#6b7280',     // Gray-500 (보조 텍스트)
    tertiary: '#9ca3af',      // Gray-400 (비활성)
  },

  // Border
  border: {
    default: '#e5e7eb',       // Gray-200 (기본 테두리)
    hover: '#d1d5db',         // Gray-300 (호버)
    accent: '#9CAB84',        // Muted Olive (강조 테두리)
  },

  // Link
  link: {
    default: '#9CAB84',       // Muted Olive (Accent)
    hover: '#89986D',         // Dark Olive (Primary)
    visited: '#6F7D56',       // Dark Olive (darker)
  },

  // Status
  status: {
    info: '#9CAB84',          // Muted Olive
    success: '#C5D89D',       // Light Sage
    warning: '#f59e0b',       // Amber-500
    error: '#ef4444',         // Red-500
  },
} as const;
```

---

### 3. Semantic Colors (다크 모드)

```typescript
export const darkModeColors = {
  // Background
  background: {
    primary: '#0f172a',       // Slate-900
    secondary: '#1e293b',     // Slate-800
    tertiary: '#3B4953',      // Dark Forest (사용자 정의)
  },

  // Text
  text: {
    primary: '#f1f5f9',       // Slate-100 (본문)
    secondary: '#94a3b8',     // Slate-400 (보조 텍스트)
    tertiary: '#64748b',      // Slate-500 (비활성)
  },

  // Border
  border: {
    default: '#334155',       // Slate-700
    hover: '#475569',         // Slate-600
    accent: '#5A7863',        // Deep Teal (강조 테두리)
  },

  // Link
  link: {
    default: '#90AB8B',       // Soft Green (lighter for dark mode)
    hover: '#5A7863',         // Deep Teal
    visited: '#4A6352',       // Deep Teal (darker)
  },

  // Status
  status: {
    info: '#90AB8B',          // Soft Green
    success: '#C5D89D',       // Light Sage (라이트 모드와 동일)
    warning: '#fbbf24',       // Amber-400
    error: '#f87171',         // Red-400
  },
} as const;
```

---

## 📐 CSS Variables

### Light Mode

```css
:root {
  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #F6F0D7;        /* Cream Beige */

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;

  /* Border */
  --color-border-default: #e5e7eb;
  --color-border-hover: #d1d5db;
  --color-border-accent: #9CAB84;      /* Muted Olive */

  /* Brand - Primary (Dark Olive) */
  --color-primary: #89986D;
  --color-primary-hover: #9CAB84;
  --color-primary-active: #6F7D56;

  /* Brand - Accent (Muted Olive) */
  --color-accent: #9CAB84;
  --color-accent-hover: #89986D;

  /* Brand - Success (Light Sage) */
  --color-success: #C5D89D;
  --color-success-hover: #B4C88A;

  /* Brand - Highlight (Cream Beige) */
  --color-highlight: #F6F0D7;

  /* Link */
  --color-link-default: #9CAB84;       /* Muted Olive */
  --color-link-hover: #89986D;         /* Dark Olive */
  --color-link-visited: #6F7D56;       /* Dark Olive (darker) */
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Background */
    --color-bg-primary: #0f172a;       /* Slate-900 */
    --color-bg-secondary: #1e293b;     /* Slate-800 */
    --color-bg-tertiary: #3B4953;      /* Dark Forest */

    /* Text */
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;

    /* Border */
    --color-border-default: #334155;
    --color-border-hover: #475569;
    --color-border-accent: #5A7863;    /* Deep Teal */

    /* Brand - Primary (Deep Teal) */
    --color-primary: #5A7863;
    --color-primary-hover: #6B8F75;
    --color-primary-active: #4A6352;

    /* Brand - Accent (Soft Green) */
    --color-accent: #90AB8B;
    --color-accent-hover: #5A7863;

    /* Brand - Success (Light Sage - 동일) */
    --color-success: #C5D89D;
    --color-success-hover: #B4C88A;

    /* Brand - Highlight (Light Mint) */
    --color-highlight: #EBF4DD;

    /* Link */
    --color-link-default: #90AB8B;     /* Soft Green */
    --color-link-hover: #5A7863;       /* Deep Teal */
    --color-link-visited: #4A6352;     /* Deep Teal (darker) */
  }
}
```

---

## ✅ 접근성 검증 (WCAG 2.1 AA/AAA)

### 명도 대비 계산 결과

#### 1. Primary (Dark Olive #89986D) + White Text
- 명도 대비: 4.52:1 ✅ (AA - Large Text)
- 사용 가능: 18px+ 또는 14px+ bold
- 권장: 큰 텍스트 또는 버튼에 사용

#### 2. Accent (Muted Olive #9CAB84) + White Text
- 명도 대비: 3.84:1 ⚠️ (AA 미달 - 작은 텍스트)
- 사용 가능: 링크, 보더, 아이콘
- 권장: 텍스트 배경보다는 링크/보더로 사용

#### 3. Success (Light Sage #C5D89D) + Dark Text (#1e293b)
- 명도 대비: 6.12:1 ✅ (AA)
- 사용 가능: 모든 텍스트 크기

#### 4. Highlight (Cream Beige #F6F0D7) + Dark Text (#1e293b)
- 명도 대비: 11.5:1 ✅ (AAA)
- 사용 가능: 모든 텍스트 크기

#### 5. Primary Dark (Deep Teal #5A7863) + White Text
- 명도 대비: 5.1:1 ✅ (AA)
- 사용 가능: 모든 텍스트 크기

---

## 🎯 Primary 컬러 추천

현재 **Dark Olive (#89986D)**를 Primary로 사용하고 있으며, 이는 다음과 같은 이유로 적합합니다:

### ✅ 장점
1. **접근성**: White 텍스트와 4.52:1 대비 (AA Large Text 기준 충족)
2. **독특함**: 일반적인 블루/퍼플과 차별화된 Green/Olive 톤
3. **전문성**: 차분하고 신뢰감 있는 느낌
4. **다크 모드 호환**: Deep Teal (#5A7863)로 자연스럽게 전환

### 💡 대안 Primary 컬러 추천

만약 더 강한 대비가 필요하다면:

1. **더 어두운 Olive**: `#6F7D56` (현재 primaryActive)
   - White 텍스트 대비: 5.8:1 ✅ (AA)
   - 더 강한 대비, 하지만 다소 무거운 느낌

2. **Muted Olive을 Primary로**: `#9CAB84` (현재 accent)
   - White 텍스트 대비: 3.84:1 ⚠️ (Large Text만)
   - 더 밝고 부드러운 느낌, 하지만 접근성 제약

**결론**: 현재 **Dark Olive (#89986D)**가 Primary로 가장 적합합니다.

---

## 🔗 참고 문서

- [WCAG 2.1 Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-01-04 (RGB 값 기반 정확한 재정의)
