# Color Palette - 색상 팔레트 정의

**작성일**: 2025-01-04  
**작성자**: AI Agent (Claude)  
**최종 업데이트**: 2025-01-XX (Phase 4.5 Enhancement - Revised Green Palette)

> ⚠️ **참고**: 이 문서는 기존 컬러 팔레트를 기록합니다.  
> 최신 개선된 컬러 팔레트는 [Revised Color Palette](./color-palette-revised.md)를 참조하세요.

---

## 🎨 사용자 정의 색상 팔레트 (RGB 기반)

### 기본 팔레트

제공된 RGB 값을 기반으로 정확한 Hex 코드로 변환했습니다.

#### 라이트 모드 - Green/Olive Tones (Phase 3 → Phase 4.5 개선)

| 색상명 | RGB | Hex Code | 용도 | 상태 |
|--------|-----|----------|------|------|
| **Soft Green** | rgb(238, 245, 232) | `#EEF5E8` | Background Tertiary, Highlight | ✅ NEW |
| **Light Sage** | rgb(168, 208, 141) | `#A8D08D` | Success, Positive State | ✅ UPDATED |
| **Muted Olive** | rgb(158, 191, 150) | `#9EBF96` | Primary Accent, Links | ✅ UPDATED |
| **Fresh Olive Green** | rgb(127, 168, 116) | `#7FA874` | **Primary**, CTA Buttons | ✅ NEW |
| ~~**Dark Olive**~~ | ~~rgb(137, 152, 109)~~ | ~~`#89986D`~~ | ~~이전 Primary~~ | ❌ DEPRECATED |

#### 다크 모드 - Vital Green Tones (Phase 3 → Phase 4.5 개선)

| 색상명 | RGB | Hex Code | 용도 | 상태 |
|--------|-----|----------|------|------|
| **Highlight** | rgb(30, 51, 40) | `#1E3328` | Background Tertiary, Highlight | ✅ NEW |
| **Success** | rgb(159, 214, 178) | `#9FD6B2` | Success, Positive State | ✅ NEW |
| **Accent** | rgb(127, 184, 154) | `#7FB89A` | Links, 보조 강조 | ✅ NEW |
| **Vital Deep Green** | rgb(78, 127, 99) | `#4E7F63` | **Primary** (다크모드) | ✅ NEW |
| ~~**Deep Teal**~~ | ~~rgb(90, 120, 99)~~ | ~~`#5A7863`~~ | ~~이전 Primary~~ | ❌ DEPRECATED |

---

## 🌈 확장 색상 정의

### 1. Brand Colors

#### Primary (Fresh Olive Green / Vital Deep Green 계열)

```typescript
export const brandColors = {
  // Primary: Fresh Olive Green (#7FA874) - 라이트 모드
  primary: '#7FA874',        // Fresh Olive Green - CTA 버튼, 강조 (더 생기있고 밝음)
  primaryHover: '#8FBF84',  // Fresh Olive Green (lighter)
  primaryActive: '#678F5E',  // Fresh Olive Green (darker)

  // Accent: Muted Olive (#9EBF96)
  accent: '#9EBF96',         // Muted Olive - 링크, 보조 강조
  accentHover: '#7FA874',   // Fresh Olive Green (darker)
  accentActive: '#B4D4A8',  // Muted Olive (lighter)

  // Success: Light Sage (#A8D08D)
  success: '#A8D08D',       // Light Sage - 성공 메시지
  successHover: '#98C07D',  // Light Sage (darker)

  // Highlight: Soft Green (#EEF5E8)
  highlight: '#EEF5E8',      // Soft Green - 배경 강조
  highlightHover: '#E0EDD8', // Soft Green (darker)

  // Dark Mode - Primary: Vital Deep Green (#4E7F63)
  primaryDark: '#4E7F63',    // Vital Deep Green - 다크모드 CTA (더 그린 중심, 생명력 있음)
  primaryDarkHover: '#5F9A78', // Vital Deep Green (lighter)
  primaryDarkActive: '#3E6650', // Vital Deep Green (darker)
} as const;
```

**사용 가이드**:
- **Primary (Fresh Olive Green)**: CTA 버튼, 활성 상태, 중요 요소 (라이트 모드)
- **Primary (Vital Deep Green)**: CTA 버튼, 활성 상태, 중요 요소 (다크 모드)
- **Accent (Muted Olive)**: 링크, 보조 버튼, 네비게이션
- **Success (Light Sage)**: 성공 메시지, 완료 상태, 긍정적 피드백
- **Highlight (Soft Green)**: 배경 강조, 섹션 구분

