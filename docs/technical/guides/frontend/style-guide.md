# 프론트엔드 스타일 가이드

**작성일**: 2025-01-15  
**최종 업데이트**: 2026-01-14

> ⚠️ **중요**: 이 문서는 프로젝트의 스타일링 접근법과 일관성을 유지하기 위한 가이드입니다.

---

## 목차

1. [스타일 접근법 개요](#스타일-접근법-개요)
2. [CSS 모듈 우선 사용](#css-모듈-우선-사용)
3. [Tailwind CSS 사용 규칙](#tailwind-css-사용-규칙)
4. [인라인 스타일 사용 규칙](#인라인-스타일-사용-규칙)
5. [디자인 토큰 사용](#디자인-토큰-사용)
6. [스타일 마이그레이션 가이드](#스타일-마이그레이션-가이드)

---

## 스타일 접근법 개요

프로젝트는 **일관된 스타일 접근법**을 사용하여 유지보수성과 재사용성을 높입니다.

### 우선순위

1. **CSS 모듈** (`.module.css`) - 기본 스타일링 방법
2. **Tailwind CSS** - 유틸리티 클래스 (제한적 사용)
3. **인라인 스타일** - 동적 값에만 사용 (최소화)

### 원칙

- ✅ **CSS 모듈을 우선 사용**: 컴포넌트별 스타일은 CSS 모듈로 관리
- ✅ **Tailwind는 유틸리티용으로 제한**: 간단한 레이아웃, 간격 조정 등
- ✅ **인라인 스타일은 동적 값에만 사용**: 계산된 값, 조건부 스타일 등
- ❌ **하드코딩된 값 금지**: 컬러, 간격, 크기 등은 디자인 토큰 사용

---

## CSS 모듈 우선 사용

### 기본 원칙

**CSS 모듈은 모든 컴포넌트 스타일의 기본 방법입니다.**

```typescript
// ✅ Good: CSS 모듈 사용
import styles from './Component.module.css';

export const Component: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Title</h2>
    </div>
  );
};
```

```css
/* Component.module.css */
.container {
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border-radius: var(--border-radius-lg);
}

.title {
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}
```

### CSS 모듈 사용 시나리오

- ✅ 컴포넌트 전용 스타일
- ✅ 복잡한 레이아웃
- ✅ 반응형 디자인
- ✅ 애니메이션 및 트랜지션
- ✅ 상태별 스타일 (hover, active, disabled 등)

---

## Tailwind CSS 사용 규칙

### 제한적 사용 원칙

**Tailwind CSS는 유틸리티 클래스로만 사용하며, CSS 모듈을 대체하지 않습니다.**

```typescript
// ✅ Good: 간단한 유틸리티 클래스
<div className="flex items-center gap-4">
  <span>Item 1</span>
  <span>Item 2</span>
</div>

// ✅ Good: CSS 모듈과 Tailwind 조합
<div className={`${styles.card} flex items-center gap-4`}>
  <span>Content</span>
</div>
```

```typescript
// ❌ Bad: Tailwind로 복잡한 스타일 구현
<div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  {/* 복잡한 스타일은 CSS 모듈로 */}
</div>
```

### Tailwind 사용 시나리오

- ✅ 간단한 레이아웃 (flex, grid)
- ✅ 간격 조정 (gap, margin, padding)
- ✅ 간단한 정렬 (items-center, justify-between)
- ✅ 반응형 유틸리티 (md:, lg: 등)
- ❌ 복잡한 스타일 (CSS 모듈 사용)
- ❌ 디자인 토큰이 필요한 경우 (CSS 변수 사용)

---

## 인라인 스타일 사용 규칙

### 최소화 원칙

**인라인 스타일은 동적 값에만 사용하며, 가능한 한 CSS 모듈로 대체합니다.**

```typescript
// ✅ Good: 동적 값 (계산된 값)
<div style={{ width: `${calculatedWidth}px` }}>
  Content
</div>

// ✅ Good: 조건부 스타일 (간단한 경우)
<div style={{ display: isVisible ? 'block' : 'none' }}>
  Content
</div>

// ❌ Bad: 정적 값 (CSS 모듈로 이동)
<div style={{ padding: '16px', backgroundColor: '#fff' }}>
  Content
</div>
```

### 인라인 스타일 사용 시나리오

- ✅ 계산된 값 (width, height, transform 등)
- ✅ 조건부 스타일 (간단한 경우)
- ✅ 애니메이션 값 (동적 transform, opacity 등)
- ❌ 정적 값 (CSS 모듈로 이동)
- ❌ 복잡한 스타일 (CSS 모듈로 이동)

### 인라인 스타일 마이그레이션

인라인 스타일을 발견하면 다음 단계로 마이그레이션:

1. **CSS 모듈 클래스 생성**
2. **정적 값은 CSS 변수 또는 디자인 토큰 사용**
3. **동적 값만 인라인 스타일 유지**

```typescript
// Before: 인라인 스타일
<div style={{ 
  position: 'absolute', 
  top: '50%', 
  left: '50%', 
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  zIndex: 20
}}>
  Content
</div>

// After: CSS 모듈
<div className={styles.overlay}>
  Content
</div>
```

```css
/* Component.module.css */
.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  z-index: 20;
}
```

---

## 디자인 토큰 사용

### 컬러

**모든 컬러는 CSS 변수를 사용합니다.**

```typescript
// ✅ Good: CSS 변수 사용
style={{ color: 'var(--color-text-primary)' }}
className={styles.text} // CSS에서 var(--color-text-primary) 사용

// ❌ Bad: 하드코딩된 컬러
style={{ color: '#111827' }}
```

### 간격 및 크기

**간격과 크기는 디자인 토큰을 사용합니다.**

```typescript
// ✅ Good: CSS 변수 사용
style={{ padding: 'var(--spacing-4)' }}
className={styles.container} // CSS에서 var(--spacing-4) 사용

// ✅ Good: 디자인 토큰 import
import { spacing } from '@/design-system/tokens';
style={{ padding: spacing[4] }}

// ❌ Bad: 하드코딩된 값
style={{ padding: '16px' }}
```

### 기타 토큰

- `--border-radius-*`: 둥근 모서리
- `--shadow-*`: 그림자
- `--font-size-*`: 폰트 크기
- `--font-weight-*`: 폰트 굵기

---

## 스타일 마이그레이션 가이드

### 단계별 마이그레이션

1. **인라인 스타일 식별**
   - 정적 값과 동적 값 구분
   - 반복되는 패턴 확인

2. **CSS 모듈 클래스 생성**
   - `.module.css` 파일에 클래스 추가
   - 디자인 토큰 사용

3. **컴포넌트 업데이트**
   - 인라인 스타일 제거
   - CSS 모듈 클래스 적용

4. **테스트**
   - 시각적 회귀 테스트
   - 반응형 동작 확인

### 마이그레이션 예시

```typescript
// Before
<div style={{ 
  position: 'relative',
  padding: '16px',
  backgroundColor: '#fff',
  borderRadius: '8px'
}}>
  <span style={{ fontSize: '0.875rem', color: '#4A5F52' }}>
    Text
  </span>
</div>

// After
<div className={styles.card}>
  <span className={styles.text}>Text</span>
</div>
```

```css
/* Component.module.css */
.card {
  position: relative;
  padding: var(--spacing-4);
  background-color: var(--color-bg-primary);
  border-radius: var(--border-radius-lg);
}

.text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

---

## 체크리스트

새 컴포넌트를 작성하거나 기존 컴포넌트를 수정할 때:

- [ ] CSS 모듈을 기본 스타일링 방법으로 사용했는가?
- [ ] Tailwind는 유틸리티 클래스로만 제한적으로 사용했는가?
- [ ] 인라인 스타일은 동적 값에만 사용했는가?
- [ ] 하드코딩된 컬러 값 없이 CSS 변수를 사용했는가?
- [ ] 하드코딩된 간격/크기 없이 디자인 토큰을 사용했는가?
- [ ] 반복되는 스타일 패턴을 공통 컴포넌트로 추출했는가?

---

## 관련 문서

- [디자인 시스템 사용 가이드](../design-system/usage-guide.md)
- [프론트엔드 아키텍처 가이드](./frontend-architecture-guide.md)
- [성능 최적화 가이드](./performance-optimization-guide.md)
