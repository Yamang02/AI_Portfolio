# Revised Color Palette - 색상 팔레트 (개선안)

**작성일**: 2025-01-XX  
**작성자**: 사용자 요구사항 기반  
**최종 업데이트**: 2025-01-XX (Phase 4.5 Enhancement)

---

## 🔄 개선 목적

**문제**: 신뢰·차분함은 충분한데 "첫 화면에서 살아 움직이는 느낌"이 부족

**해결책**: 톤은 유지하되, Primary Green만 '명도·채도'를 한 단계 올림

---

## 🎨 Revised Green Palette (More Lively, Still Trustworthy)

### 핵심 방향

- **라이트 모드**: 노란기 ↑ (생동감), 회기 ↓ (탁함 제거)
- **다크 모드**: 청록 ↓, 초록 ↑, 회색기 제거 → "어둡지만 생명력 있음"
- **목표**: 첫 히어로에서 "숨 쉬는 느낌" 확보

---

## 1️⃣ 라이트 모드 — Fresh Olive Green

### 핵심 컬러

| 색상명 | Hex Code | 용도 |
|--------|----------|------|
| **Fresh Olive Green** | `#7FA874` | **Primary** - CTA 버튼, 강조 (더 밝고 생기있음) |
| **Muted Olive** | `#9EBF96` | Accent - 링크, 보조 강조 |
| **Light Sage** | `#A8D08D` | Success - 성공 메시지 |
| **Soft Green** | `#EEF5E8` | Highlight - 섹션 배경 |

### 라이트 모드 핵심 세트

```text
Background      #F7F9F4   (거의 흰색, 녹색기 아주 미세)
Text Primary    #1F2321   (더 부드러운 다크 그레이)
Border          #D9E2D6   (부드러운 그린 톤)

Primary         #7FA874   ✅ (NEW - Fresh Olive Green)
Primary Hover   #8FBF84
Primary Active  #678F5E

Accent          #9EBF96   (링크, 보조 강조)
Highlight       #EEF5E8   (섹션 배경)
Success         #A8D08D
```

### 기존 대비

- 기존 `#89986D` (Dark Olive) → `#7FA874` (Fresh Olive Green)
- **더 밝음**: 명도 증가
- **더 생기 있음**: 채도 증가, 노란기 추가
- **여전히 차분**: 신뢰감 유지

---

## 2️⃣ 다크 모드 — Vital Deep Green

### 핵심 컬러

| 색상명 | Hex Code | 용도 |
|--------|----------|------|
| **Vital Deep Green** | `#4E7F63` | **Primary** - CTA 버튼, 강조 (더 그린 중심, 생명력 있음) |
| **Accent** | `#7FB89A` | 링크, 보조 강조 |
| **Success** | `#9FD6B2` | 성공 메시지 |
| **Highlight** | `#1E3328` | 섹션 배경 |

### 다크 모드 핵심 세트

```text
Background      #0F1A14   (그린 기운 아주 약한 다크)
Background Alt  #16241C
Text Primary    #E6F1EA   (부드러운 라이트 그린 톤)
Border          #2E4A3B   (그린 톤 다크 보더)

Primary         #4E7F63   ✅ (NEW - Vital Deep Green)
Primary Hover   #5F9A78
Primary Active  #3E6650

Accent          #7FB89A
Highlight       #1E3328
Success         #9FD6B2
```

### 기존 대비

- 기존 `#5A7863` (Deep Teal) → `#4E7F63` (Vital Deep Green)
- **더 그린 중심**: 청록 기운 감소, 초록 기운 증가
- **덜 칙칙**: 회색기 제거
- **OLED/다크 배경에서 존재감 ↑**: 더 생명력 있는 느낌

---

## 3️⃣ "활기 있어 보이게 만드는" 사용 규칙

색만 바꾸면 절반만 성공이다. 아래 규칙을 같이 써야 **임팩트가 난다**.

### ✅ 이렇게 써라

- **Hero 메인 문장 한 줄만** Primary
- 스크롤로 내려가며 **문장 단위로 색 등장**
- 버튼은 여전히 절제 (Primary는 텍스트/라인에도 사용)