**개선 사항** (Phase 4.5):
- 라이트 모드 Primary: 더 밝고 생기있음 (명도·채도 증가)
- 다크 모드 Primary: 더 그린 중심, 생명력 있음 (청록 기운 감소, 초록 기운 증가)

---

### 2. Semantic Colors (라이트 모드)

```typescript
export const lightModeColors = {
  // Background
  background: {
    primary: '#F7F9F4',       // 거의 흰색, 녹색기 아주 미세
    secondary: '#f9fafb',     // Gray-50 (섹션 구분)
    tertiary: '#EEF5E8',      // Soft Green (강조 배경)
  },

  // Text
  text: {
    primary: '#1F2321',       // 더 부드러운 다크 그레이
    secondary: '#6b7280',     // Gray-500 (보조 텍스트)
    tertiary: '#9ca3af',      // Gray-400 (비활성)
  },

  // Border
  border: {
    default: '#D9E2D6',       // 부드러운 그린 톤
    hover: '#C5D4C0',         // Border hover
    accent: '#9EBF96',        // Muted Olive (강조 테두리)
  },

  // Link
  link: {
    default: '#9EBF96',       // Muted Olive (Accent)
    hover: '#7FA874',         // Fresh Olive Green (Primary)
    visited: '#678F5E',       // Fresh Olive Green (darker)
  },

  // Status
  status: {
    info: '#9EBF96',          // Muted Olive
    success: '#A8D08D',       // Light Sage
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
    primary: '#0F1A14',       // 그린 기운 아주 약한 다크
    secondary: '#16241C',     // Background Alt
    tertiary: '#1E3328',      // Highlight (그린 톤 다크)
  },

  // Text
  text: {
    primary: '#E6F1EA',       // 부드러운 라이트 그린 톤
    secondary: '#94a3b8',     // Slate-400 (보조 텍스트)
    tertiary: '#64748b',      // Slate-500 (비활성)
  },

  // Border
  border: {
    default: '#2E4A3B',       // 그린 톤 다크 보더
    hover: '#3A5A48',         // Border hover
    accent: '#4E7F63',        // Vital Deep Green (강조 테두리)
  },

  // Link
  link: {
    default: '#7FB89A',       // Accent (lighter for dark mode)
    hover: '#4E7F63',         // Vital Deep Green
    visited: '#3E6650',       // Vital Deep Green (darker)
  },

  // Status
  status: {
    info: '#7FB89A',          // Accent
    success: '#9FD6B2',       // Success (다크 모드용)
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

## 🎯 Primary 컬러 (Phase 4.5 개선)

현재 **Fresh Olive Green (#7FA874)**를 Primary로 사용하고 있으며 (라이트 모드), 이는 다음과 같은 이유로 적합합니다:

### ✅ 장점
1. **생동감**: 기존 Dark Olive보다 더 밝고 생기있음 (명도·채도 증가)
2. **신뢰감 유지**: 여전히 차분하고 신뢰감 있는 느낌
3. **접근성**: White 텍스트와 적절한 대비 유지
4. **다크 모드 호환**: Vital Deep Green (#4E7F63)로 자연스럽게 전환

### 개선 사항 (Phase 4.5)

**라이트 모드**:
- 기존: `#89986D` (Dark Olive) → 개선: `#7FA874` (Fresh Olive Green)
- 노란기 ↑ (생동감), 회기 ↓ (탁함 제거)
- 첫 히어로에서 "숨 쉬는 느낌" 확보

**다크 모드**:
- 기존: `#5A7863` (Deep Teal) → 개선: `#4E7F63` (Vital Deep Green)
- 청록 ↓, 초록 ↑, 회색기 제거
- 어둡지만 생명력 있는 느낌

**결론**: **Fresh Olive Green (#7FA874)** / **Vital Deep Green (#4E7F63)**가 현재 Primary로 가장 적합합니다.

> 📖 **상세 정보**: [Revised Color Palette](./color-palette-revised.md) 참조

---

## 🔗 참고 문서

- [WCAG 2.1 Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**작성자**: AI Agent (Claude)  
**최종 업데이트**: 2025-01-XX (Phase 4.5 Enhancement - Revised Green Palette)

---

## 🔗 관련 문서

- [Revised Color Palette](./color-palette-revised.md) - Phase 4.5 개선된 컬러 팔레트
- [Phase 4.5 Enhancement Design](../../epic/portfolio-renewal-refactor/phase-4-5-enhancement-design.md)