### ❌ 이렇게 쓰면 망함

- 카드 전체 배경에 Primary
- 모든 링크 동일한 초록
- 아이콘 전부 컬러 처리

---

## 4️⃣ CSS Variables

### Light Mode

```css
:root {
  /* Background */
  --color-bg-primary: #F7F9F4;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #EEF5E8;

  /* Text */
  --color-text-primary: #1F2321;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;

  /* Border */
  --color-border-default: #D9E2D6;
  --color-border-hover: #C5D4C0;
  --color-border-accent: #9EBF96;

  /* Brand - Primary (Fresh Olive Green) */
  --color-primary: #7FA874;
  --color-primary-hover: #8FBF84;
  --color-primary-active: #678F5E;

  /* Brand - Accent */
  --color-accent: #9EBF96;
  --color-accent-hover: #7FA874;

  /* Brand - Success */
  --color-success: #A8D08D;
  --color-success-hover: #98C07D;

  /* Brand - Highlight */
  --color-highlight: #EEF5E8;

  /* Link */
  --color-link-default: #9EBF96;
  --color-link-hover: #7FA874;
  --color-link-visited: #678F5E;
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Background */
    --color-bg-primary: #0F1A14;
    --color-bg-secondary: #16241C;
    --color-bg-tertiary: #1E3328;

    /* Text */
    --color-text-primary: #E6F1EA;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;

    /* Border */
    --color-border-default: #2E4A3B;
    --color-border-hover: #3A5A48;
    --color-border-accent: #4E7F63;

    /* Brand - Primary (Vital Deep Green) */
    --color-primary: #4E7F63;
    --color-primary-hover: #5F9A78;
    --color-primary-active: #3E6650;

    /* Brand - Accent */
    --color-accent: #7FB89A;
    --color-accent-hover: #4E7F63;

    /* Brand - Success */
    --color-success: #9FD6B2;
    --color-success-hover: #8FC6A2;

    /* Brand - Highlight */
    --color-highlight: #1E3328;

    /* Link */
    --color-link-default: #7FB89A;
    --color-link-hover: #4E7F63;
    --color-link-visited: #3E6650;
  }
}
```

---

## 5️⃣ TypeScript Tokens

```typescript
export const brandColors = {
  // Primary: Fresh Olive Green (#7FA874) - 라이트 모드
  primary: '#7FA874',
  primaryHover: '#8FBF84',
  primaryActive: '#678F5E',

  // Accent: Muted Olive (#9EBF96)
  accent: '#9EBF96',
  accentHover: '#7FA874',
  accentActive: '#B4D4A8',

  // Success: Light Sage (#A8D08D)
  success: '#A8D08D',
  successHover: '#98C07D',

  // Highlight: Soft Green (#EEF5E8)
  highlight: '#EEF5E8',
  highlightHover: '#E0EDD8',

  // Dark Mode - Primary: Vital Deep Green (#4E7F63)
  primaryDark: '#4E7F63',
  primaryDarkHover: '#5F9A78',
  primaryDarkActive: '#3E6650',
} as const;
```

---

## 6️⃣ 왜 이 조합이 "지금 단계에 맞는가"

- ✅ 기존 브랜드 철학 유지
- ✅ 신뢰/중립 유지
- ✅ **랜딩 히어로 임팩트 확실히 증가**
- ✅ 애니메이션과 결합 시 "정적인 초록" 탈피

---

## 7️⃣ 다음으로 가장 효과 큰 액션

색은 이제 충분히 좋아졌다. **임팩트 부족의 다음 원인은 100% 이것 중 하나다:**

1. 히어로 문장이 너무 작음
2. 스크롤 전환 타이밍이 너무 빠름
3. "색이 등장하는 순간"이 없음

→ **Scroll-driven animations** 구현으로 해결

---

## 🔗 참고 문서

- [Phase 4.5 Enhancement Design](../epic/portfolio-renewal-refactor/phase-4-5-enhancement-design.md)
- [기존 컬러 팔레트](./color-palette.md) (참고용)

---

**작성자**: 사용자 요구사항 기반  
**최종 업데이트**: 2025-01-XX (Phase 4.5 Enhancement)
